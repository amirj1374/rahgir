package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.CategoryRequest;
import ir.rayan.businesscore.basedata.dto.response.CategoryResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Category;
import ir.rayan.businesscore.basedata.repository.CategoryRepository;
import ir.rayan.businesscore.basedata.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository repository;
    private final CurrentUser currentUser;

    public List<CategoryResponse> findAll() {
        return repository.findByTenantId(currentUser.tenantId()).stream().map(CategoryResponse::from).toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        Category category = new Category();
        category.setTenantId(currentUser.tenantId());
        category.setName(request.name());
        category.setParentName(request.parentName());
        return CategoryResponse.from(repository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = repository.findByIdAndTenantId(id, currentUser.tenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        category.setName(request.name());
        category.setParentName(request.parentName());
        return CategoryResponse.from(repository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsByIdAndTenantId(id, currentUser.tenantId())) {
            throw new ResourceNotFoundException("Category", id);
        }
        repository.deleteById(id);
    }
}
