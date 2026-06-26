package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.WarehouseRequest;
import ir.rayan.businesscore.basedata.dto.response.WarehouseResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Warehouse;
import ir.rayan.businesscore.basedata.repository.WarehouseRepository;
import ir.rayan.businesscore.basedata.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WarehouseService {

    private final WarehouseRepository repository;
    private final CurrentUser currentUser;

    public List<WarehouseResponse> findAll() {
        return repository.findByTenantId(currentUser.tenantId()).stream().map(WarehouseResponse::from).toList();
    }

    @Transactional
    public WarehouseResponse create(WarehouseRequest request) {
        Warehouse warehouse = new Warehouse();
        warehouse.setTenantId(currentUser.tenantId());
        warehouse.setName(request.name());
        warehouse.setLocation(request.location());
        warehouse.setManager(request.manager());
        warehouse.setCapacity(request.capacity());
        warehouse.setActive(request.active() != null ? request.active() : true);
        return WarehouseResponse.from(repository.save(warehouse));
    }

    @Transactional
    public WarehouseResponse update(Long id, WarehouseRequest request) {
        Warehouse warehouse = repository.findByIdAndTenantId(id, currentUser.tenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", id));
        warehouse.setName(request.name());
        warehouse.setLocation(request.location());
        warehouse.setManager(request.manager());
        warehouse.setCapacity(request.capacity());
        if (request.active() != null) warehouse.setActive(request.active());
        return WarehouseResponse.from(repository.save(warehouse));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsByIdAndTenantId(id, currentUser.tenantId())) {
            throw new ResourceNotFoundException("Warehouse", id);
        }
        repository.deleteById(id);
    }
}
