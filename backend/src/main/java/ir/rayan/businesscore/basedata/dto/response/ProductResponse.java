package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.Product;
import ir.rayan.businesscore.basedata.model.ProductVariant;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
        Long id, String name, String sku, String category, BigDecimal price,
        Product.ProductType type, Product.ProductSource source, Product.ProductStatus status,
        String description, Integer stock, List<VariantResponse> variants
) {
    public record VariantResponse(
            Long id, String sku, String attr1Name, String attr1Value,
            String attr2Name, String attr2Value, BigDecimal price, Integer stock
    ) {
        static VariantResponse from(ProductVariant v) {
            return new VariantResponse(v.getId(), v.getSku(), v.getAttr1Name(), v.getAttr1Value(),
                    v.getAttr2Name(), v.getAttr2Value(), v.getPrice(), v.getStock());
        }
    }

    public static ProductResponse from(Product p) {
        List<VariantResponse> variants = p.getVariants() == null ? List.of()
                : p.getVariants().stream().map(VariantResponse::from).toList();
        return new ProductResponse(
                p.getId(), p.getName(), p.getSku(), p.getCategory(), p.getPrice(),
                p.getType(), p.getSource(), p.getStatus(), p.getDescription(), p.getStock(), variants);
    }
}
