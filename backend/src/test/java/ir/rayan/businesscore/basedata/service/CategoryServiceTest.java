package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.CategoryRequest;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Category;
import ir.rayan.businesscore.basedata.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class CategoryServiceTest {

    @Autowired CategoryService service;
    @Autowired CategoryRepository repo;

    @BeforeEach
    void clean() {
        repo.deleteAll();
    }

    @Test
    void createPersistsCategory() {
        Category saved = service.create(new CategoryRequest("پوشاک", "–"));
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("پوشاک");
        assertThat(repo.count()).isEqualTo(1);
    }

    @Test
    void updateChangesFields() {
        Category saved = service.create(new CategoryRequest("قدیمی", null));
        Category updated = service.update(saved.getId(), new CategoryRequest("جدید", "ریشه"));
        assertThat(updated.getName()).isEqualTo("جدید");
        assertThat(updated.getParentName()).isEqualTo("ریشه");
    }

    @Test
    void updateMissingThrows() {
        assertThatThrownBy(() -> service.update(404L, new CategoryRequest("x", null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteMissingThrows() {
        assertThatThrownBy(() -> service.delete(404L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteRemovesCategory() {
        Category saved = service.create(new CategoryRequest("حذفی", null));
        service.delete(saved.getId());
        assertThat(repo.count()).isZero();
    }
}
