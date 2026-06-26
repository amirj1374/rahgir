package ir.rayan.businesscore.basedata.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ir.rayan.businesscore.basedata.dto.request.ProductRequest;
import ir.rayan.businesscore.basedata.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import ir.rayan.businesscore.basedata.support.WithMockTenantUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockTenantUser
class ProductControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired ProductRepository repo;

    @BeforeEach
    void clean() {
        repo.deleteAll();
    }

    private String body(ProductRequest r) throws Exception {
        return json.writeValueAsString(r);
    }

    @Test
    void createReturnsCreatedAndWrapsInEnvelope() throws Exception {
        var req = new ProductRequest("تی‌شرت", "SKU-1", "پوشاک", null, null, null, null, null, 10);
        mvc.perform(post("/api/products").contentType(MediaType.APPLICATION_JSON).content(body(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id").exists())
                .andExpect(jsonPath("$.data.name", is("تی‌شرت")));
    }

    @Test
    void createWithBlankNameReturns400() throws Exception {
        var req = new ProductRequest("", "SKU-2", null, null, null, null, null, null, null);
        mvc.perform(post("/api/products").contentType(MediaType.APPLICATION_JSON).content(body(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void listReturnsSavedProducts() throws Exception {
        mvc.perform(post("/api/products").contentType(MediaType.APPLICATION_JSON)
                .content(body(new ProductRequest("کفش", "SKU-3", null, null, null, null, null, null, 5))));

        mvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", org.hamcrest.Matchers.hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("کفش")));
    }

    @Test
    void updateMissingProductReturns404() throws Exception {
        var req = new ProductRequest("هرچیز", null, null, null, null, null, null, null, null);
        mvc.perform(put("/api/products/9999").contentType(MediaType.APPLICATION_JSON).content(body(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void deleteMissingProductReturns404() throws Exception {
        mvc.perform(delete("/api/products/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteExistingProductReturns204() throws Exception {
        var created = mvc.perform(post("/api/products").contentType(MediaType.APPLICATION_JSON)
                        .content(body(new ProductRequest("حذفی", null, null, null, null, null, null, null, null))))
                .andReturn().getResponse().getContentAsString();
        long id = json.readTree(created).path("data").path("id").asLong();

        mvc.perform(delete("/api/products/" + id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/products")).andExpect(jsonPath("$.data", org.hamcrest.Matchers.hasSize(0)));
    }
}
