package ir.rayan.businesscore.basedata.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * A sales document — either a confirmed invoice (فاکتور فروش) or a
 * pro-forma/quote (پیش‌فاکتور). Money totals are stored, not recomputed on
 * read, so a historical document never changes when prices later change.
 */
@Entity
@Table(name = "invoices", uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "number"}))
@Getter @Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(of = {"id", "number", "total"})
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    /** Human-facing, per-tenant sequential document number, e.g. INV-1404-0007. */
    @Column(nullable = false)
    private String number;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceType type = InvoiceType.SALE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    private Long customerId;
    private String customerName;

    private LocalDate issueDate = LocalDate.now();
    private LocalDate dueDate;

    private BigDecimal subtotal = BigDecimal.ZERO;
    private BigDecimal discount = BigDecimal.ZERO;
    private BigDecimal taxAmount = BigDecimal.ZERO;
    private BigDecimal total = BigDecimal.ZERO;
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(length = 1000)
    private String notes;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceItem> items = new ArrayList<>();

    public BigDecimal balance() {
        return total.subtract(paidAmount);
    }

    public enum InvoiceType { SALE, PROFORMA }
    public enum InvoiceStatus { DRAFT, CONFIRMED, PARTIALLY_PAID, PAID, CANCELLED }
}
