package sk.gemerbarbier.service.notification;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.domain.notification.SmsMessage;
import sk.gemerbarbier.service.api.SmsSendApi;

/**
 * Stand-in used whenever SMS sending is switched off, so an unconfigured environment logs rather
 * than spending real SMS credit.
 */
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "gemerbarbier.notifications.sms", name = "enabled",
    havingValue = "false", matchIfMissing = true)
public class LoggingSmsService implements SmsSendApi {

  private final Logger logger;

  @Override
  public void send(SmsMessage message) {
    logger.info("SMS sending disabled — would send to {}: {}", message.msisdn(), message.text());
  }
}
