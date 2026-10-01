package com.company.factory.user.mapper;

import com.company.factory.role.domain.Role;
import com.company.factory.user.domain.User;
import com.company.factory.user.dto.UserDto;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        if (user == null) return null;

        List<String> roleNames = user.getRoles() != null
                ? user.getRoles().stream().map(Role::getName).sorted().toList()
                : Collections.emptyList();

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .status(user.getStatus())
                .roles(roleNames)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
