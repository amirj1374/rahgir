package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.Permission;

/** A single entry of the permission catalog (name + Persian label). */
public record PermissionResponse(String name, String label) {
    public static PermissionResponse from(Permission p) {
        return new PermissionResponse(p.name(), p.getLabel());
    }
}
