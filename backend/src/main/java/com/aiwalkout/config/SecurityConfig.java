package com.aiwalkout.config;

import com.aiwalkout.security.CustomOAuth2UserService;
import com.aiwalkout.security.CustomOidcUserService;
import com.aiwalkout.security.OAuth2AuthenticationSuccessHandler;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final CustomOAuth2UserService oauth2UserService;
    private final CustomOidcUserService oidcUserService;
    private final OAuth2AuthenticationSuccessHandler successHandler;
    private final String jwtSecret;

    public SecurityConfig(CustomOAuth2UserService oauth2UserService,
                          CustomOidcUserService oidcUserService,
                          OAuth2AuthenticationSuccessHandler successHandler,
                          @org.springframework.beans.factory.annotation.Value("${jwt.secret}") String jwtSecret) {
        this.oauth2UserService = oauth2UserService;
        this.oidcUserService = oidcUserService;
        this.successHandler = successHandler;
        this.jwtSecret = jwtSecret;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/oauth2/**", "/login/oauth2/**", "/api/auth/login/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(oauth2UserService)
                                .oidcUserService(oidcUserService)
                        )
                        .successHandler(successHandler)
                )
                .oauth2ResourceServer(resourceServer -> resourceServer
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return NimbusJwtDecoder.withSecretKey(new SecretKeySpec(secretBytes, "HmacSHA256")).build();
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> List.of(new SimpleGrantedAuthority("ROLE_USER")));
        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "https://ai-workout-planner-henna.vercel.app"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
