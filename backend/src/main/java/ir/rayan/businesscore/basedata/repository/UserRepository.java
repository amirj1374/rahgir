package ir.rayan.businesscore.basedata.repository;

import ir.rayan.businesscore.basedata.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);

    List<User> findByTenantId(Long tenantId);
    Optional<User> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByRoleId(Long roleId);
}
