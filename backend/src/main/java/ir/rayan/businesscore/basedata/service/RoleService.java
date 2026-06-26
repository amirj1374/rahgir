package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.RoleRequest;
import ir.rayan.businesscore.basedata.dto.response.PermissionResponse;
import ir.rayan.businesscore.basedata.dto.response.RoleResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Permission;
import ir.rayan.businesscore.basedata.model.Role;
import ir.rayan.businesscore.basedata.model.Tenant;
import ir.rayan.businesscore.basedata.repository.RoleRepository;
import ir.rayan.businesscore.basedata.repository.TenantRepository;
import ir.rayan.businesscore.basedata.repository.UserRepository;
import ir.rayan.businesscore.basedata.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;

/** Manages a tenant's custom roles. All operations are scoped to the caller's tenant. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleService {

    private final RoleRepository roleRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    public List<PermissionResponse> permissionCatalog() {
        return List.of(Permission.values()).stream().map(PermissionResponse::from).toList();
    }

    public List<RoleResponse> findAll() {
        return roleRepository.findByTenantId(currentUser.tenantId()).stream()
                .map(RoleResponse::from).toList();
    }

    @Transactional
    public RoleResponse create(RoleRequest request) {
        Long tenantId = currentUser.tenantId();
        if (roleRepository.existsByTenantIdAndName(tenantId, request.name())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "نقشی با این نام قبلاً تعریف شده است");
        }
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));
        Role role = new Role();
        role.setTenant(tenant);
        role.setName(request.name());
        role.setPermissions(request.permissions() == null ? new HashSet<>() : new HashSet<>(request.permissions()));
        return RoleResponse.from(roleRepository.save(role));
    }

    @Transactional
    public RoleResponse update(Long id, RoleRequest request) {
        Role role = findOwned(id);
        role.setName(request.name());
        role.setPermissions(request.permissions() == null ? new HashSet<>() : new HashSet<>(request.permissions()));
        return RoleResponse.from(roleRepository.save(role));
    }

    @Transactional
    public void delete(Long id) {
        Role role = findOwned(id);
        if (role.isBuiltin()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "نقش‌های پیش‌فرض قابل حذف نیستند");
        }
        if (userRepository.existsByRoleId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "این نقش به کاربرانی اختصاص داده شده و قابل حذف نیست");
        }
        roleRepository.delete(role);
    }

    private Role findOwned(Long id) {
        return roleRepository.findByIdAndTenantId(id, currentUser.tenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Role", id));
    }
}
