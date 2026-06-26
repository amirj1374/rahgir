package ir.rayan.businesscore.basedata.repository;

import ir.rayan.businesscore.basedata.model.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {}
