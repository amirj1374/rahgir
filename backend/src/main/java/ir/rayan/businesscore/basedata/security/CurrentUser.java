package ir.rayan.businesscore.basedata.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

/** Convenience accessor for the authenticated principal's tenant and id. */
@Component
public class CurrentUser {

    public AppUserDetails details() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AppUserDetails details) {
            return details;
        }
        throw new UsernameNotFoundException("کاربر احراز هویت نشده است");
    }

    public Long tenantId() {
        return details().getTenantId();
    }

    public Long userId() {
        return details().getUserId();
    }
}
