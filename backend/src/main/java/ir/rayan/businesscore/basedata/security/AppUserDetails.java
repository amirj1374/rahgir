package ir.rayan.businesscore.basedata.security;

import ir.rayan.businesscore.basedata.model.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/** Spring Security principal that also carries the tenant and user ids. */
@Getter
public class AppUserDetails extends org.springframework.security.core.userdetails.User {

    private final Long userId;
    private final Long tenantId;

    public AppUserDetails(User user) {
        super(user.getUsername(), user.getPassword(), user.isActive(), true, true, true,
                buildAuthorities(user));
        this.userId = user.getId();
        this.tenantId = user.getTenant().getId();
    }

    /** Authorities = ROLE_<roleName> plus one authority per permission. */
    private static Collection<? extends GrantedAuthority> buildAuthorities(User user) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        String roleName = user.getRole().getName().trim().replaceAll("\\s+", "_").toUpperCase();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName));
        user.getRole().getPermissions()
                .forEach(p -> authorities.add(new SimpleGrantedAuthority(p.name())));
        return authorities;
    }
}
