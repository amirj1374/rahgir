package ir.rayan.businesscore.basedata.dto.request;

import ir.rayan.businesscore.basedata.model.Product;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "نام محصول الزامی است") String name,
        String sku,
        String category,
        BigDecimal price,
        Product.ProductType type,
        Product.ProductSource source,
        Product.ProductStatus status,
        String description,
        Integer stock
) {}
