package ir.rayan.businesscore.basedata.support;

import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * Authenticates the test with an {@code AppUserDetails} principal bound to a tenant,
 * so tenant-scoped services resolve {@code currentUser.tenantId()} correctly.
 */
@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockTenantUserSecurityContextFactory.class)
public @interface WithMockTenantUser {
    long tenantId() default 1L;
    long userId() default 1L;
    String[] authorities() default {"BASEDATA_READ", "BASEDATA_WRITE"};
}
