package ir.rayan.businesscore.basedata.dto.response;

import java.math.BigDecimal;
import java.util.List;

/**
 * Current stock of one product. For a variable product each colour/size is its
 * own variant row. Within a variant, stock is shown both as a total and broken
 * down per pipeline stage and per warehouse. {@code availableQuantity} is the
 * sellable on-hand quantity (stock sitting in an "available" stage) — the only
 * number sales and invoicing use.
 */
public record StockLevelResponse(
        Long productId, String productName, String sku,
        boolean hasVariants, BigDecimal totalQuantity, BigDecimal availableQuantity,
        List<VariantStock> variants
) {
    public record VariantStock(
            Long variantId, String variantLabel, String sku,
            BigDecimal quantity, BigDecimal availableQuantity,
            List<StageStock> stages, List<PerWarehouse> warehouses
    ) {}

    public record StageStock(Long stageId, String stageName, boolean available, BigDecimal quantity) {}

    public record PerWarehouse(Long warehouseId, String warehouseName, BigDecimal quantity) {}
}
