package ir.rayan.businesscore.basedata.controller;

import ir.rayan.businesscore.basedata.model.TaxRate;
import ir.rayan.businesscore.basedata.repository.TaxRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tax-rates")
@RequiredArgsConstructor
public class TaxRateController {

    private final TaxRateRepository repo;

    @GetMapping
    public List<TaxRate> list() {
        return repo.findAll();
    }

    @PostMapping
    public TaxRate create(@RequestBody TaxRate taxRate) {
        return repo.save(taxRate);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaxRate> update(@PathVariable Long id, @RequestBody TaxRate taxRate) {
        return repo.findById(id).map(existing -> {
            taxRate.setId(id);
            return ResponseEntity.ok(repo.save(taxRate));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
