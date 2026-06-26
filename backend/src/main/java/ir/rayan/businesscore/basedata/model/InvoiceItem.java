package ir.rayan.businesscore.basedata.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

/** A single line on an {@link Invoice}. Product name/sku are snapshotted. */
@Entity
@Table(name = "invoice_items")
@Getter @Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(of = {"id", "productName", "quantity", "lineTotal"})
public class InvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    private Long productId;
    private Long variantId;
    private String variantLabel;
    private String productName;
    private String sku;

    private BigDecimal quantity = BigDecimal.ONE;
    private BigDecimal unitPrice = BigDecimal.ZERO;
    /** Per-line discount amount (absolute, in currency). */
    private BigDecimal discount = BigDecimal.ZERO;
    /** Tax rate applied to this line, as a percentage (e.g. 10 = 10%). */
    private Integer taxRate = 0;

    /** (quantity × unitPrice − discount) + line tax. */
    private BigDecimal lineTotal = BigDecimal.ZERO;
}
