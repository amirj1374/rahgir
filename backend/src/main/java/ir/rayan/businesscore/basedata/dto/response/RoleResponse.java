package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.Permission;
import ir.rayan.businesscore.basedata.model.Role;

import java.util.List;

public record RoleResponse(Long id, String name, boolean builtin, List<Permission> permissions) {
    public static RoleResponse from(Role r) {
        return new RoleResponse(r.getId(), r.getName(), r.isBuiltin(), List.copyOf(r.getPermissions()));
    }
}
