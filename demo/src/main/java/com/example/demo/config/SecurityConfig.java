package com.example.demo.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.demo.security.JwtAuthFilter;
import com.example.demo.security.OAuth2SuccessHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Autowired
        private JwtAuthFilter jwtAuthFilter;

        @Autowired
        private OAuth2SuccessHandler oAuth2SuccessHandler;

        @Value("${app.frontend-url}")
        private String frontendUrl;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                // Disable CSRF (we use JWT, stateless)
                                .csrf(AbstractHttpConfigurer::disable)

                                // CORS config
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                // Stateless session — no HttpSession
                                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // Authorization rules
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/user/login",
                                                                "/user/signup",
                                                                "/user/register",
                                                                "/oauth2/**",
                                                                "/login/oauth2/**",
                                                                "/login/oauth2/code/**",
                                                                "/api/public/**")
                                                .permitAll()
                                                .anyRequest().authenticated())

                                // OAuth2 login configuration
                                .oauth2Login(oauth -> oauth
                                                .loginPage("/login")
                                                .authorizationEndpoint(auth -> auth
                                                                .baseUri("/oauth2/authorize"))
                                                .redirectionEndpoint(redir -> redir
                                                                .baseUri("/login/oauth2/code/*"))
                                                .successHandler(oAuth2SuccessHandler)
                                                .failureUrl(frontendUrl
                                                                + "/login?error=oauth_failed&error_description=Authentication+Failed"))

                                // JWT filter before Spring's auth filter
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();

                config.setAllowedOrigins(List.of(
                                frontendUrl,
                                "http://localhost:5173",
                                "http://localhost:3000",
                                "http://127.0.0.1:5173",
                                "http://127.0.0.1:3000"));

                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                config.setAllowedHeaders(List.of("*"));
                config.setExposedHeaders(List.of("Authorization", "Content-Type"));
                config.setAllowCredentials(true);
                config.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}