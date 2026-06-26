package ir.rayan.businesscore.basedata.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "نام کاربری الزامی است") String username,
        @NotBlank(message = "رمز عبور الزامی است") String password
) {}
