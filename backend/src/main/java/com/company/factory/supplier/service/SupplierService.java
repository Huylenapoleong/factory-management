package com.company.factory.supplier.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.common.response.PageResponse;
import com.company.factory.supplier.domain.Supplier;
import com.company.factory.supplier.dto.CreateSupplierRequest;
import com.company.factory.supplier.dto.SupplierDto;
import com.company.factory.supplier.dto.UpdateSupplierRequest;
import com.company.factory.supplier.mapper.SupplierMapper;
import com.company.factory.supplier.repository.SupplierRepository;
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
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Transactional(readOnly = true)
    public PageResponse<SupplierDto> getSuppliers(String search, String status, Pageable pageable) {
        Specification<Supplier> spec = (root, query, cb) -> {
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

        Page<SupplierDto> page = supplierRepository.findAll(spec, pageable).map(supplierMapper::toDto);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public SupplierDto getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .map(supplierMapper::toDto)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "SUPPLIER_NOT_FOUND", "Supplier not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<SupplierDto> getAllActiveSuppliers() {
        return supplierRepository.findAll((root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"))
                .stream()
                .map(supplierMapper::toDto)
                .toList();
    }

    @Transactional
    public SupplierDto createSupplier(CreateSupplierRequest request) {
        if (supplierRepository.existsByCode(request.getCode())) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_CODE", "Supplier code already exists: " + request.getCode());
        }

        Supplier supplier = supplierMapper.toEntity(request);
        return supplierMapper.toDto(supplierRepository.save(supplier));
    }

    @Transactional
    public SupplierDto updateSupplier(Long id, UpdateSupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "SUPPLIER_NOT_FOUND", "Supplier not found: " + id));

        supplier.setName(request.getName());
        supplier.setNameZh(request.getNameZh());
        supplier.setTaxCode(request.getTaxCode());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        supplier.setContactPerson(request.getContactPerson());
        if (request.getCurrency() != null) supplier.setCurrency(request.getCurrency());
        if (request.getPaymentTerm() != null) supplier.setPaymentTerm(request.getPaymentTerm());
        if (request.getStatus() != null) supplier.setStatus(request.getStatus());

        return supplierMapper.toDto(supplierRepository.save(supplier));
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "SUPPLIER_NOT_FOUND", "Supplier not found: " + id));
        supplier.setStatus("INACTIVE");
        supplierRepository.save(supplier);
    }
}
