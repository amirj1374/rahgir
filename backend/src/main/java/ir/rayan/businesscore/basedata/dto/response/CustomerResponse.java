package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.Customer;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CustomerResponse(
        Long id, String name, String phone, String email, String city, String address,
        Customer.CustomerGroup group, Customer.CustomerSource source,
        BigDecimal balance, LocalDate lastOrderDate
) {
    public static CustomerResponse from(Customer c) {
        return new CustomerResponse(
                c.getId(), c.getName(), c.getPhone(), c.getEmail(), c.getCity(), c.getAddress(),
                c.getGroup(), c.getSource(), c.getBalance(), c.getLastOrderDate());
    }
}
