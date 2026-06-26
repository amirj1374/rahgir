package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.ProductRequest;
import ir.rayan.businesscore.basedata.dto.response.ProductResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Product;
import ir.rayan.businesscore.basedata.repository.ProductRepository;
import ir.rayan.businesscore.basedata.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository repository;
    private final CurrentUser currentUser;

    public List<ProductResponse> findAll() {
        return repository.findByTenantId(currentUser.tenantId()).stream().map(ProductResponse::from).toList();
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        product.setTenantId(currentUser.tenantId());
        applyRequest(product, request);
        return ProductResponse.from(repository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = repository.findByIdAndTenantId(id, currentUser.tenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        applyRequest(product, request);
        return ProductResponse.from(repository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsByIdAndTenantId(id, currentUser.tenantId())) {
            throw new ResourceNotFoundException("Product", id);
        }
        repository.deleteById(id);
    }

    private void applyRequest(Product product, ProductRequest request) {
        product.setName(request.name());
        product.setSku(request.sku());
        product.setCategory(request.category());
        product.setPrice(request.price());
        if (request.type() != null) product.setType(request.type());
        if (request.source() != null) product.setSource(request.source());
        if (request.status() != null) product.setStatus(request.status());
        product.setDescription(request.description());
        if (request.stock() != null) product.setStock(request.stock());
    }
}
