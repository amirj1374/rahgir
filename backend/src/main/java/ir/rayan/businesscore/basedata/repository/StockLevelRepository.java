package ir.rayan.businesscore.basedata.repository;

import ir.rayan.businesscore.basedata.model.StockLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockLevelRepository extends JpaRepository<StockLevel, Long> {
    List<StockLevel> findByTenantId(Long tenantId);
    List<StockLevel> findByTenantIdAndProductId(Long tenantId, Long productId);
    Optional<StockLevel> findByTenantIdAndProductIdAndVariantIdAndWarehouseId(
            Long tenantId, Long productId, Long variantId, Long warehouseId);
}
