package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.UserRequest;
import ir.rayan.businesscore.basedata.dto.response.UserResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Role;
import ir.rayan.businesscore.basedata.model.Tenant;
import ir.rayan.businesscore.basedata.model.User;
import ir.rayan.businesscore.basedata.repository.RoleRepository;
import ir.rayan.businesscore.basedata.repository.TenantRepository;
import ir.rayan.businesscore.basedata.repository.UserRepository;
import ir.rayan.businesscore.basedata.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/** Manages users within the caller's tenant. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository repository;
    private final RoleRepository roleRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUser currentUser;

    public List<UserResponse> findAll() {
        return repository.findByTenantId(currentUser.tenantId()).stream().map(UserResponse::from).toList();
    }

    @Transactional
    public UserResponse create(UserRequest request) {
        if (request.password() == null || request.password().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "رمز عبور برای کاربر جدید الزامی است");
        }
        if (repository.existsByUsername(request.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "این نام کاربری قبلاً ثبت شده است");
        }
        Long tenantId = currentUser.tenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));

        int maxUsers = tenant.getPlan().getMaxUsers();
        if (maxUsers != -1 && repository.findByTenantId(tenantId).size() >= maxUsers) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "ظرفیت کاربران پلن فعلی (" + tenant.getPlan().getLabel() + ") تکمیل است؛ برای افزودن کاربر بیشتر پلن را ارتقا دهید");
        }

        User user = new User();
        user.setTenant(tenant);
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        applyEditableFields(user, request);
        return UserResponse.from(repository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UserRequest request) {
        User user = repository.findByIdAndTenantId(id, currentUser.tenantId())
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setUsername(request.username());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        applyEditableFields(user, request);
        return UserResponse.from(repository.save(user));
    }

    @Transactional
    public void delete(Long id) {
        User user = repository.findByIdAndTenantId(id, currentUser.tenantId())
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        if (user.getId().equals(currentUser.userId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "نمی‌توانید حساب خودتان را حذف کنید");
        }
        repository.delete(user);
    }

    private void applyEditableFields(User user, UserRequest request) {
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setRole(resolveRole(request.roleId()));
        if (request.active() != null) user.setActive(request.active());
    }

    /** Ensures the assigned role belongs to the caller's tenant. */
    private Role resolveRole(Long roleId) {
        return roleRepository.findByIdAndTenantId(roleId, currentUser.tenantId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "نقش انتخاب‌شده معتبر نیست"));
    }
}
