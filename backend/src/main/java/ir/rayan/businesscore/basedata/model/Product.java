package ir.rayan.businesscore.basedata.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String sku;

    private String category;
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private ProductType type = ProductType.SIMPLE;

    @Enumerated(EnumType.STRING)
    private ProductSource source = ProductSource.MANUAL;

    @Enumerated(EnumType.STRING)
    private ProductStatus status = ProductStatus.ACTIVE;

    private String description;
    private Integer stock = 0;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();

    public enum ProductType { SIMPLE, VARIABLE }
    public enum ProductSource { MANUAL, WOOCOMMERCE }
    public enum ProductStatus { ACTIVE, INACTIVE, OUT_OF_STOCK }
}
