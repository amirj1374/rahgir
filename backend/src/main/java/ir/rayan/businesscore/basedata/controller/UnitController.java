package ir.rayan.businesscore.basedata.controller;

import ir.rayan.businesscore.basedata.model.Unit;
import ir.rayan.businesscore.basedata.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitRepository repo;

    @GetMapping
    public List<Unit> list() {
        return repo.findAll();
    }

    @PostMapping
    public Unit create(@RequestBody Unit unit) {
        return repo.save(unit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Unit> update(@PathVariable Long id, @RequestBody Unit unit) {
        return repo.findById(id).map(existing -> {
            unit.setId(id);
            return ResponseEntity.ok(repo.save(unit));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
