package ir.rayan.businesscore.basedata.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tax_rates")
@Data
@NoArgsConstructor
public class TaxRate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private Integer rate = 0;
    private String appliesTo;
    private Boolean active = true;
}
