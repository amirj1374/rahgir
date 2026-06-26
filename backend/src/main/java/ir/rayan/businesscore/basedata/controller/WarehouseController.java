package ir.rayan.businesscore.basedata.controller;

import ir.rayan.businesscore.basedata.model.Warehouse;
import ir.rayan.businesscore.basedata.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseRepository repo;

    @GetMapping
    public List<Warehouse> list() {
        return repo.findAll();
    }

    @PostMapping
    public Warehouse create(@RequestBody Warehouse warehouse) {
        return repo.save(warehouse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Warehouse> update(@PathVariable Long id, @RequestBody Warehouse warehouse) {
        return repo.findById(id).map(existing -> {
            warehouse.setId(id);
            return ResponseEntity.ok(repo.save(warehouse));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
