package com.company.factory.customer.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.common.response.PageResponse;
import com.company.factory.customer.domain.Customer;
import com.company.factory.customer.dto.CreateCustomerRequest;
import com.company.factory.customer.dto.CustomerDto;
import com.company.factory.customer.dto.UpdateCustomerRequest;
import com.company.factory.customer.mapper.CustomerMapper;
import com.company.factory.customer.repository.CustomerRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    @Transactional(readOnly = true)
    public PageResponse<CustomerDto> getCustomers(String search, String status, Pageable pageable) {
        Specification<Customer> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate codeMatch = cb.like(cb.lower(root.get("code")), pattern);
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate contactMatch = cb.like(cb.lower(root.get("contactPerson")), pattern);
                predicates.add(cb.or(codeMatch, nameMatch, contactMatch));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<CustomerDto> page = customerRepository.findAll(spec, pageable).map(customerMapper::toDto);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public CustomerDto getCustomerById(Long id) {
        return customerRepository.findById(id)
                .map(customerMapper::toDto)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "CUSTOMER_NOT_FOUND", "Customer not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<CustomerDto> getAllActiveCustomers() {
        return customerRepository.findAll((root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"))
                .stream()
                .map(customerMapper::toDto)
                .toList();
    }

    @Transactional
    public CustomerDto createCustomer(CreateCustomerRequest request) {
        if (customerRepository.existsByCode(request.getCode())) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_CODE", "Customer code already exists: " + request.getCode());
        }

        Customer customer = customerMapper.toEntity(request);
        return customerMapper.toDto(customerRepository.save(customer));
    }

    @Transactional
    public CustomerDto updateCustomer(Long id, UpdateCustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "CUSTOMER_NOT_FOUND", "Customer not found: " + id));

        customer.setName(request.getName());
        customer.setNameZh(request.getNameZh());
        customer.setTaxCode(request.getTaxCode());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customer.setContactPerson(request.getContactPerson());
        if (request.getCurrency() != null) customer.setCurrency(request.getCurrency());
        if (request.getPaymentTerm() != null) customer.setPaymentTerm(request.getPaymentTerm());
        if (request.getStatus() != null) customer.setStatus(request.getStatus());

        return customerMapper.toDto(customerRepository.save(customer));
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "CUSTOMER_NOT_FOUND", "Customer not found: " + id));
        customer.setStatus("INACTIVE");
        customerRepository.save(customer);
    }
}
