package com.example.demo.security;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

            // Extract email - handle both Google and other providers
            String email = extractEmail(oAuth2User);
            String name = oAuth2User.getAttribute("name");

            if (email == null || email.isEmpty()) {
                redirectToError(request, response, "Email not provided by OAuth provider");
                return;
            }

            Optional<User> existing = userService.getUserByEmail(email);
            User user;

            if (existing.isPresent()) {
                user = existing.get();
                user.setUpdatedAt(LocalDateTime.now());
                user = userService.saveUser(user);
            } else {
                User newUser = new User();
                newUser.setName(name != null ? name : "Google User");
                newUser.setEmail(email.toLowerCase().trim());
                newUser.setPassword("GOOGLE_OAUTH2");
                newUser.setCreatedAt(LocalDateTime.now());
                newUser.setUpdatedAt(LocalDateTime.now());
                user = userService.saveUser(newUser);
            }

            String token = jwtUtil.generateToken(user.getId(), user.getEmail());

            String redirectUrl = UriComponentsBuilder
                    .fromUriString(frontendUrl + "/oauth/callback")
                    .queryParam("token", token)
                    .queryParam("userId", user.getId())
                    .queryParam("email", user.getEmail())
                    .queryParam("name", user.getName())
                    .build().toUriString();

            getRedirectStrategy().sendRedirect(request, response, redirectUrl);

        } catch (Exception e) {
            redirectToError(request, response, "Authentication failed: " + e.getMessage());
        }
    }

    private String extractEmail(OAuth2User oAuth2User) {
        // Try common attribute names
        String email = oAuth2User.getAttribute("email");
        if (email != null) {
            return email;
        }

        // Try nested attributes for different providers
        Map<String, Object> attributes = oAuth2User.getAttributes();
        if (attributes.containsKey("email")) {
            return (String) attributes.get("email");
        }

        return null;
    }

    private void redirectToError(HttpServletRequest request, HttpServletResponse response, String errorMessage)
            throws IOException {
        String redirectUrl = UriComponentsBuilder
                .fromUriString(frontendUrl + "/login")
                .queryParam("error", URLEncoder.encode(errorMessage, StandardCharsets.UTF_8))
                .build().toUriString();
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}