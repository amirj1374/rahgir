package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.UnitRequest;
import ir.rayan.businesscore.basedata.dto.response.UnitResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Unit;
import ir.rayan.businesscore.basedata.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UnitService {

    private final UnitRepository repository;

    public List<UnitResponse> findAll() {
        return repository.findAll().stream().map(UnitResponse::from).toList();
    }

    @Transactional
    public UnitResponse create(UnitRequest request) {
        Unit unit = new Unit();
        unit.setName(request.name());
        unit.setSymbol(request.symbol());
        unit.setType(request.type());
        return UnitResponse.from(repository.save(unit));
    }

    @Transactional
    public UnitResponse update(Long id, UnitRequest request) {
        Unit unit = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", id));
        unit.setName(request.name());
        unit.setSymbol(request.symbol());
        unit.setType(request.type());
        return UnitResponse.from(repository.save(unit));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Unit", id);
        }
        repository.deleteById(id);
    }
}
