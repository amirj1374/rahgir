package ir.rayan.businesscore.basedata.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

/**
 * Cached current stock of a product in a single warehouse. Maintained by the
 * inventory service as movements are recorded, so reads are a simple lookup
 * instead of summing the whole ledger every time.
 */
@Entity
@Table(name = "stock_levels", uniqueConstraints =
        @UniqueConstraint(columnNames = {"tenant_id", "productId", "variantId", "warehouseId"}))
@Getter @Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(of = {"id", "productId", "variantId", "warehouseId", "quantity"})
public class StockLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(nullable = false)
    private Long productId;

    /**
     * The variant this stock belongs to. {@code 0} means the product has no
     * variants and is stocked as a whole. A non-zero value tracks a specific
     * colour/size combination separately (e.g. white / S).
     */
    @Column(nullable = false)
    private Long variantId = 0L;

    @Column(nullable = false)
    private Long warehouseId;

    @Column(nullable = false)
    private BigDecimal quantity = BigDecimal.ZERO;
}
