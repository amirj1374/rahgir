package ir.rayan.businesscore.basedata.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CompanyRequest(
        @NotBlank(message = "نام شرکت الزامی است") String name,
        String nationalId,
        String registrationNumber,
        String phone,
        String email,
        String address,
        String currency,
        String fiscalYearStart,
        Integer vatRate
) {}
