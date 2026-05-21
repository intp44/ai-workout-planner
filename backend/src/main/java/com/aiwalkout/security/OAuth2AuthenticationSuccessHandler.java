package com.aiwalkout.security;

import com.aiwalkout.user.User;
import com.aiwalkout.user.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private static final Logger log = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    private final String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(JwtTokenProvider jwtTokenProvider,
                                              UserService userService,
                                              @org.springframework.beans.factory.annotation.Value("${app.frontend.url}") String frontendUrl) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        if (authentication == null || authentication.getPrincipal() == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication information is missing.");
            return;
        }
        if (!(authentication.getPrincipal() instanceof OAuth2User oauth2User)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "OAuth2 user principal is missing.");
            return;
        }
        if (!(authentication instanceof OAuth2AuthenticationToken oauth2Token)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "OAuth2 authentication token is missing.");
            return;
        }

        String provider = oauth2Token.getAuthorizedClientRegistrationId();
        Object idAttribute = oauth2User.getAttribute("sub");
        if (idAttribute == null) {
            idAttribute = oauth2User.getAttribute("id");
        }
        if (idAttribute == null) {
            idAttribute = oauth2User.getName();
        }
        String oauth2Id = idAttribute != null ? String.valueOf(idAttribute) : null;

        Map<String, Object> claims = new HashMap<>();
        claims.put("email", oauth2User.getAttribute("email"));
        claims.put("name", oauth2User.getAttribute("name"));
        claims.put("provider", provider);
        claims.put("oauth2Id", oauth2Id);

        User user = null;
        if (oauth2Id != null) {
            user = userService.findByOauth2ProviderAndOauth2Id(provider, oauth2Id)
                    .orElseGet(() -> {
                        log.warn("User not found during success handling for provider='{}', oauth2Id='{}'. Creating fallback user.", provider, oauth2Id);
                        return userService.createOrUpdateUser(provider, oauth2Id, oauth2User.getAttributes());
                    });
        }

        if (user == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unable to resolve authenticated user.");
            return;
        }

        log.info("Generating JWT subject using stored user id='{}' for provider='{}' oauth2Id='{}'", user.getId(), provider, oauth2Id);

        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(frontendUrl)
                .path("/login/success");

        String token = jwtTokenProvider.generateToken(claims, user.getId());
        if (token != null) {
            uriBuilder = uriBuilder.queryParam("token", token);
        } else {
            uriBuilder = uriBuilder.queryParam("error", "token_generation_failed");
        }

        String targetUrl = uriBuilder.build().toUriString();
        response.sendRedirect(targetUrl);
    }
}
