package sk.gemerbarbier.service.api;

import sk.gemerbarbier.domain.notification.ReservationNotificationPayload;

/**
 * Turns a reservation into the messages a customer receives. Sits above {@link EmailSendApi} and
 * {@link SmsSendApi}: this layer knows what a reservation e-mail is, they know how to send one.
 */
public interface ReservationNotificationApi {

  void sendConfirmation(ReservationNotificationPayload payload);

  void sendEmailReminder(ReservationNotificationPayload payload);

  void sendSmsReminder(ReservationNotificationPayload payload);
}
