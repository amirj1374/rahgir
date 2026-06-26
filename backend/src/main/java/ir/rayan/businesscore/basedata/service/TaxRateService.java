package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.TaxRateRequest;
import ir.rayan.businesscore.basedata.dto.response.TaxRateResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.TaxRate;
import ir.rayan.businesscore.basedata.repository.TaxRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaxRateService {

    private final TaxRateRepository repository;

    public List<TaxRateResponse> findAll() {
        return repository.findAll().stream().map(TaxRateResponse::from).toList();
    }

    @Transactional
    public TaxRateResponse create(TaxRateRequest request) {
        TaxRate taxRate = new TaxRate();
        taxRate.setName(request.name());
        taxRate.setRate(request.rate());
        taxRate.setAppliesTo(request.appliesTo());
        taxRate.setActive(request.active() != null ? request.active() : true);
        return TaxRateResponse.from(repository.save(taxRate));
    }

    @Transactional
    public TaxRateResponse update(Long id, TaxRateRequest request) {
        TaxRate taxRate = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TaxRate", id));
        taxRate.setName(request.name());
        taxRate.setRate(request.rate());
        taxRate.setAppliesTo(request.appliesTo());
        if (request.active() != null) taxRate.setActive(request.active());
        return TaxRateResponse.from(repository.save(taxRate));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("TaxRate", id);
        }
        repository.deleteById(id);
    }
}
