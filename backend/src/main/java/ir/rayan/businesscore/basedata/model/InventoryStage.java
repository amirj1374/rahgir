package ir.rayan.businesscore.basedata.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * A user-defined step in a tenant's warehouse flow. Each business builds its own
 * ordered pipeline of inbound and outbound stages (e.g. customs → in-transit →
 * QC → in-stock, or picking → shipped). Stock is tracked per stage; exactly the
 * stage(s) flagged {@code available} count as sellable inventory, which is all
 * that sales and invoicing ever see.
 */
@Entity
@Table(name = "inventory_stages")
@Getter @Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(of = {"id", "name", "direction", "sequence"})
public class InventoryStage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(nullable = false)
    private String name;

    /** Whether this stage belongs to the receiving flow or the dispatch flow. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Direction direction = Direction.INBOUND;

    /** Order within its direction (lower = earlier in the pipeline). */
    @Column(nullable = false)
    private Integer sequence = 0;

    /** Stock sitting in an {@code available} stage is the sellable on-hand quantity. */
    @Column(nullable = false)
    private boolean available = false;

    public enum Direction {
        INBOUND("ورود به انبار"),
        OUTBOUND("خروج از انبار");

        private final String label;
        Direction(String label) { this.label = label; }
        public String getLabel() { return label; }
    }
}
