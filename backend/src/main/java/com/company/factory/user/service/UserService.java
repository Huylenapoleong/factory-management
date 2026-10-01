package com.company.factory.user.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.common.response.PageResponse;
import com.company.factory.role.domain.Role;
import com.company.factory.role.repository.RoleRepository;
import com.company.factory.user.domain.User;
import com.company.factory.user.dto.CreateUserRequest;
import com.company.factory.user.dto.ResetPasswordRequest;
import com.company.factory.user.dto.UpdateUserRequest;
import com.company.factory.user.dto.UserDto;
import com.company.factory.user.mapper.UserMapper;
import com.company.factory.user.repository.UserRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public PageResponse<UserDto> getUsers(String search, String role, String status, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate usernameMatch = cb.like(cb.lower(root.get("username")), pattern);
                Predicate nameMatch = cb.like(cb.lower(root.get("fullName")), pattern);
                predicates.add(cb.or(usernameMatch, nameMatch));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status.toUpperCase()));
            }

            if (role != null && !role.isBlank()) {
                Join<User, Role> roleJoin = root.join("roles", JoinType.INNER);
                predicates.add(cb.equal(cb.upper(roleJoin.get("name")), role.toUpperCase()));
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<UserDto> page = userRepository.findAll(spec, pageable).map(userMapper::toDto);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("User not found with ID: " + id, HttpStatus.NOT_FOUND));
        return userMapper.toDto(user);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username already exists: " + request.getUsername(), HttpStatus.CONFLICT);
        }

        Set<Role> roles = resolveRoles(request.getRoleNames());

        User user = User.builder()
                .username(request.getUsername().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .email(request.getEmail() != null ? request.getEmail().trim() : null)
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .status("ACTIVE")
                .roles(roles)
                .build();

        return userMapper.toDto(userRepository.save(user));
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("User not found with ID: " + id, HttpStatus.NOT_FOUND));

        user.setFullName(request.getFullName().trim());
        if (request.getEmail() != null) user.setEmail(request.getEmail().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            user.setStatus(request.getStatus().toUpperCase());
        }

        if (request.getRoleNames() != null) {
            user.setRoles(resolveRoles(request.getRoleNames()));
        }

        return userMapper.toDto(userRepository.save(user));
    }

    @Transactional
    public void resetPassword(Long id, ResetPasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("User not found with ID: " + id, HttpStatus.NOT_FOUND));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("User not found with ID: " + id, HttpStatus.NOT_FOUND));

        if ("admin".equalsIgnoreCase(user.getUsername())) {
            throw new BusinessException("Super administrator user cannot be deleted", HttpStatus.BAD_REQUEST);
        }

        user.setStatus("INACTIVE");
        userRepository.save(user);
    }

    private Set<Role> resolveRoles(List<String> roleNames) {
        Set<Role> roles = new HashSet<>();
        if (roleNames == null || roleNames.isEmpty()) {
            roleRepository.findByName("VIEWER").ifPresent(roles::add);
            return roles;
        }

        for (String name : roleNames) {
            String normalized = name.replace("ROLE_", "").toUpperCase();
            Role role = roleRepository.findByName(normalized)
                    .orElseThrow(() -> new BusinessException("Role not found: " + name, HttpStatus.BAD_REQUEST));
            roles.add(role);
        }
        return roles;
    }
}
