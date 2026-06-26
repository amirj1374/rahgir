package ir.rayan.businesscore.basedata.repository;

import ir.rayan.businesscore.basedata.model.TaxRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaxRateRepository extends JpaRepository<TaxRate, Long> {}
