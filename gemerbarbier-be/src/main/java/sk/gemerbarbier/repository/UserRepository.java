package sk.gemerbarbier.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import sk.gemerbarbier.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

  Optional<User> findByUsername(String username);

}
