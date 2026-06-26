package ir.rayan.businesscore.basedata.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequest(
        @NotBlank(message = "نام دسته‌بندی الزامی است") String name,
        String parentName
) {}
