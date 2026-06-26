package ir.rayan.businesscore.basedata.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "companies")
@Getter @Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(of = {"id", "name"})
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String nationalId;
    private String registrationNumber;
    private String phone;
    private String email;
    private String address;
    private String currency = "IRR";
    private String fiscalYearStart = "Farvardin";
    private Integer vatRate = 10;
}
