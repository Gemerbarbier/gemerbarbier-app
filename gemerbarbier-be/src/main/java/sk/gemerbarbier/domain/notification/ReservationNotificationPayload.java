package sk.gemerbarbier.domain.notification;

import java.time.LocalDateTime;

/**
 * Everything a reservation notification needs, captured as an immutable snapshot.
 *
 * <p>Deliberately not the {@code Reservation} entity: notifications are rendered on a different
 * thread after the persistence context has closed, so handing a managed entity across that boundary
 * would invite lazy-loading failures and stale reads.
 */
public record ReservationNotificationPayload(
    String customerName,
    String customerEmail,
    String customerPhone,
    LocalDateTime startTime,
    String serviceName,
    Integer servicePrice,
    Integer serviceDuration,
    String barberName) {

}
