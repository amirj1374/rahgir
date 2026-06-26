package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.InventoryStageRequest;
import ir.rayan.businesscore.basedata.dto.request.StageAdvanceRequest;
import ir.rayan.businesscore.basedata.dto.request.StockMovementRequest;
import ir.rayan.businesscore.basedata.dto.request.StockTransferRequest;
import ir.rayan.businesscore.basedata.dto.response.InventoryStageResponse;
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

    /** Sentinel variantId for products stocked as a whole (no variants). */
    private static final long NO_VARIANT = 0L;
    /** Sentinel stageId for stock that sits outside any defined pipeline stage. */
    private static final long UNSTAGED = 0L;

    private final StockMovementRepository movementRepo;
    private final StockLevelRepository levelRepo;
    private final InventoryStageRepository stageRepo;
    private final ProductRepository productRepo;
    private final ProductVariantRepository variantRepo;
    private final WarehouseRepository warehouseRepo;
    private final CurrentUser currentUser;

    // ─── Stages (each tenant builds its own pipeline) ─────────────────────────────

    public List<InventoryStageResponse> stages() {
        return stageRepo.findByTenantIdOrderByDirectionAscSequenceAsc(currentUser.tenantId())
                .stream().map(InventoryStageResponse::from).toList();
    }

    @Transactional
    public InventoryStageResponse createStage(InventoryStageRequest request) {
        InventoryStage stage = new InventoryStage();
        stage.setTenantId(currentUser.tenantId());
        applyStage(stage, request);
        return InventoryStageResponse.from(stageRepo.save(stage));
    }

    @Transactional
    public InventoryStageResponse updateStage(Long id, InventoryStageRequest request) {
        InventoryStage stage = stageRepo.findByIdAndTenantId(id, currentUser.tenantId())
                .orElseThrow(() -> new ResourceNotFoundException("InventoryStage", id));
        applyStage(stage, request);
        return InventoryStageResponse.from(stageRepo.save(stage));
    }

    @Transactional
    public void deleteStage(Long id) {
        InventoryStage stage = stageRepo.findByIdAndTenantId(id, currentUser.tenantId())
                .orElseThrow(() -> new ResourceNotFoundException("InventoryStage", id));
        boolean hasStock = levelRepo.findByTenantId(currentUser.tenantId()).stream()
                .anyMatch(l -> Objects.equals(l.getStageId(), id) && l.getQuantity().signum() > 0);
        if (hasStock) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "این مرحله موجودی دارد؛ ابتدا کالاها را به مرحله دیگری منتقل کنید");
        }
        stageRepo.delete(stage);
    }

    private void applyStage(InventoryStage stage, InventoryStageRequest request) {
        stage.setName(request.name());
        if (request.direction() != null) stage.setDirection(request.direction());
        if (request.sequence() != null) stage.setSequence(request.sequence());
        if (request.available() != null) stage.setAvailable(request.available());
    }

    // ─── Movements ────────────────────────────────────────────────────────────────

    public List<StockMovementResponse> movements() {
        return movementRepo.findByTenantIdOrderByCreatedAtDescIdDesc(currentUser.tenantId())
                .stream().map(StockMovementResponse::from).toList();
    }

    public List<StockMovementResponse> productMovements(Long productId) {
        return movementRepo.findByTenantIdAndProductIdOrderByCreatedAtDescIdDesc(currentUser.tenantId(), productId)
                .stream().map(StockMovementResponse::from).toList();
    }

    @Transactional
    public StockMovementResponse record(StockMovementRequest request) {
        Product product = requireProduct(request.productId());
        ProductVariant variant = resolveVariant(product, request.variantId());
        Warehouse warehouse = requireWarehouse(request.warehouseId());
        InventoryStage stage = resolveStageOrDefault(request.stageId());
        StockMovement movement = apply(product, variant, warehouse, stage, request.type(),
                request.quantity(), null, null, request.note());
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
        InventoryStage stage = resolveStageOrDefault(request.stageId());

        StockMovement out = apply(product, variant, from, stage, StockMovement.MovementType.TRANSFER_OUT,
                request.quantity(), null, "انتقال به " + to.getName(), request.note());
        StockMovement in = apply(product, variant, to, stage, StockMovement.MovementType.TRANSFER_IN,
                request.quantity(), null, "انتقال از " + from.getName(), request.note());
        return List.of(StockMovementResponse.from(out), StockMovementResponse.from(in));
    }

    /** Moves stock from one pipeline stage to the next, within the same warehouse. */
    @Transactional
    public List<StockMovementResponse> advance(StageAdvanceRequest request) {
        if (Objects.equals(request.fromStageId(), request.toStageId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "مرحله مبدأ و مقصد نمی‌توانند یکسان باشند");
        }
        Product product = requireProduct(request.productId());
        ProductVariant variant = resolveVariant(product, request.variantId());
        Warehouse warehouse = requireWarehouse(request.warehouseId());
        InventoryStage from = requireStage(request.fromStageId());
        InventoryStage to = requireStage(request.toStageId());

        StockMovement out = apply(product, variant, warehouse, from, StockMovement.MovementType.STAGE_OUT,
                request.quantity(), to.getId(), "انتقال به مرحله " + to.getName(), request.note());
        StockMovement in = apply(product, variant, warehouse, to, StockMovement.MovementType.STAGE_IN,
                request.quantity(), from.getId(), "انتقال از مرحله " + from.getName(), request.note());
        return List.of(StockMovementResponse.from(out), StockMovementResponse.from(in));
    }

    /**
     * Deducts sold quantities from the sellable (available) stage of the given
     * warehouse, since only stock that finished the inbound pipeline can be sold.
     */
    @Transactional
    public void recordSale(Invoice invoice, Warehouse warehouse) {
        InventoryStage sellable = sellableStage(invoice.getTenantId());
        for (InvoiceItem item : invoice.getItems()) {
            if (item.getProductId() == null) continue;
            Product product = productRepo.findByIdAndTenantId(item.getProductId(), invoice.getTenantId()).orElse(null);
            if (product == null) continue;
            ProductVariant variant = item.getVariantId() == null ? null
                    : variantRepo.findByIdAndProductId(item.getVariantId(), product.getId()).orElse(null);
            apply(product, variant, warehouse, sellable, StockMovement.MovementType.SALE,
                    item.getQuantity(), null, invoice.getNumber(), null);
        }
    }

    // ─── Stock levels ───────────────────────────────────────────────────────────────

    /**
     * Current stock grouped by product → variant, with both a per-stage and a
     * per-warehouse breakdown, plus the sellable (available) quantity.
     */
    public List<StockLevelResponse> stockLevels() {
        Long tenantId = currentUser.tenantId();
        Map<Long, String> warehouseNames = warehouseRepo.findByTenantId(tenantId).stream()
                .collect(Collectors.toMap(Warehouse::getId, Warehouse::getName));
        List<InventoryStage> stageList = stageRepo.findByTenantIdOrderByDirectionAscSequenceAsc(tenantId);
        Map<Long, InventoryStage> stageMap = stageList.stream()
                .collect(Collectors.toMap(InventoryStage::getId, s -> s));
        boolean hasStages = !stageList.isEmpty();

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
            BigDecimal productAvailable = BigDecimal.ZERO;

            for (Map.Entry<Long, List<StockLevel>> e : byVariant.entrySet()) {
                Long variantId = e.getKey();
                List<StockLevel> levels = e.getValue();
                BigDecimal qty = sum(levels);
                BigDecimal available = levels.stream()
                        .filter(l -> isAvailable(l.getStageId(), stageMap, hasStages))
                        .map(StockLevel::getQuantity).reduce(BigDecimal.ZERO, BigDecimal::add);
                productTotal = productTotal.add(qty);
                productAvailable = productAvailable.add(available);

                List<StockLevelResponse.StageStock> stages = levels.stream()
                        .collect(Collectors.groupingBy(StockLevel::getStageId))
                        .entrySet().stream()
                        .map(se -> new StockLevelResponse.StageStock(
                                se.getKey() == UNSTAGED ? null : se.getKey(),
                                stageName(se.getKey(), stageMap),
                                isAvailable(se.getKey(), stageMap, hasStages),
                                sum(se.getValue())))
                        .sorted(Comparator.comparing(StockLevelResponse.StageStock::stageName))
                        .toList();

                List<StockLevelResponse.PerWarehouse> perWh = levels.stream()
                        .collect(Collectors.groupingBy(StockLevel::getWarehouseId))
                        .entrySet().stream()
                        .map(we -> new StockLevelResponse.PerWarehouse(
                                we.getKey(), warehouseNames.getOrDefault(we.getKey(), "—"), sum(we.getValue())))
                        .toList();

                variantStocks.add(new StockLevelResponse.VariantStock(
                        variantId == NO_VARIANT ? null : variantId,
                        variantId == NO_VARIANT ? "—" : variantLabels.getOrDefault(variantId, "—"),
                        variantId == NO_VARIANT ? p.getSku() : variantSkus.get(variantId),
                        qty, available, stages, perWh));
            }
            out.add(new StockLevelResponse(p.getId(), p.getName(), p.getSku(),
                    !variants.isEmpty(), productTotal, productAvailable, variantStocks));
        }
        return out;
    }

    // ─── internals ──────────────────────────────────────────────────────────────────

    /** Applies one movement: updates the cached level and appends to the ledger. */
    private StockMovement apply(Product product, ProductVariant variant, Warehouse warehouse, InventoryStage stage,
                                StockMovement.MovementType type, BigDecimal quantity,
                                Long fromStageId, String reference, String note) {
        Long tenantId = currentUser.tenantId();
        long variantId = variant != null ? variant.getId() : NO_VARIANT;
        long stageId = stage != null ? stage.getId() : UNSTAGED;

        StockLevel level = levelRepo
                .findByTenantIdAndProductIdAndVariantIdAndWarehouseIdAndStageId(tenantId, product.getId(), variantId, warehouse.getId(), stageId)
                .orElseGet(() -> {
                    StockLevel l = new StockLevel();
                    l.setTenantId(tenantId);
                    l.setProductId(product.getId());
                    l.setVariantId(variantId);
                    l.setWarehouseId(warehouse.getId());
                    l.setStageId(stageId);
                    l.setQuantity(BigDecimal.ZERO);
                    return l;
                });

        BigDecimal delta = quantity.abs().multiply(BigDecimal.valueOf(type.direction()));
        BigDecimal newQty = level.getQuantity().add(delta);
        if (newQty.signum() < 0) {
            String what = product.getName()
                    + (variant != null ? " (" + labelOf(variant) + ")" : "")
                    + (stage != null ? " - مرحله " + stage.getName() : "");
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
        movement.setStageId(stageId);
        movement.setStageName(stage != null ? stage.getName() : null);
        movement.setFromStageId(fromStageId);
        movement.setType(type);
        movement.setQuantity(quantity.abs());
        movement.setReference(reference);
        movement.setNote(note);
        movement.setBalanceAfter(newQty);
        return movementRepo.save(movement);
    }

    /** A level is sellable if the tenant has no stages, it's unstaged, or its stage is available. */
    private boolean isAvailable(Long stageId, Map<Long, InventoryStage> stageMap, boolean hasStages) {
        if (!hasStages || stageId == null || stageId == UNSTAGED) return true;
        InventoryStage s = stageMap.get(stageId);
        return s != null && s.isAvailable();
    }

    /** The stage a sale draws from: the first available stage, or unstaged if none. */
    private InventoryStage sellableStage(Long tenantId) {
        return stageRepo.findByTenantIdAndAvailableTrue(tenantId).stream()
                .min(Comparator.comparing(InventoryStage::getSequence))
                .orElse(null);
    }

    /** For a manual receipt: the explicit stage, else the first stage, else unstaged. */
    private InventoryStage resolveStageOrDefault(Long stageId) {
        if (stageId != null && stageId != UNSTAGED) return requireStage(stageId);
        return stageRepo.findByTenantIdOrderByDirectionAscSequenceAsc(currentUser.tenantId())
                .stream().findFirst().orElse(null);
    }

    private InventoryStage requireStage(Long id) {
        if (id == null || id == UNSTAGED) return null;
        return stageRepo.findByIdAndTenantId(id, currentUser.tenantId())
                .orElseThrow(() -> new ResourceNotFoundException("InventoryStage", id));
    }

    private String stageName(Long stageId, Map<Long, InventoryStage> stageMap) {
        if (stageId == null || stageId == UNSTAGED) return "بدون مرحله";
        InventoryStage s = stageMap.get(stageId);
        return s != null ? s.getName() : "—";
    }

    private static BigDecimal sum(List<StockLevel> levels) {
        return levels.stream().map(StockLevel::getQuantity).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private ProductVariant resolveVariant(Product product, Long variantId) {
        if (variantId == null || variantId == NO_VARIANT) return null;
        return variantRepo.findByIdAndProductId(variantId, product.getId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", variantId));
    }

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
