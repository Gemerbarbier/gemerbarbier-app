package sk.gemerbarbier.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.storage.UserStorage;

@Service
public class CustomUserDetailsService implements UserDetailsService {

  private final UserStorage userStorage;

  public CustomUserDetailsService(UserStorage userStorage) {
    this.userStorage = userStorage;
  }

  @Override
  public UserDetails loadUserByUsername(String username) {
    var user = userStorage.getUser(username);

    return org.springframework.security.core.userdetails.User
        .withUsername(user.getUsername())
        .password(user.getPassword())
        .build();
  }
}
