package ir.rayan.businesscore.basedata.dto.request;

import jakarta.validation.constraints.NotBlank;

public record WarehouseRequest(
        @NotBlank(message = "نام انبار الزامی است") String name,
        String location,
        String manager,
        Integer capacity,
        Boolean active
) {}
