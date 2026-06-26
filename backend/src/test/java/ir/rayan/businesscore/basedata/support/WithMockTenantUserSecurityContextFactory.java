package ir.rayan.businesscore.basedata.support;

import ir.rayan.businesscore.basedata.model.Permission;
import ir.rayan.businesscore.basedata.model.Role;
import ir.rayan.businesscore.basedata.model.Tenant;
import ir.rayan.businesscore.basedata.model.User;
import ir.rayan.businesscore.basedata.security.AppUserDetails;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

import java.util.Arrays;
import java.util.stream.Collectors;

public class WithMockTenantUserSecurityContextFactory
        implements WithSecurityContextFactory<WithMockTenantUser> {

    @Override
    public SecurityContext createSecurityContext(WithMockTenantUser annotation) {
        Tenant tenant = new Tenant();
        tenant.setId(annotation.tenantId());

        Role role = new Role();
        role.setName("آزمون");
        role.setPermissions(Arrays.stream(annotation.authorities())
                .map(Permission::valueOf)
                .collect(Collectors.toSet()));

        User user = new User();
        user.setId(annotation.userId());
        user.setUsername("tester");
        user.setPassword("x");
        user.setActive(true);
        user.setTenant(tenant);
        user.setRole(role);

        AppUserDetails principal = new AppUserDetails(user);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()));
        return context;
    }
}
