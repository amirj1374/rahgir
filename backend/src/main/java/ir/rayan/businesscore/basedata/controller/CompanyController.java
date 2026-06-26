package ir.rayan.businesscore.basedata.controller;

import ir.rayan.businesscore.basedata.dto.ApiResponse;
import ir.rayan.businesscore.basedata.dto.request.CompanyRequest;
import ir.rayan.businesscore.basedata.model.Company;
import ir.rayan.businesscore.basedata.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService service;

    @GetMapping
    public ResponseEntity<ApiResponse<Company>> get() {
        return service.find()
                .map(c -> ResponseEntity.ok(ApiResponse.ok(c)))
                .orElse(ResponseEntity.noContent().build());
    }

    @PutMapping
    public ApiResponse<Company> upsert(@Valid @RequestBody CompanyRequest request) {
        return ApiResponse.ok(service.upsert(request));
    }
}
