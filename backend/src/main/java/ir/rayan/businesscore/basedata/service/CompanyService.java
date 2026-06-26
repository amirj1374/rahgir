package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.CompanyRequest;
import ir.rayan.businesscore.basedata.model.Company;
import ir.rayan.businesscore.basedata.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository repository;

    public Optional<Company> find() {
        return repository.findAll().stream().findFirst();
    }

    @Transactional
    public Company upsert(CompanyRequest request) {
        Company company = repository.findAll().stream().findFirst().orElse(new Company());
        company.setName(request.name());
        company.setNationalId(request.nationalId());
        company.setRegistrationNumber(request.registrationNumber());
        company.setPhone(request.phone());
        company.setEmail(request.email());
        company.setAddress(request.address());
        if (request.currency() != null) company.setCurrency(request.currency());
        if (request.fiscalYearStart() != null) company.setFiscalYearStart(request.fiscalYearStart());
        if (request.vatRate() != null) company.setVatRate(request.vatRate());
        return repository.save(company);
    }
}
