package com.tan90.projects.pensieve.service;

import com.tan90.projects.pensieve.entity.User;
import com.tan90.projects.pensieve.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        // Extract user attributes from OAuth2 provider
        Map<String, Object> attributes = oauth2User.getAttributes();
        String provider = userRequest.getClientRegistration().getRegistrationId().toUpperCase();
        String providerId = (String) attributes.get("sub");
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        // Find or create user
        User user = processOAuth2User(provider, providerId, email, name, picture);

        // Return OAuth2User with user entity stored in attributes
        return new CustomOAuth2User(oauth2User, user);
    }

    private User processOAuth2User(String provider, String providerId, String email, String name, String picture) {
        // Check if user already exists by email (for account linking)
        Optional<User> existingUserOpt = userRepository.findByEmail(email);

        if (existingUserOpt.isPresent()) {
            // Link existing account with OAuth provider
            User user = existingUserOpt.get();
            if (user.getProvider() == null || user.getProvider().equals("LOCAL")) {
                user.setProvider(provider);
                user.setProviderId(providerId);
                user.setPictureUrl(picture);
                return userRepository.save(user);
            }
            // Update picture URL if it changed
            if (picture != null && !picture.equals(user.getPictureUrl())) {
                user.setPictureUrl(picture);
                return userRepository.save(user);
            }
            return user;
        }

        // Create new user
        User newUser = new User();
        newUser.setId(UUID.randomUUID().toString());
        newUser.setEmail(email);
        newUser.setName(name != null ? name : email);
        newUser.setProvider(provider);
        newUser.setProviderId(providerId);
        newUser.setPictureUrl(picture);
        // Note: username and password are nullable for OAuth users

        return userRepository.save(newUser);
    }

    // Custom OAuth2User implementation to carry the User entity
    public static class CustomOAuth2User implements OAuth2User {
        private final OAuth2User oauth2User;
        private final User user;

        public CustomOAuth2User(OAuth2User oauth2User, User user) {
            this.oauth2User = oauth2User;
            this.user = user;
        }

        public User getUser() {
            return user;
        }

        @Override
        public Map<String, Object> getAttributes() {
            return oauth2User.getAttributes();
        }

        @Override
        public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() {
            return oauth2User.getAuthorities();
        }

        @Override
        public String getName() {
            return oauth2User.getName();
        }
    }
}
