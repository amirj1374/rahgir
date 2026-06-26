package ir.rayan.businesscore.basedata.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * One immutable line in the stock ledger: a quantity of a product entering or
 * leaving a warehouse for a reason. Current stock is the running sum of these,
 * cached on {@link StockLevel}. Product/warehouse names are snapshotted so the
 * history stays readable even if the source record is later renamed.
 */
@Entity
@Table(name = "stock_movements")
@Getter @Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(of = {"id", "type", "productName", "quantity"})
public class StockMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(nullable = false)
    private Long productId;
    private String productName;
    private String sku;

    /** Variant this movement applies to; {@code 0} for a product with no variants. */
    @Column(nullable = false)
    private Long variantId = 0L;
    /** Human-readable variant, e.g. "سفید / S", snapshotted for the ledger. */
    private String variantLabel;

    @Column(nullable = false)
    private Long warehouseId;
    private String warehouseName;

    /** Pipeline stage this movement landed in ({@code 0} = unstaged). */
    @Column(nullable = false)
    private Long stageId = 0L;
    private String stageName;
    /** For an advance between stages, the stage the goods left. */
    private Long fromStageId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovementType type;

    /** Always positive; {@link MovementType#direction()} decides the sign. */
    @Column(nullable = false)
    private BigDecimal quantity = BigDecimal.ZERO;

    /** Where the movement came from, e.g. an invoice number or "تعدیل دستی". */
    private String reference;
    private String note;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Stock in this warehouse right after the movement was applied. */
    private BigDecimal balanceAfter;

    public enum MovementType {
        PURCHASE(+1, "خرید / ورود"),
        SALE(-1, "فروش / خروج"),
        ADJUST_IN(+1, "تعدیل (افزایش)"),
        ADJUST_OUT(-1, "تعدیل (کاهش)"),
        TRANSFER_IN(+1, "انتقال ورودی"),
        TRANSFER_OUT(-1, "انتقال خروجی"),
        STAGE_IN(+1, "ورود به مرحله"),
        STAGE_OUT(-1, "خروج از مرحله"),
        RETURN_IN(+1, "مرجوعی فروش");

        private final int direction;
        private final String label;

        MovementType(int direction, String label) {
            this.direction = direction;
            this.label = label;
        }

        public int direction() {
            return direction;
        }

        public String getLabel() {
            return label;
        }
    }
}
