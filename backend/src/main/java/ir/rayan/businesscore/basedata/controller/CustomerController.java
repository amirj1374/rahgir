package ir.rayan.businesscore.basedata.controller;

import ir.rayan.businesscore.basedata.model.Customer;
import ir.rayan.businesscore.basedata.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerRepository repo;

    @GetMapping
    public List<Customer> list() {
        return repo.findAll();
    }

    @PostMapping
    public Customer create(@RequestBody Customer customer) {
        return repo.save(customer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Long id, @RequestBody Customer customer) {
        return repo.findById(id).map(existing -> {
            customer.setId(id);
            return ResponseEntity.ok(repo.save(customer));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
