package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.UnitRequest;
import ir.rayan.businesscore.basedata.dto.response.UnitResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Unit;
import ir.rayan.businesscore.basedata.repository.UnitRepository;
import ir.rayan.businesscore.basedata.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UnitService {

    private final UnitRepository repository;
    private final CurrentUser currentUser;

    public List<UnitResponse> findAll() {
        return repository.findByTenantId(currentUser.tenantId()).stream().map(UnitResponse::from).toList();
    }

    @Transactional
    public UnitResponse create(UnitRequest request) {
        Unit unit = new Unit();
        unit.setTenantId(currentUser.tenantId());
        unit.setName(request.name());
        unit.setSymbol(request.symbol());
        unit.setType(request.type());
        return UnitResponse.from(repository.save(unit));
    }

    @Transactional
    public UnitResponse update(Long id, UnitRequest request) {
        Unit unit = repository.findByIdAndTenantId(id, currentUser.tenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit", id));
        unit.setName(request.name());
        unit.setSymbol(request.symbol());
        unit.setType(request.type());
        return UnitResponse.from(repository.save(unit));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsByIdAndTenantId(id, currentUser.tenantId())) {
            throw new ResourceNotFoundException("Unit", id);
        }
        repository.deleteById(id);
    }
}
