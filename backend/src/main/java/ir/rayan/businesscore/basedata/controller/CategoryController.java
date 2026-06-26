package ir.rayan.businesscore.basedata.controller;

import ir.rayan.businesscore.basedata.model.Category;
import ir.rayan.businesscore.basedata.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository repo;

    @GetMapping
    public List<Category> list() {
        return repo.findAll();
    }

    @PostMapping
    public Category create(@RequestBody Category category) {
        return repo.save(category);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(@PathVariable Long id, @RequestBody Category category) {
        return repo.findById(id).map(existing -> {
            category.setId(id);
            return ResponseEntity.ok(repo.save(category));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
