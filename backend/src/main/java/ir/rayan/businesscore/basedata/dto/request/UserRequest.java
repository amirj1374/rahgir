package ir.rayan.businesscore.basedata.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserRequest(
        @NotBlank(message = "نام کاربری الزامی است") String username,
        String password,            // required on create, optional on update
        String fullName,
        String email,
        @NotNull(message = "نقش الزامی است") Long roleId,
        Boolean active
) {}
