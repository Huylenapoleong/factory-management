package com.company.factory.auth.controller;

import com.company.factory.auth.dto.AuthResponse;
import com.company.factory.auth.dto.LoginRequest;
import com.company.factory.auth.dto.RefreshRequest;
import com.company.factory.auth.dto.UserResponse;
import com.company.factory.auth.service.AuthService;
import com.company.factory.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and session management APIs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "User login with username and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestBody RefreshRequest request) {
        AuthResponse response = authService.refresh(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and revoke refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody(required = false) RefreshRequest request) {
        if (request != null) {
            authService.logout(request.getRefreshToken());
        }
        return ResponseEntity.ok(ApiResponse.success(null, "Logout successful"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal String username) {
        UserResponse response = authService.getCurrentUser(username);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
