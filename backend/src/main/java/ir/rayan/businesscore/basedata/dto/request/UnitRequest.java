package ir.rayan.businesscore.basedata.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UnitRequest(
        @NotBlank(message = "نام واحد الزامی است") String name,
        String symbol,
        String type
) {}
