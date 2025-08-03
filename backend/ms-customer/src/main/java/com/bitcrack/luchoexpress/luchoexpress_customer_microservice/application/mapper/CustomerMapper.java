package com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.mapper;

import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.dto.CreateCustomerRequest;
import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.dto.CustomerResponse;
import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.dto.UpdateCustomerRequest;
import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.domain.Customer;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    
    Customer toEntity(CreateCustomerRequest request);
    
    CustomerResponse toResponse(Customer customer);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "documentId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(@MappingTarget Customer customer, UpdateCustomerRequest request);
}
