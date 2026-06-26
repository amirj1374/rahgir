package ir.rayan.businesscore.basedata.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "companies")
@Data
@NoArgsConstructor
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
