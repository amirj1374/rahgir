package ir.rayan.businesscore.basedata.dto.request;

import ir.rayan.businesscore.basedata.model.Permission;
import jakarta.validation.constraints.NotBlank;

import java.util.Set;

public record RoleRequest(
        @NotBlank(message = "نام نقش الزامی است") String name,
        Set<Permission> permissions
) {}
