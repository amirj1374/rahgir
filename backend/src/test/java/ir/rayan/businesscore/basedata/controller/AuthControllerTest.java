package ir.rayan.businesscore.basedata.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ir.rayan.businesscore.basedata.dto.request.LoginRequest;
import ir.rayan.businesscore.basedata.model.Permission;
import ir.rayan.businesscore.basedata.model.Role;
import ir.rayan.businesscore.basedata.model.Tenant;
import ir.rayan.businesscore.basedata.model.User;
import ir.rayan.businesscore.basedata.repository.RoleRepository;
import ir.rayan.businesscore.basedata.repository.TenantRepository;
import ir.rayan.businesscore.basedata.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepository userRepo;
    @Autowired RoleRepository roleRepo;
    @Autowired TenantRepository tenantRepo;
    @Autowired PasswordEncoder encoder;

    @BeforeEach
    void seedUser() {
        userRepo.deleteAll();
        roleRepo.deleteAll();
        tenantRepo.deleteAll();

        Tenant tenant = new Tenant();
        tenant.setName("فروشگاه تست");
        tenantRepo.save(tenant);

        Role adminRole = new Role();
        adminRole.setTenant(tenant);
        adminRole.setName("مدیر ارشد");
        adminRole.setPermissions(java.util.Set.of(Permission.values()));
        adminRole.setBuiltin(true);
        roleRepo.save(adminRole);

        User admin = new User();
        admin.setTenant(tenant);
        admin.setRole(adminRole);
        admin.setUsername("admin");
        admin.setPassword(encoder.encode("admin123"));
        admin.setFullName("مدیر");
        admin.setActive(true);
        userRepo.save(admin);
    }

    @Test
    void loginWithValidCredentialsReturnsToken() throws Exception {
        var body = json.writeValueAsString(new LoginRequest("admin", "admin123"));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.user.username", is("admin")))
                .andExpect(jsonPath("$.data.user.roleName", is("مدیر ارشد")))
                .andExpect(jsonPath("$.data.user.tenantName", is("فروشگاه تست")));
    }

    @Test
    void loginWithWrongPasswordReturns401() throws Exception {
        var body = json.writeValueAsString(new LoginRequest("admin", "wrong"));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void protectedEndpointWithoutTokenReturns401() throws Exception {
        mvc.perform(get("/api/products"))
                .andExpect(status().isUnauthorized());
    }
}
