package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.CategoryRequest;
import ir.rayan.businesscore.basedata.dto.response.CategoryResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Permission;
import ir.rayan.businesscore.basedata.model.Role;
import ir.rayan.businesscore.basedata.model.Tenant;
import ir.rayan.businesscore.basedata.model.User;
import ir.rayan.businesscore.basedata.repository.CategoryRepository;
import ir.rayan.businesscore.basedata.security.AppUserDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class CategoryServiceTest {

    @Autowired CategoryService service;
    @Autowired CategoryRepository repo;

    @BeforeEach
    void clean() {
        repo.deleteAll();
        authenticateTenant(1L);
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    /** Builds a security context whose principal belongs to the given tenant. */
    private void authenticateTenant(long tenantId) {
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        Role role = new Role();
        role.setName("مدیر");
        role.setPermissions(Set.of(Permission.BASEDATA_WRITE));
        User user = new User();
        user.setId(1L);
        user.setUsername("tester");
        user.setPassword("x");
        user.setActive(true);
        user.setTenant(tenant);
        user.setRole(role);
        AppUserDetails principal = new AppUserDetails(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }

    @Test
    void createPersistsCategory() {
        CategoryResponse saved = service.create(new CategoryRequest("پوشاک", "–"));
        assertThat(saved.id()).isNotNull();
        assertThat(saved.name()).isEqualTo("پوشاک");
        assertThat(repo.count()).isEqualTo(1);
    }

    @Test
    void updateChangesFields() {
        CategoryResponse saved = service.create(new CategoryRequest("قدیمی", null));
        CategoryResponse updated = service.update(saved.id(), new CategoryRequest("جدید", "ریشه"));
        assertThat(updated.name()).isEqualTo("جدید");
        assertThat(updated.parentName()).isEqualTo("ریشه");
    }

    @Test
    void updateMissingThrows() {
        assertThatThrownBy(() -> service.update(404L, new CategoryRequest("x", null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteMissingThrows() {
        assertThatThrownBy(() -> service.delete(404L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteRemovesCategory() {
        CategoryResponse saved = service.create(new CategoryRequest("حذفی", null));
        service.delete(saved.id());
        assertThat(repo.count()).isZero();
    }

    @Test
    void categoriesAreIsolatedPerTenant() {
        service.create(new CategoryRequest("مال مستأجر ۱", null));
        authenticateTenant(2L);
        assertThat(service.findAll()).isEmpty();
        authenticateTenant(1L);
        assertThat(service.findAll()).hasSize(1);
    }
}
