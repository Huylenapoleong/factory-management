package com.company.factory.customer.mapper;

import com.company.factory.customer.domain.Customer;
import com.company.factory.customer.dto.CreateCustomerRequest;
import com.company.factory.customer.dto.CustomerDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Customer toEntity(CreateCustomerRequest request);

    CustomerDto toDto(Customer customer);
}
