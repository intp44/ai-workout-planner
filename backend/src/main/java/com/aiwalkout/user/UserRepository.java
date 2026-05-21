package com.aiwalkout.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByOauth2ProviderAndOauth2Id(String oauth2Provider, String oauth2Id);
}
