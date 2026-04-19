package sk.gemerbarbier.storage;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.stereotype.Component;
import sk.gemerbarbier.entity.User;
import sk.gemerbarbier.exception.UsernameNotFoundException;
import sk.gemerbarbier.repository.UserRepository;
import sk.gemerbarbier.storage.api.UserStorageApi;

@RequiredArgsConstructor
@Component
public class UserStorage implements UserStorageApi {

  private final Logger logger;
  private final UserRepository repository;

  @Override
  public User getUser(String username) {
    logger.debug("Getting user by username {}.", username);
    return repository.findByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
  }
}
