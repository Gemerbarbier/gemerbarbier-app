package sk.gemerbarbier.service.notification;

import java.time.LocalDateTime;
import java.time.ZoneId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import sk.gemerbarbier.config.NotificationProperties;
import sk.gemerbarbier.entity.Reservation;

/**
 * Decides when a reminder is due, and which reminders can never usefully fire for a given
 * reservation.
 */
@Component
@RequiredArgsConstructor
public class ReminderWindow {

  public static final ZoneId ZONE = ZoneId.of("Europe/Bratislava");

  private final NotificationProperties properties;

  public LocalDateTime now() {
    return LocalDateTime.now(ZONE);
  }

  /** Wall-clock moment the SMS reminder becomes due — 07:00 on the day of the reservation. */
  public LocalDateTime smsDueAt(LocalDateTime startTime) {
    return startTime.toLocalDate().atTime(properties.getReminder().getSmsHour(), 0);
  }

  /**
   * Pre-claims the reminders that are already moot for a freshly booked reservation.
   *
   * <p>Somebody booking three hours ahead would otherwise receive a confirmation and a "see you
   * tomorrow" reminder seconds apart, because the reservation lands inside the reminder window the
   * moment it is created. Likewise, an appointment booked after 07:00 on the same day has already
   * missed its SMS slot.
   */
  public void suppressUnreachableReminders(Reservation reservation, LocalDateTime now) {
    var start = reservation.getStartTime();

    if (start.isBefore(now.plusHours(properties.getReminder().getLeadHours()))) {
      reservation.setReminderSentAt(now);
    }

    if (!smsDueAt(start).isAfter(now)) {
      reservation.setSmsReminderSentAt(now);
    }
  }
}
