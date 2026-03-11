package com.tan90.projects.pensieve.controller;

import com.tan90.projects.pensieve.config.JwtConfig;
import com.tan90.projects.pensieve.dto.AuthResponse;
import com.tan90.projects.pensieve.dto.LoginRequest;
import com.tan90.projects.pensieve.dto.UserDto;
import com.tan90.projects.pensieve.entity.User;
import com.tan90.projects.pensieve.repository.UserRepository;
import com.tan90.projects.pensieve.service.JwtService;
import com.tan90.projects.pensieve.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtConfig jwtConfig;
    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            JwtConfig jwtConfig,
            UserRepository userRepository,
            UserService userService,
            PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.jwtConfig = jwtConfig;
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Find user by username or email
            User user = userRepository.findByUsername(loginRequest.getUsername())
                    .or(() -> userRepository.findByEmail(loginRequest.getUsername()))
                    .orElse(null);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials"));
            }

            // Check if password needs migration from MD5 to bcrypt
            if (isMd5Hash(user.getPassword())) {
                // Verify MD5 password
                if (!verifyMd5Password(loginRequest.getPassword(), user.getPassword())) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("error", "Invalid credentials"));
                }
                // Migrate to bcrypt
                user.setPassword(passwordEncoder.encode(loginRequest.getPassword()));
                userRepository.save(user);
            } else {
                // Use Spring Security authentication for bcrypt passwords
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                user.getEmail(),
                                loginRequest.getPassword()
                        )
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

            // Generate JWT tokens
            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail())
                    .password(user.getPassword())
                    .authorities("ROLE_USER")
                    .build();

            String accessToken = jwtService.generateAccessToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            // Create UserDto
            UserDto userDto = new UserDto(
                    user.getId(),
                    user.getEmail(),
                    user.getUsername(),
                    user.getName(),
                    user.getPicture(),
                    user.getProvider(),
                    user.getPictureUrl()
            );

            // Create response
            AuthResponse response = new AuthResponse(
                    accessToken,
                    refreshToken,
                    jwtConfig.getAccessTokenExpiration() / 1000, // Convert to seconds
                    userDto
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        if (refreshToken == null || !jwtService.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid refresh token"));
        }

        try {
            String username = jwtService.extractUsername(refreshToken);
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail())
                    .password(user.getPassword() != null ? user.getPassword() : "")
                    .authorities("ROLE_USER")
                    .build();

            String newAccessToken = jwtService.generateAccessToken(userDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("tokenType", "Bearer");
            response.put("expiresIn", jwtConfig.getAccessTokenExpiration() / 1000);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Failed to refresh token"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserDto userDto = new UserDto(
                    user.getId(),
                    user.getEmail(),
                    user.getUsername(),
                    user.getName(),
                    user.getPicture(),
                    user.getProvider(),
                    user.getPictureUrl()
            );

            return ResponseEntity.ok(userDto);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized"));
        }
    }

    // Helper methods for MD5 migration
    private boolean isMd5Hash(String hash) {
        return hash != null && hash.matches("^[a-fA-F0-9]{32}$");
    }

    private boolean verifyMd5Password(String plainPassword, String md5Hash) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(plainPassword.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString().equals(md5Hash);
        } catch (Exception e) {
            return false;
        }
    }
}
