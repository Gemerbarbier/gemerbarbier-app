package sk.gemerbarbier.service.api;

import sk.gemerbarbier.domain.notification.EmailMessage;

/**
 * Puts a rendered e-mail on the wire. Deliberately knows nothing about reservations so the
 * transport stays swappable and can be replaced by a logging stand-in outside production.
 */
public interface EmailSendApi {

  void send(EmailMessage message);
}
