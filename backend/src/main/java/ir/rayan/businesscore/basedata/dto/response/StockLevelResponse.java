package ir.rayan.businesscore.basedata.dto.response;

import java.math.BigDecimal;
import java.util.List;

/**
 * Current stock of one product. For a product with no variants there is a
 * single variant row (variantId 0). For a variable product (e.g. a t-shirt)
 * each colour/size combination is its own row, each broken down per warehouse.
 */
public record StockLevelResponse(
        Long productId, String productName, String sku,
        boolean hasVariants, BigDecimal totalQuantity,
        List<VariantStock> variants
) {
    public record VariantStock(
            Long variantId, String variantLabel, String sku,
            BigDecimal quantity, List<PerWarehouse> warehouses
    ) {}

    public record PerWarehouse(Long warehouseId, String warehouseName, BigDecimal quantity) {}
}
