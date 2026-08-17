package sk.gemerbarbier.service.api;

import sk.gemerbarbier.domain.notification.SmsMessage;

/**
 * Puts a rendered SMS on the wire. Same split as {@link EmailSendApi} — transport only.
 */
public interface SmsSendApi {

  void send(SmsMessage message);
}
