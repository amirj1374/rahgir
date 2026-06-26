package ir.rayan.businesscore.basedata.controller;

import ir.rayan.businesscore.basedata.model.Company;
import ir.rayan.businesscore.basedata.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyRepository repo;

    @GetMapping
    public ResponseEntity<Company> get() {
        return repo.findAll().stream().findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PutMapping
    public Company save(@RequestBody Company company) {
        if (company.getId() == null) {
            repo.findAll().stream().findFirst()
                    .ifPresent(existing -> company.setId(existing.getId()));
        }
        return repo.save(company);
    }
}
