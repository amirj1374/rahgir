package ir.rayan.businesscore.basedata.repository;

import ir.rayan.businesscore.basedata.model.InventoryStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryStageRepository extends JpaRepository<InventoryStage, Long> {
    List<InventoryStage> findByTenantIdOrderByDirectionAscSequenceAsc(Long tenantId);
    List<InventoryStage> findByTenantIdAndAvailableTrue(Long tenantId);
    Optional<InventoryStage> findByIdAndTenantId(Long id, Long tenantId);
    long countByTenantId(Long tenantId);
}
