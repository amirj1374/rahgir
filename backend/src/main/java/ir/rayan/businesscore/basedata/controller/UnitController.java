package ir.rayan.businesscore.basedata.controller;

import ir.rayan.businesscore.basedata.dto.ApiResponse;
import ir.rayan.businesscore.basedata.dto.request.UnitRequest;
import ir.rayan.businesscore.basedata.model.Unit;
import ir.rayan.businesscore.basedata.service.UnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService service;

    @GetMapping
    public ApiResponse<List<Unit>> list() {
        return ApiResponse.ok(service.findAll());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Unit> create(@Valid @RequestBody UnitRequest request) {
        return ApiResponse.ok(service.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<Unit> update(@PathVariable Long id, @Valid @RequestBody UnitRequest request) {
        return ApiResponse.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
