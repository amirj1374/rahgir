package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.WarehouseRequest;
import ir.rayan.businesscore.basedata.dto.response.WarehouseResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Warehouse;
import ir.rayan.businesscore.basedata.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WarehouseService {

    private final WarehouseRepository repository;

    public List<WarehouseResponse> findAll() {
        return repository.findAll().stream().map(WarehouseResponse::from).toList();
    }

    @Transactional
    public WarehouseResponse create(WarehouseRequest request) {
        Warehouse warehouse = new Warehouse();
        warehouse.setName(request.name());
        warehouse.setLocation(request.location());
        warehouse.setManager(request.manager());
        warehouse.setCapacity(request.capacity());
        warehouse.setActive(request.active() != null ? request.active() : true);
        return WarehouseResponse.from(repository.save(warehouse));
    }

    @Transactional
    public WarehouseResponse update(Long id, WarehouseRequest request) {
        Warehouse warehouse = repository.findById(id)
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
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Warehouse", id);
        }
        repository.deleteById(id);
    }
}
