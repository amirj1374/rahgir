package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.Permission;
import ir.rayan.businesscore.basedata.model.User;

import java.time.LocalDateTime;
import java.util.List;

public record UserResponse(
        Long id, String username, String fullName, String email,
        Long tenantId, String tenantName,
        Long roleId, String roleName, List<Permission> permissions,
        boolean active, LocalDateTime lastLogin
) {
    public static UserResponse from(User u) {
        return new UserResponse(
                u.getId(), u.getUsername(), u.getFullName(), u.getEmail(),
                u.getTenant().getId(), u.getTenant().getName(),
                u.getRole().getId(), u.getRole().getName(),
                List.copyOf(u.getRole().getPermissions()),
                u.isActive(), u.getLastLogin());
    }
}
