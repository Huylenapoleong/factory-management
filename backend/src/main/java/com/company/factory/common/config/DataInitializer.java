package com.company.factory.common.config;

import com.company.factory.role.domain.Role;
import com.company.factory.role.repository.RoleRepository;
import com.company.factory.user.domain.User;
import com.company.factory.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        initRoles();
        initDefaultAdmin();
    }

    private void initRoles() {
        List<String> defaultRoles = List.of(
                "ADMIN", "MANAGER", "WAREHOUSE", "PURCHASING", "PRODUCTION", "SALES", "VIEWER"
        );

        for (String roleName : defaultRoles) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(Role.builder()
                        .name(roleName)
                        .description(roleName + " role")
                        .build());
                log.info("Initialized default role: {}", roleName);
            }
        }
    }

    private void initDefaultAdmin() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
            User admin = User.builder()
                    .username("admin")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .fullName("System Administrator")
                    .email("admin@factory.com")
                    .status("ACTIVE")
                    .roles(Set.of(adminRole))
                    .build();
            userRepository.save(admin);
            log.info("Initialized default admin user: admin / admin123");
        }
    }
}
