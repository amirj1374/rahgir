package ir.rayan.businesscore.basedata.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Getter @Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(of = {"id", "sku"})
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // SKU is unique per tenant (enforced at the product level), not globally,
    // so different businesses may reuse the same variant codes.
    private String sku;

    private String attr1Name;
    private String attr1Value;
    private String attr2Name;
    private String attr2Value;

    private BigDecimal price;
    private Integer stock = 0;
}
