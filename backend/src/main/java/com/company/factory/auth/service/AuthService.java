package com.company.factory.auth.service;

import com.company.factory.auth.domain.RefreshToken;
import com.company.factory.auth.dto.AuthResponse;
import com.company.factory.auth.dto.LoginRequest;
import com.company.factory.auth.dto.UserResponse;
import com.company.factory.auth.repository.RefreshTokenRepository;
import com.company.factory.common.config.JwtTokenProvider;
import com.company.factory.common.exception.BusinessException;
import com.company.factory.role.domain.Role;
import com.company.factory.user.domain.User;
import com.company.factory.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CustomUserDetailsService userDetailsService;

    @Value("${app.jwt.access-expiration:900}")
    private long accessExpirationSec;

    @Value("${app.jwt.refresh-expiration:604800}")
    private long refreshExpirationSec;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND", "User not found"));

        String accessToken = tokenProvider.generateAccessToken(userDetails);
        String refreshTokenString = tokenProvider.generateRefreshToken(user.getUsername());

        // Save refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .userId(user.getId())
                .token(refreshTokenString)
                .expiryDate(Instant.now().plusSeconds(refreshExpirationSec))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenString)
                .tokenType("Bearer")
                .expiresIn(accessExpirationSec)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse refresh(String refreshTokenString) {
        if (!tokenProvider.validateToken(refreshTokenString)) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "Refresh token is invalid or expired");
        }

        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenString)
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "TOKEN_NOT_FOUND", "Refresh token not found"));

        if (refreshToken.isRevoked() || refreshToken.getExpiryDate().isBefore(Instant.now())) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "TOKEN_EXPIRED", "Refresh token is expired or revoked");
        }

        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND", "User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String newAccessToken = tokenProvider.generateAccessToken(userDetails);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshTokenString)
                .tokenType("Bearer")
                .expiresIn(accessExpirationSec)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public void logout(String refreshTokenString) {
        if (refreshTokenString != null) {
            refreshTokenRepository.findByToken(refreshTokenString).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .toList();

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .status(user.getStatus())
                .roles(roles)
                .build();
    }
}
