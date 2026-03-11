package com.tan90.projects.pensieve.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtConfig {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration.access-token:3600000}") // Default 1 hour
    private long accessTokenExpiration;

    @Value("${jwt.expiration.refresh-token:604800000}") // Default 7 days
    private long refreshTokenExpiration;

    @Value("${jwt.issuer:pensieve}")
    private String issuer;

    public String getSecret() {
        return secret;
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }

    public long getRefreshTokenExpiration() {
        return refreshTokenExpiration;
    }

    public String getIssuer() {
        return issuer;
    }
}
