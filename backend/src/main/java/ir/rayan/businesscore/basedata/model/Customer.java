package ir.rayan.businesscore.basedata.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "customers")
@Getter @Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(of = {"id", "name"})
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(nullable = false)
    private String name;

    private String phone;
    private String email;
    private String city;
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_group")
    private CustomerGroup group = CustomerGroup.RETAIL;

    @Enumerated(EnumType.STRING)
    private CustomerSource source = CustomerSource.MANUAL;

    private BigDecimal balance = BigDecimal.ZERO;
    private LocalDate lastOrderDate;

    public enum CustomerGroup { VIP, WHOLESALE, RETAIL }
    public enum CustomerSource { MANUAL, WOOCOMMERCE }
}
