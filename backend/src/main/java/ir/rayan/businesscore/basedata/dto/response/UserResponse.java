package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.Feature;
import ir.rayan.businesscore.basedata.model.Permission;
import ir.rayan.businesscore.basedata.model.User;

import java.time.LocalDateTime;
import java.util.List;

public record UserResponse(
        Long id, String username, String fullName, String email,
        Long tenantId, String tenantName, String tenantType, String planLabel,
        Long roleId, String roleName,
        List<Permission> permissions, List<Feature> features,
        boolean active, LocalDateTime lastLogin
) {
    public static UserResponse from(User u) {
        var tenant = u.getTenant();
        return new UserResponse(
                u.getId(), u.getUsername(), u.getFullName(), u.getEmail(),
                tenant.getId(), tenant.getName(), tenant.getType().getLabel(), tenant.getPlan().getLabel(),
                u.getRole().getId(), u.getRole().getName(),
                List.copyOf(u.getRole().getPermissions()),
                List.copyOf(tenant.getPlan().getFeatures()),
                u.isActive(), u.getLastLogin());
    }
}
