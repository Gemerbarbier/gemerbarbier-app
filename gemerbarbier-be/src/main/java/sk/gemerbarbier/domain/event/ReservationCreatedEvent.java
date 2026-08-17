package sk.gemerbarbier.domain.event;

import sk.gemerbarbier.domain.notification.ReservationNotificationPayload;

/**
 * Published once a customer reservation has been persisted. Consumed after the transaction commits,
 * so the confirmation e-mail can never describe a reservation that was rolled back.
 */
public record ReservationCreatedEvent(Long reservationId,
                                      ReservationNotificationPayload payload) {

}
