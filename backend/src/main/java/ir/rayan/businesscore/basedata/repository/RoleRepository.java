package ir.rayan.businesscore.basedata.repository;

import ir.rayan.businesscore.basedata.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    List<Role> findByTenantId(Long tenantId);
    Optional<Role> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByTenantIdAndName(Long tenantId, String name);
    long countByTenantId(Long tenantId);
}
