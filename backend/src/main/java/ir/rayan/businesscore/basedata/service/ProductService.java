package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.ProductRequest;
import ir.rayan.businesscore.basedata.dto.response.ProductResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Product;
import ir.rayan.businesscore.basedata.model.Tenant;
import ir.rayan.businesscore.basedata.repository.ProductRepository;
import ir.rayan.businesscore.basedata.repository.TenantRepository;
import ir.rayan.businesscore.basedata.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository repository;
    private final TenantRepository tenantRepository;
    private final CurrentUser currentUser;

    public List<ProductResponse> findAll() {
        return repository.findByTenantId(currentUser.tenantId()).stream().map(ProductResponse::from).toList();
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Long tenantId = currentUser.tenantId();
        enforceProductLimit(tenantId);
        Product product = new Product();
        product.setTenantId(tenantId);
        applyRequest(product, request);
        return ProductResponse.from(repository.save(product));
    }

    /** Keeps a tenant within the product cap of its purchased plan. */
    private void enforceProductLimit(Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId).orElse(null);
        if (tenant == null) return; // no plan context → nothing to enforce
        int max = tenant.getPlan().getMaxProducts();
        if (max != -1 && repository.countByTenantId(tenantId) >= max) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "ظرفیت محصولات پلن فعلی (" + tenant.getPlan().getLabel() + ") تکمیل است؛ برای افزودن محصول بیشتر پلن را ارتقا دهید");
        }
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
