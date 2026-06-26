package ir.rayan.businesscore.basedata.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String phone;
    private String email;
    private String city;
    private String address;

    @Enumerated(EnumType.STRING)
    private CustomerGroup group = CustomerGroup.RETAIL;

    @Enumerated(EnumType.STRING)
    private CustomerSource source = CustomerSource.MANUAL;

    private BigDecimal balance = BigDecimal.ZERO;
    private LocalDate lastOrderDate;

    public enum CustomerGroup { VIP, WHOLESALE, RETAIL }
    public enum CustomerSource { MANUAL, WOOCOMMERCE }
}
