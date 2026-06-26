package ir.rayan.businesscore.basedata.repository;

import ir.rayan.businesscore.basedata.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {}
