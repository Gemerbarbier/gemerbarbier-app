package sk.gemerbarbier.service.notification;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.domain.notification.EmailMessage;
import sk.gemerbarbier.service.api.EmailSendApi;

/**
 * Stand-in used whenever e-mail sending is switched off. Being the default means a forgotten
 * configuration logs the message instead of surprising a real customer.
 */
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "gemerbarbier.notifications.email", name = "enabled",
    havingValue = "false", matchIfMissing = true)
public class LoggingEmailService implements EmailSendApi {

  private final Logger logger;

  @Override
  public void send(EmailMessage message) {
    logger.info("E-mail sending disabled — would send \"{}\" to {}.", message.subject(),
        message.to());
  }
}
