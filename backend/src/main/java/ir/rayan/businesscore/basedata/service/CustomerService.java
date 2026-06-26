package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.CustomerRequest;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Customer;
import ir.rayan.businesscore.basedata.repository.CustomerRepository;
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

    public List<Customer> findAll() {
        return repository.findAll();
    }

    @Transactional
    public Customer create(CustomerRequest request) {
        Customer customer = new Customer();
        applyRequest(customer, request);
        return repository.save(customer);
    }

    @Transactional
    public Customer update(Long id, CustomerRequest request) {
        Customer customer = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        applyRequest(customer, request);
        return repository.save(customer);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
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
