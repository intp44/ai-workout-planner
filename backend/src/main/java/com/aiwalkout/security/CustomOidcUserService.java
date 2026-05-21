package com.aiwalkout.security;

import com.aiwalkout.user.User;
import com.aiwalkout.user.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

@Service
public class CustomOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {
    private static final Logger log = LoggerFactory.getLogger(CustomOidcUserService.class);
    private final OidcUserService delegate = new OidcUserService();
    private final UserService userService;

    public CustomOidcUserService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        log.info("CustomOidcUserService.loadUser called for client registration='{}'", userRequest.getClientRegistration().getRegistrationId());
        OidcUser oidcUser = delegate.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        Object rawOauth2Id = oidcUser.getSubject();
        if (rawOauth2Id == null) {
            rawOauth2Id = oidcUser.getAttribute("sub");
        }
        if (rawOauth2Id == null) {
            rawOauth2Id = oidcUser.getAttribute("id");
        }
        String oauth2Id = rawOauth2Id != null ? String.valueOf(rawOauth2Id) : "";

        log.info("OIDC user attributes received: provider='{}', oauth2Id='{}', email='{}', name='{}'", registrationId, oauth2Id, oidcUser.getAttribute("email"), oidcUser.getAttribute("name"));

        User user = userService.createOrUpdateUser(registrationId, oauth2Id, oidcUser.getClaims());
        log.info("Persisted OIDC user with id='{}'", user.getId());

        return oidcUser;
    }
}
