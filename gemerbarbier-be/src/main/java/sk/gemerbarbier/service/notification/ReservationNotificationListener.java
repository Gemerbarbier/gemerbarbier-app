package sk.gemerbarbier.service.notification;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import sk.gemerbarbier.domain.event.ReservationCreatedEvent;
import sk.gemerbarbier.service.api.ReservationNotificationApi;

/**
 * Sends the confirmation e-mail once the reservation is safely committed.
 *
 * <p>Three details here are load-bearing:
 *
 * <ul>
 *   <li>{@code AFTER_COMMIT} means a rolled-back reservation never triggers this listener at all,
 *       so nobody is told about a booking that does not exist.
 *   <li>{@code @Async} keeps the Resend round-trip off the request thread — after-commit callbacks
 *       otherwise run inline and the customer would wait for it.
 *   <li>The catch-all is mandatory: an exception escaping an after-commit callback propagates to
 *       whoever committed the transaction, which would turn a successful booking into an HTTP 500.
 * </ul>
 */
@Component
@RequiredArgsConstructor
public class ReservationNotificationListener {

  private final Logger logger;
  private final ReservationNotificationApi reservationNotificationApi;

  @Async
  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void onReservationCreated(ReservationCreatedEvent event) {
    try {
      reservationNotificationApi.sendConfirmation(event.payload());
    } catch (Exception e) {
      logger.error("Confirmation e-mail failed for reservation {}.", event.reservationId(), e);
    }
  }
}
