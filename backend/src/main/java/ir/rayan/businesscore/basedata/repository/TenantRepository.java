package ir.rayan.businesscore.basedata.repository;

import ir.rayan.businesscore.basedata.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {}
