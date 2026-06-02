package com.aiwalkout.security;

import com.aiwalkout.user.User;
import com.aiwalkout.user.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.Map;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private static final Logger log = LoggerFactory.getLogger(CustomOAuth2UserService.class);
    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
    private final UserService userService;

    public CustomOAuth2UserService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        log.info("CustomOAuth2UserService.loadUser called for client registration='{}'", userRequest.getClientRegistration().getRegistrationId());
        OAuth2User oauth2User = delegate.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Object rawOauth2Id = oauth2User.getAttribute("sub");
        if (rawOauth2Id == null) {
            rawOauth2Id = oauth2User.getAttribute("id");
        }
        if (rawOauth2Id == null) {
            rawOauth2Id = oauth2User.getName();
        }
        String oauth2Id = rawOauth2Id != null ? String.valueOf(rawOauth2Id) : "";
        log.info("OAuth2 user attributes received: provider='{}', oauth2Id='{}', email='{}', name='{}'", registrationId, oauth2Id, oauth2User.getAttribute("email"), oauth2User.getAttribute("name"));

        User user = userService.createOrUpdateUser(registrationId, oauth2Id, oauth2User.getAttributes());

        Map<String, Object> attributes = oauth2User.getAttributes();
        attributes = Map.copyOf(attributes);

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                Map.<String, Object>of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "name", user.getName(),
                        "picture", user.getProfileImageUrl(),
                        "provider", user.getOauth2Provider()
                ),
                "email"
        );
    }
}
