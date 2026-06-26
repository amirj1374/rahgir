package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.CategoryRequest;
import ir.rayan.businesscore.basedata.dto.response.CategoryResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
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
        CategoryResponse saved = service.create(new CategoryRequest("پوشاک", "–"));
        assertThat(saved.id()).isNotNull();
        assertThat(saved.name()).isEqualTo("پوشاک");
        assertThat(repo.count()).isEqualTo(1);
    }

    @Test
    void updateChangesFields() {
        CategoryResponse saved = service.create(new CategoryRequest("قدیمی", null));
        CategoryResponse updated = service.update(saved.id(), new CategoryRequest("جدید", "ریشه"));
        assertThat(updated.name()).isEqualTo("جدید");
        assertThat(updated.parentName()).isEqualTo("ریشه");
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
        CategoryResponse saved = service.create(new CategoryRequest("حذفی", null));
        service.delete(saved.id());
        assertThat(repo.count()).isZero();
    }
}
