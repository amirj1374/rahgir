package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.Company;

public record CompanyResponse(
        Long id, String name, String nationalId, String registrationNumber,
        String phone, String email, String address,
        String currency, String fiscalYearStart, Integer vatRate
) {
    public static CompanyResponse from(Company c) {
        return new CompanyResponse(
                c.getId(), c.getName(), c.getNationalId(), c.getRegistrationNumber(),
                c.getPhone(), c.getEmail(), c.getAddress(),
                c.getCurrency(), c.getFiscalYearStart(), c.getVatRate());
    }
}
