package com.zeroOneBlog.Security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zeroOneBlog.Exceptions.ApiException;

import org.springframework.http.HttpStatus;

import io.jsonwebtoken.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtService.extractUsername(token);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    var userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(username);

                    if (jwtService.isTokenValid(token, userDetails.getUsername())) {
                        if (!userDetails.isEnabled()) {
                            SecurityContextHolder.clearContext();
                            response.setStatus(HttpStatus.FORBIDDEN.value());
                            response.setContentType("application/json");
                            var ex = new ApiException(HttpStatus.FORBIDDEN, "User account is deactivated");
                            var body = Map.of("status", ex.getStatus().value(), "message", ex.getMessage());
                            new ObjectMapper().writeValue(response.getWriter(), body);
                            return;
                        }
                        var authToken = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }

            filterChain.doFilter(request, response);
        } catch (java.io.IOException ex) {
        }
    }
}
