package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.StockMovementRequest;
import ir.rayan.businesscore.basedata.dto.request.StockTransferRequest;
import ir.rayan.businesscore.basedata.dto.response.StockLevelResponse;
import ir.rayan.businesscore.basedata.dto.response.StockMovementResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.*;
import ir.rayan.businesscore.basedata.repository.*;
import ir.rayan.businesscore.basedata.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryService {

    /** Sentinel variantId for products that are stocked as a whole (no variants). */
    private static final long NO_VARIANT = 0L;

    private final StockMovementRepository movementRepo;
    private final StockLevelRepository levelRepo;
    private final ProductRepository productRepo;
    private final ProductVariantRepository variantRepo;
    private final WarehouseRepository warehouseRepo;
    private final CurrentUser currentUser;

    public List<StockMovementResponse> movements() {
        return movementRepo.findByTenantIdOrderByCreatedAtDescIdDesc(currentUser.tenantId())
                .stream().map(StockMovementResponse::from).toList();
    }

    public List<StockMovementResponse> productMovements(Long productId) {
        return movementRepo.findByTenantIdAndProductIdOrderByCreatedAtDescIdDesc(currentUser.tenantId(), productId)
                .stream().map(StockMovementResponse::from).toList();
    }

    /**
     * Current stock grouped by product → variant → warehouse. A variable product
     * (e.g. a t-shirt) shows one row per colour/size combination so you can see
     * "10 shirts = 2 white/S + 3 black/L + …"; a simple product shows one row.
     */
    public List<StockLevelResponse> stockLevels() {
        Long tenantId = currentUser.tenantId();
        Map<Long, String> warehouseNames = warehouseRepo.findByTenantId(tenantId).stream()
                .collect(Collectors.toMap(Warehouse::getId, Warehouse::getName));
        Map<Long, List<StockLevel>> byProduct = levelRepo.findByTenantId(tenantId).stream()
                .collect(Collectors.groupingBy(StockLevel::getProductId));

        List<StockLevelResponse> out = new ArrayList<>();
        for (Product p : productRepo.findByTenantId(tenantId)) {
            List<ProductVariant> variants = variantRepo.findByProductId(p.getId());
            Map<Long, String> variantLabels = variants.stream()
                    .collect(Collectors.toMap(ProductVariant::getId, this::labelOf));
            Map<Long, String> variantSkus = variants.stream()
                    .filter(v -> v.getSku() != null)
                    .collect(Collectors.toMap(ProductVariant::getId, ProductVariant::getSku));

            Map<Long, List<StockLevel>> byVariant = byProduct.getOrDefault(p.getId(), List.of())
                    .stream().collect(Collectors.groupingBy(StockLevel::getVariantId));

            List<StockLevelResponse.VariantStock> variantStocks = new ArrayList<>();
            BigDecimal productTotal = BigDecimal.ZERO;
            for (Map.Entry<Long, List<StockLevel>> e : byVariant.entrySet()) {
                Long variantId = e.getKey();
                BigDecimal qty = e.getValue().stream().map(StockLevel::getQuantity).reduce(BigDecimal.ZERO, BigDecimal::add);
                productTotal = productTotal.add(qty);
                List<StockLevelResponse.PerWarehouse> perWh = e.getValue().stream()
                        .map(l -> new StockLevelResponse.PerWarehouse(
                                l.getWarehouseId(), warehouseNames.getOrDefault(l.getWarehouseId(), "—"), l.getQuantity()))
                        .toList();
                variantStocks.add(new StockLevelResponse.VariantStock(
                        variantId == NO_VARIANT ? null : variantId,
                        variantId == NO_VARIANT ? "—" : variantLabels.getOrDefault(variantId, "—"),
                        variantId == NO_VARIANT ? p.getSku() : variantSkus.get(variantId),
                        qty, perWh));
            }
            out.add(new StockLevelResponse(p.getId(), p.getName(), p.getSku(),
                    !variants.isEmpty(), productTotal, variantStocks));
        }
        return out;
    }

    @Transactional
    public StockMovementResponse record(StockMovementRequest request) {
        Product product = requireProduct(request.productId());
        ProductVariant variant = resolveVariant(product, request.variantId());
        Warehouse warehouse = requireWarehouse(request.warehouseId());
        StockMovement movement = apply(product, variant, warehouse, request.type(),
                request.quantity(), null, request.note());
        return StockMovementResponse.from(movement);
    }

    @Transactional
    public List<StockMovementResponse> transfer(StockTransferRequest request) {
        if (Objects.equals(request.fromWarehouseId(), request.toWarehouseId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "انبار مبدأ و مقصد نمی‌توانند یکسان باشند");
        }
        Product product = requireProduct(request.productId());
        ProductVariant variant = resolveVariant(product, request.variantId());
        Warehouse from = requireWarehouse(request.fromWarehouseId());
        Warehouse to = requireWarehouse(request.toWarehouseId());

        StockMovement out = apply(product, variant, from, StockMovement.MovementType.TRANSFER_OUT,
                request.quantity(), "انتقال به " + to.getName(), request.note());
        StockMovement in = apply(product, variant, to, StockMovement.MovementType.TRANSFER_IN,
                request.quantity(), "انتقال از " + from.getName(), request.note());
        return List.of(StockMovementResponse.from(out), StockMovementResponse.from(in));
    }

    /**
     * Deducts sold quantities from the given warehouse. Called by the sales flow
     * when an invoice is confirmed. Lines without a product id are skipped; a line
     * with a variant id deducts that specific variant.
     */
    @Transactional
    public void recordSale(Invoice invoice, Warehouse warehouse) {
        for (InvoiceItem item : invoice.getItems()) {
            if (item.getProductId() == null) continue;
            Product product = productRepo.findByIdAndTenantId(item.getProductId(), invoice.getTenantId()).orElse(null);
            if (product == null) continue;
            ProductVariant variant = item.getVariantId() == null ? null
                    : variantRepo.findByIdAndProductId(item.getVariantId(), product.getId()).orElse(null);
            apply(product, variant, warehouse, StockMovement.MovementType.SALE,
                    item.getQuantity(), invoice.getNumber(), null);
        }
    }

    /** Applies one movement: updates the cached level and appends to the ledger. */
    private StockMovement apply(Product product, ProductVariant variant, Warehouse warehouse,
                                StockMovement.MovementType type, BigDecimal quantity,
                                String reference, String note) {
        Long tenantId = currentUser.tenantId();
        long variantId = variant != null ? variant.getId() : NO_VARIANT;

        StockLevel level = levelRepo
                .findByTenantIdAndProductIdAndVariantIdAndWarehouseId(tenantId, product.getId(), variantId, warehouse.getId())
                .orElseGet(() -> {
                    StockLevel l = new StockLevel();
                    l.setTenantId(tenantId);
                    l.setProductId(product.getId());
                    l.setVariantId(variantId);
                    l.setWarehouseId(warehouse.getId());
                    l.setQuantity(BigDecimal.ZERO);
                    return l;
                });

        BigDecimal delta = quantity.abs().multiply(BigDecimal.valueOf(type.direction()));
        BigDecimal newQty = level.getQuantity().add(delta);
        if (newQty.signum() < 0) {
            String what = product.getName() + (variant != null ? " (" + labelOf(variant) + ")" : "");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "موجودی کافی نیست: «" + what + "» در انبار «" + warehouse.getName() + "»");
        }
        level.setQuantity(newQty);
        levelRepo.save(level);

        StockMovement movement = new StockMovement();
        movement.setTenantId(tenantId);
        movement.setProductId(product.getId());
        movement.setProductName(product.getName());
        movement.setSku(variant != null && variant.getSku() != null ? variant.getSku() : product.getSku());
        movement.setVariantId(variantId);
        movement.setVariantLabel(variant != null ? labelOf(variant) : null);
        movement.setWarehouseId(warehouse.getId());
        movement.setWarehouseName(warehouse.getName());
        movement.setType(type);
        movement.setQuantity(quantity.abs());
        movement.setReference(reference);
        movement.setNote(note);
        movement.setBalanceAfter(newQty);
        return movementRepo.save(movement);
    }

    /** Validates that the requested variant belongs to the product; null/0 → no variant. */
    private ProductVariant resolveVariant(Product product, Long variantId) {
        if (variantId == null || variantId == NO_VARIANT) return null;
        return variantRepo.findByIdAndProductId(variantId, product.getId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", variantId));
    }

    /** "رنگ‌مقدار / سایزمقدار", skipping empty attributes. */
    private String labelOf(ProductVariant v) {
        return Stream.of(v.getAttr1Value(), v.getAttr2Value())
                .filter(Objects::nonNull)
                .filter(s -> !s.isBlank())
                .collect(Collectors.joining(" / "));
    }

    private Product requireProduct(Long id) {
        return productRepo.findByIdAndTenantId(id, currentUser.tenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private Warehouse requireWarehouse(Long id) {
        return warehouseRepo.findByIdAndTenantId(id, currentUser.tenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", id));
    }
}
