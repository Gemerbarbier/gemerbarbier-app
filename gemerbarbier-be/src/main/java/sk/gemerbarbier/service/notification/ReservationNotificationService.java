package sk.gemerbarbier.service.notification;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.domain.notification.ReservationNotificationPayload;
import sk.gemerbarbier.domain.notification.SmsMessage;
import sk.gemerbarbier.service.api.EmailSendApi;
import sk.gemerbarbier.service.api.ReservationNotificationApi;
import sk.gemerbarbier.service.api.SmsSendApi;

@Service
@RequiredArgsConstructor
public class ReservationNotificationService implements ReservationNotificationApi {

  private final Logger logger;
  private final EmailTemplateRenderer emailTemplateRenderer;
  private final SmsTemplateRenderer smsTemplateRenderer;
  private final EmailSendApi emailSendApi;
  private final SmsSendApi smsSendApi;

  @Override
  public void sendConfirmation(ReservationNotificationPayload payload) {
    emailSendApi.send(emailTemplateRenderer.renderConfirmation(payload));
  }

  @Override
  public void sendEmailReminder(ReservationNotificationPayload payload) {
    emailSendApi.send(emailTemplateRenderer.renderReminder(payload));
  }

  @Override
  public void sendSmsReminder(ReservationNotificationPayload payload) {
    var msisdn = PhoneNormalizer.toMsisdn(payload.customerPhone());

    if (msisdn.isEmpty()) {
      // An unusable number will never become usable, so the caller keeps its claim on the row
      // rather than retrying this reservation on every sweep.
      logger.warn("Skipping SMS reminder — cannot normalise phone number \"{}\".",
          payload.customerPhone());
      return;
    }

    smsSendApi.send(new SmsMessage(msisdn.get(), smsTemplateRenderer.renderReminder(payload)));
  }
}
