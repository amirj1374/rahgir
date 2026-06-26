package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.CustomerRequest;
import ir.rayan.businesscore.basedata.dto.response.CustomerResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Customer;
import ir.rayan.businesscore.basedata.repository.CustomerRepository;
import ir.rayan.businesscore.basedata.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerService {

    private final CustomerRepository repository;
    private final CurrentUser currentUser;

    public List<CustomerResponse> findAll() {
        return repository.findByTenantId(currentUser.tenantId()).stream().map(CustomerResponse::from).toList();
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        Customer customer = new Customer();
        customer.setTenantId(currentUser.tenantId());
        applyRequest(customer, request);
        return CustomerResponse.from(repository.save(customer));
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = repository.findByIdAndTenantId(id, currentUser.tenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        applyRequest(customer, request);
        return CustomerResponse.from(repository.save(customer));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsByIdAndTenantId(id, currentUser.tenantId())) {
            throw new ResourceNotFoundException("Customer", id);
        }
        repository.deleteById(id);
    }

    private void applyRequest(Customer customer, CustomerRequest request) {
        customer.setName(request.name());
        customer.setPhone(request.phone());
        customer.setEmail(request.email());
        customer.setCity(request.city());
        customer.setAddress(request.address());
        if (request.group() != null) customer.setGroup(request.group());
        if (request.source() != null) customer.setSource(request.source());
        customer.setBalance(request.balance() != null ? request.balance() : BigDecimal.ZERO);
        customer.setLastOrderDate(request.lastOrderDate());
    }
}
