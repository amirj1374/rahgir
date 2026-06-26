package ir.rayan.businesscore.basedata.controller;

import ir.rayan.businesscore.basedata.dto.ApiResponse;
import ir.rayan.businesscore.basedata.dto.request.StockMovementRequest;
import ir.rayan.businesscore.basedata.dto.request.StockTransferRequest;
import ir.rayan.businesscore.basedata.dto.response.StockLevelResponse;
import ir.rayan.businesscore.basedata.dto.response.StockMovementResponse;
import ir.rayan.businesscore.basedata.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService service;

    @GetMapping("/levels")
    public ApiResponse<List<StockLevelResponse>> levels() {
        return ApiResponse.ok(service.stockLevels());
    }

    @GetMapping("/movements")
    public ApiResponse<List<StockMovementResponse>> movements(@RequestParam(required = false) Long productId) {
        return ApiResponse.ok(productId == null ? service.movements() : service.productMovements(productId));
    }

    @PostMapping("/movements")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<StockMovementResponse> record(@Valid @RequestBody StockMovementRequest request) {
        return ApiResponse.ok(service.record(request));
    }

    @PostMapping("/transfer")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<List<StockMovementResponse>> transfer(@Valid @RequestBody StockTransferRequest request) {
        return ApiResponse.ok(service.transfer(request));
    }
}
