package ir.rayan.businesscore.basedata.controller;

import ir.rayan.businesscore.basedata.dto.ApiResponse;
import ir.rayan.businesscore.basedata.dto.request.TaxRateRequest;
import ir.rayan.businesscore.basedata.model.TaxRate;
import ir.rayan.businesscore.basedata.service.TaxRateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tax-rates")
@RequiredArgsConstructor
public class TaxRateController {

    private final TaxRateService service;

    @GetMapping
    public ApiResponse<List<TaxRate>> list() {
        return ApiResponse.ok(service.findAll());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TaxRate> create(@Valid @RequestBody TaxRateRequest request) {
        return ApiResponse.ok(service.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<TaxRate> update(@PathVariable Long id, @Valid @RequestBody TaxRateRequest request) {
        return ApiResponse.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
