package ir.rayan.businesscore.basedata.repository;

import ir.rayan.businesscore.basedata.model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByTenantIdOrderByCreatedAtDescIdDesc(Long tenantId);
    List<StockMovement> findByTenantIdAndProductIdOrderByCreatedAtDescIdDesc(Long tenantId, Long productId);
}
