package sk.gemerbarbier.exception;

import java.io.Serial;

public class UsernameNotFoundException extends RuntimeException {

  @Serial
  private static final long serialVersionUID = 2194523997557273025L;

  public UsernameNotFoundException(final String message) {
    super(message);
  }
}
