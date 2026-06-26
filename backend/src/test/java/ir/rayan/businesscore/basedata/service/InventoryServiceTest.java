package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.StockMovementRequest;
import ir.rayan.businesscore.basedata.dto.request.StockTransferRequest;
import ir.rayan.businesscore.basedata.dto.response.StockLevelResponse;
import ir.rayan.businesscore.basedata.model.Product;
import ir.rayan.businesscore.basedata.model.ProductVariant;
import ir.rayan.businesscore.basedata.model.StockMovement;
import ir.rayan.businesscore.basedata.model.Warehouse;
import ir.rayan.businesscore.basedata.repository.*;
import ir.rayan.businesscore.basedata.support.WithMockTenantUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@WithMockTenantUser(authorities = {"INVENTORY"})
class InventoryServiceTest {

    @Autowired InventoryService service;
    @Autowired ProductRepository productRepo;
    @Autowired ProductVariantRepository variantRepo;
    @Autowired WarehouseRepository warehouseRepo;
    @Autowired StockLevelRepository levelRepo;
    @Autowired StockMovementRepository movementRepo;

    private Long productId;
    private Long whA;
    private Long whB;

    @BeforeEach
    void setup() {
        movementRepo.deleteAll();
        levelRepo.deleteAll();
        variantRepo.deleteAll();
        productRepo.deleteAll();
        warehouseRepo.deleteAll();

        Product p = new Product();
        p.setTenantId(1L);
        p.setName("کالای آزمون");
        p.setSku("TST-1");
        productId = productRepo.save(p).getId();

        whA = saveWarehouse("انبار الف");
        whB = saveWarehouse("انبار ب");
    }

    private Long saveVariant(Product p, String color, String size, int stock) {
        ProductVariant v = new ProductVariant();
        v.setProduct(p);
        v.setSku("V-" + color + "-" + size);
        v.setAttr1Name("رنگ"); v.setAttr1Value(color);
        v.setAttr2Name("سایز"); v.setAttr2Value(size);
        v.setStock(stock);
        return variantRepo.save(v).getId();
    }

    private Long saveWarehouse(String name) {
        Warehouse w = new Warehouse();
        w.setTenantId(1L);
        w.setName(name);
        return warehouseRepo.save(w).getId();
    }

    @Test
    void purchaseRaisesStockAndLogsBalance() {
        var resp = service.record(new StockMovementRequest(
                productId, null, whA, StockMovement.MovementType.PURCHASE, BigDecimal.valueOf(10), null));
        assertThat(resp.balanceAfter()).isEqualByComparingTo("10");

        StockLevelResponse level = stockOf(productId);
        assertThat(level.totalQuantity()).isEqualByComparingTo("10");
    }

    @Test
    void sellingMoreThanOnHandIsRejected() {
        service.record(new StockMovementRequest(productId, null, whA, StockMovement.MovementType.PURCHASE, BigDecimal.valueOf(3), null));
        assertThatThrownBy(() -> service.record(new StockMovementRequest(
                productId, null, whA, StockMovement.MovementType.SALE, BigDecimal.valueOf(5), null)))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void transferMovesStockBetweenWarehouses() {
        service.record(new StockMovementRequest(productId, null, whA, StockMovement.MovementType.PURCHASE, BigDecimal.valueOf(8), null));
        service.transfer(new StockTransferRequest(productId, null, whA, whB, BigDecimal.valueOf(5), null));

        StockLevelResponse level = stockOf(productId);
        assertThat(level.totalQuantity()).isEqualByComparingTo("8");
        // one variant row (no-variant), spread across two warehouses
        var perWh = level.variants().get(0).warehouses();
        BigDecimal inA = perWh.stream().filter(w -> w.warehouseId().equals(whA)).findFirst().orElseThrow().quantity();
        BigDecimal inB = perWh.stream().filter(w -> w.warehouseId().equals(whB)).findFirst().orElseThrow().quantity();
        assertThat(inA).isEqualByComparingTo("3");
        assertThat(inB).isEqualByComparingTo("5");
    }

    @Test
    void transferToSameWarehouseRejected() {
        assertThatThrownBy(() -> service.transfer(new StockTransferRequest(
                productId, null, whA, whA, BigDecimal.valueOf(1), null)))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void stockIsTrackedPerVariant() {
        Product shirt = new Product();
        shirt.setTenantId(1L);
        shirt.setName("تی‌شرت نایک");
        shirt.setSku("TSH");
        shirt.setType(Product.ProductType.VARIABLE);
        Long shirtId = productRepo.save(shirt).getId();
        Long whiteS = saveVariant(shirt, "سفید", "S", 0);
        Long blackL = saveVariant(shirt, "مشکی", "L", 0);

        service.record(new StockMovementRequest(shirtId, whiteS, whA, StockMovement.MovementType.PURCHASE, BigDecimal.valueOf(2), null));
        service.record(new StockMovementRequest(shirtId, blackL, whA, StockMovement.MovementType.PURCHASE, BigDecimal.valueOf(3), null));

        StockLevelResponse level = stockOf(shirtId);
        assertThat(level.hasVariants()).isTrue();
        assertThat(level.totalQuantity()).isEqualByComparingTo("5");
        assertThat(level.variants()).hasSize(2);
        BigDecimal white = level.variants().stream().filter(v -> whiteS.equals(v.variantId())).findFirst().orElseThrow().quantity();
        BigDecimal black = level.variants().stream().filter(v -> blackL.equals(v.variantId())).findFirst().orElseThrow().quantity();
        assertThat(white).isEqualByComparingTo("2");
        assertThat(black).isEqualByComparingTo("3");
    }

    private StockLevelResponse stockOf(Long pid) {
        return service.stockLevels().stream()
                .filter(l -> l.productId().equals(pid)).findFirst().orElseThrow();
    }
}
