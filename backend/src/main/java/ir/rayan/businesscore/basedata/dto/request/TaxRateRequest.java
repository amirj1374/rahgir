package ir.rayan.businesscore.basedata.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TaxRateRequest(
        @NotBlank(message = "نام نرخ مالیاتی الزامی است") String name,
        @NotNull(message = "نرخ الزامی است") Integer rate,
        String appliesTo,
        Boolean active
) {}
