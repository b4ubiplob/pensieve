package com.tan90.projects.pensieve.service;

import com.tan90.projects.pensieve.entity.User;
import com.tan90.projects.pensieve.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Helper method to return a copy of User with password set to null
    private User maskPassword(User user) {
        if (user == null) return null;
        User masked = new User();
        masked.setId(user.getId());
        masked.setEmail(user.getEmail());
        masked.setName(user.getName());
        masked.setUsername(user.getUsername());
        masked.setPicture(user.getPicture());
        masked.setPassword(null);
        masked.setProjects(null);
        masked.setProvider(user.getProvider());
        return masked;
    }

    // Helper method to check if a password hash is MD5 format
    private boolean isMd5Hash(String hash) {
        return hash != null && hash.matches("^[a-fA-F0-9]{32}$");
    }

    // Helper method to hash a string using MD5 (for backward compatibility)
    private String hashPasswordMD5(String password) {
        if (password == null) return null;
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(password.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 algorithm not found", e);
        }
    }

    // Helper method to hash password with bcrypt
    private String hashPasswordBcrypt(String password) {
        if (password == null) return null;
        return passwordEncoder.encode(password);
    }

    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(this::maskPassword).toList();
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id)
                .map(this::maskPassword);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(this::maskPassword);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(this::maskPassword);
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("User with email " + user.getEmail() + " already exists");
        }

        if (user.getUsername() != null && userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("User with username " + user.getUsername() + " already exists");
        }

        // Generate ID if not provided
        if (user.getId() == null || user.getId().isEmpty()) {
            user.setId(UUID.randomUUID().toString());
        }

        // Set default provider if not set
        if (user.getProvider() == null) {
            user.setProvider("LOCAL");
        }

        // Hash password with bcrypt for new users (no longer using MD5)
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(hashPasswordBcrypt(user.getPassword()));
        }

        return userRepository.save(user);
    }

    public User updateUser(String id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.setEmail(userDetails.getEmail());
        user.setUsername(userDetails.getUsername());
        // Hash password with bcrypt before saving
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(hashPasswordBcrypt(userDetails.getPassword()));
        }
        user.setName(userDetails.getName());
        user.setPicture(userDetails.getPicture());

        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        userRepository.delete(user);
    }

    public boolean existsById(String id) {
        return userRepository.existsById(id);
    }

    public Optional<User> authenticateUser(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String hashedPassword = hashPasswordMD5(password);

            // Compare hashed password with stored password
            if (user.getPassword() != null && user.getPassword().equals(hashedPassword)) {
                return Optional.of(maskPassword(user));
            }
        }

        return Optional.empty();
    }
}
