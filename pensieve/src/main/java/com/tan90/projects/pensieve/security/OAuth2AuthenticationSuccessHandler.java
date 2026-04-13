package com.tan90.projects.pensieve.security;

import com.tan90.projects.pensieve.config.JwtConfig;
import com.tan90.projects.pensieve.entity.User;
import com.tan90.projects.pensieve.service.CustomOAuth2UserService;
import com.tan90.projects.pensieve.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final JwtConfig jwtConfig;

    @Value("${frontend.url}")
    private String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(JwtService jwtService, JwtConfig jwtConfig) {
        this.jwtService = jwtService;
        this.jwtConfig = jwtConfig;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        if (response.isCommitted()) {
            return;
        }

        try {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            User user = null;

            // Extract user from CustomOAuth2User if available
            if (oauth2User instanceof CustomOAuth2UserService.CustomOAuth2User) {
                user = ((CustomOAuth2UserService.CustomOAuth2User) oauth2User).getUser();
            }

            if (user == null) {
                throw new RuntimeException("User not found in OAuth2 authentication");
            }

            // Generate JWT tokens
            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail())
                    .password(user.getPassword() != null ? user.getPassword() : "")
                    .authorities("ROLE_USER")
                    .build();

            String accessToken = jwtService.generateAccessToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            // Redirect to frontend with tokens
            String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
                    .queryParam("token", accessToken)
                    .queryParam("refresh", refreshToken)
                    .build().toUriString();

            getRedirectStrategy().sendRedirect(request, response, targetUrl);

        } catch (Exception e) {
            // Redirect to frontend with error
            String errorUrl = frontendUrl + "/login?error=oauth_failed";
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }
}
