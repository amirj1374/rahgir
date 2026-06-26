package ir.rayan.businesscore.basedata.dto.request;

import ir.rayan.businesscore.basedata.model.Customer;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CustomerRequest(
        @NotBlank(message = "نام مشتری الزامی است") String name,
        String phone,
        String email,
        String city,
        String address,
        Customer.CustomerGroup group,
        Customer.CustomerSource source,
        BigDecimal balance,
        LocalDate lastOrderDate
) {}
