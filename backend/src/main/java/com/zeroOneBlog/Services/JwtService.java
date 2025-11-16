package com.zeroOneBlog.Services;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecretKey;

    @Value("${jwt.expiration}")
    private long expirationDate;

    /**
     * Generates a new JWT token for the given username.
     */
    public String generateToken(String username, boolean rememberMe) {
        Key key = generateKey();
        long expirationTime = rememberMe ? expirationDate * 7 : expirationDate;
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Parses a JWT token and returns its claims.
     */
    public Claims parseToken(String token) {
        Key key = generateKey();
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Checks if a token is valid (signed correctly and not expired).
     */
    public boolean isValidToken(String token) {
        try {
            Claims claims = parseToken(token);
            // Check expiration
            return claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            // Token is invalid
            return false;
        }
    }


    /**
     * Private helper that generates the signing key
     */
    private Key generateKey() {
        String combined = jwtSecretKey + expirationDate;
        byte[] decoded = Base64.getEncoder().encode(combined.getBytes());
        return Keys.hmacShaKeyFor(decoded);
    }

}