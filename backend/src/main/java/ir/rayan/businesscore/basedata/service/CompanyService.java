package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.CompanyRequest;
import ir.rayan.businesscore.basedata.dto.response.CompanyResponse;
import ir.rayan.businesscore.basedata.model.Company;
import ir.rayan.businesscore.basedata.repository.CompanyRepository;
import ir.rayan.businesscore.basedata.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository repository;
    private final CurrentUser currentUser;

    public Optional<CompanyResponse> find() {
        return repository.findByTenantId(currentUser.tenantId()).map(CompanyResponse::from);
    }

    @Transactional
    public CompanyResponse upsert(CompanyRequest request) {
        Long tenantId = currentUser.tenantId();
        Company company = repository.findByTenantId(tenantId).orElse(new Company());
        company.setTenantId(tenantId);
        company.setName(request.name());
        company.setNationalId(request.nationalId());
        company.setRegistrationNumber(request.registrationNumber());
        company.setPhone(request.phone());
        company.setEmail(request.email());
        company.setAddress(request.address());
        if (request.currency() != null) company.setCurrency(request.currency());
        if (request.fiscalYearStart() != null) company.setFiscalYearStart(request.fiscalYearStart());
        if (request.vatRate() != null) company.setVatRate(request.vatRate());
        return CompanyResponse.from(repository.save(company));
    }
}
