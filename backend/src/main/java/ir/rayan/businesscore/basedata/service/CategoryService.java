package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.CategoryRequest;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Category;
import ir.rayan.businesscore.basedata.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository repository;

    public List<Category> findAll() {
        return repository.findAll();
    }

    @Transactional
    public Category create(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.name());
        category.setParentName(request.parentName());
        return repository.save(category);
    }

    @Transactional
    public Category update(Long id, CategoryRequest request) {
        Category category = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        category.setName(request.name());
        category.setParentName(request.parentName());
        return repository.save(category);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Category", id);
        }
        repository.deleteById(id);
    }
}
