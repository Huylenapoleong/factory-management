package com.company.factory.user;

import com.company.factory.role.domain.Role;
import com.company.factory.role.repository.RoleRepository;
import com.company.factory.user.domain.User;
import com.company.factory.user.dto.CreateUserRequest;
import com.company.factory.user.dto.UserDto;
import com.company.factory.user.mapper.UserMapper;
import com.company.factory.user.repository.UserRepository;
import com.company.factory.user.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Spy
    private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("createUser should hash password and assign requested roles")
    void shouldCreateUser() {
        CreateUserRequest request = CreateUserRequest.builder()
                .username("new_operator")
                .password("operator123")
                .fullName("Operator Wang")
                .email("wang@factory.com")
                .phone("+86-13800000000")
                .roleNames(List.of("PRODUCTION"))
                .build();

        Role productionRole = Role.builder().id(2L).name("PRODUCTION").build();

        when(userRepository.existsByUsername("new_operator")).thenReturn(false);
        when(roleRepository.findByName("PRODUCTION")).thenReturn(Optional.of(productionRole));
        when(passwordEncoder.encode("operator123")).thenReturn("$2a$10$hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });

        UserDto result = userService.createUser(request);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getUsername()).isEqualTo("new_operator");
        assertThat(result.getFullName()).isEqualTo("Operator Wang");
        assertThat(result.getRoles()).contains("PRODUCTION");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("getUserById should return mapped UserDto")
    void shouldGetUserById() {
        Role adminRole = Role.builder().id(1L).name("ADMIN").build();
        User user = User.builder()
                .id(1L)
                .username("admin")
                .fullName("Administrator")
                .roles(Set.of(adminRole))
                .status("ACTIVE")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        UserDto result = userService.getUserById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("admin");
        assertThat(result.getRoles()).contains("ADMIN");
    }
}
