package com.aiwalkout.user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User createOrUpdateUser(String provider, String oauth2Id, Map<String, Object> attributes) {
        log.info("createOrUpdateUser invoked for provider='{}', oauth2Id='{}'", provider, oauth2Id);
        return userRepository.findByOauth2ProviderAndOauth2Id(provider, oauth2Id)
                .map(existing -> updateExistingUser(existing, attributes))
                .orElseGet(() -> createNewUser(provider, oauth2Id, attributes));
    }

    public Optional<User> findByOauth2ProviderAndOauth2Id(String provider, String oauth2Id) {
        return userRepository.findByOauth2ProviderAndOauth2Id(provider, oauth2Id);
    }

    public boolean existsById(String id) {
        return userRepository.existsById(id);
    }

    private User createNewUser(String provider, String oauth2Id, Map<String, Object> attributes) {
        User user = new User();
        String newId = UUID.randomUUID().toString();
        user.setId(newId);
        user.setOauth2Provider(provider);
        user.setOauth2Id(oauth2Id);
        user.setEmail(getString(attributes, "email"));
        user.setName(getString(attributes, "name"));
        user.setProfileImageUrl(getString(attributes, "picture"));
        log.info("Creating new OAuth2 user: id='{}', provider='{}', oauth2Id='{}', email='{}'", newId, provider, oauth2Id, user.getEmail());
        return userRepository.save(user);
    }

    private User updateExistingUser(User existing, Map<String, Object> attributes) {
        existing.setEmail(getString(attributes, "email"));
        existing.setName(getString(attributes, "name"));
        existing.setProfileImageUrl(getString(attributes, "picture"));
        log.info("Updating existing OAuth2 user: id='{}', provider='{}', oauth2Id='{}', email='{}'", existing.getId(), existing.getOauth2Provider(), existing.getOauth2Id(), existing.getEmail());
        return userRepository.save(existing);
    }

    private String getString(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);
        return value != null ? String.valueOf(value) : "";
    }
}
