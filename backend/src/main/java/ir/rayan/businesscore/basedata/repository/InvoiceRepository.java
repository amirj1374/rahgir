package ir.rayan.businesscore.basedata.repository;

import ir.rayan.businesscore.basedata.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByTenantIdOrderByIssueDateDescIdDesc(Long tenantId);
    Optional<Invoice> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByIdAndTenantId(Long id, Long tenantId);
    long countByTenantId(Long tenantId);
}
