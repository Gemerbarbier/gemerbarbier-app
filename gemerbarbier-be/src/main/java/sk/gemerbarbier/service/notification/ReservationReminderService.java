package sk.gemerbarbier.service.notification;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.config.NotificationProperties;
import sk.gemerbarbier.entity.Reservation;
import sk.gemerbarbier.mapper.ReservationNotificationMapper;
import sk.gemerbarbier.service.api.ReservationNotificationApi;
import sk.gemerbarbier.storage.api.ReservationStorageApi;

/**
 * Sends the reminders that are due.
 *
 * <p>Scheduled on a fixed delay rather than a cron on purpose. Render's free tier puts the instance
 * to sleep, and a cron occurrence that falls while it sleeps is lost for good — Spring never
 * backfills missed runs. A fixed delay with an initial delay fires shortly after every startup, so
 * each wake-up produces a catch-up sweep. The wide eligibility window does the rest: a reservation
 * stays eligible for roughly twenty-two hours, so the instance only has to be awake for one tick
 * somewhere in that span.
 *
 * <p>Deliberately not transactional — a single transaction spanning N outbound HTTP calls would
 * hold a pooled connection for the length of the whole sweep.
 */
@Service
@RequiredArgsConstructor
public class ReservationReminderService {

  private final Logger logger;
  private final ReservationStorageApi reservationStorage;
  private final ReservationNotificationApi reservationNotificationApi;
  private final NotificationProperties properties;
  private final ReminderWindow reminderWindow;

  @Scheduled(
      initialDelayString = "${gemerbarbier.notifications.reminder.initial-delay:PT1M}",
      fixedDelayString = "${gemerbarbier.notifications.reminder.interval:PT15M}")
  public void sendDueReminders() {
    var now = reminderWindow.now();

    sendEmailReminders(now);
    sendSmsReminders(now);
  }

  private void sendEmailReminders(LocalDateTime now) {
    var reminder = properties.getReminder();
    var from = now.plusHours(reminder.getMinLeadHours());
    var to = now.plusHours(reminder.getLeadHours());

    var due = reservationStorage.getEmailRemindable(from, to, reminder.getBatchSize());
    if (due.isEmpty()) {
      return;
    }

    logger.debug("E-mail reminder sweep: {} candidate(s) between {} and {}.", due.size(), from, to);

    for (var reservation : due) {
      if (!reservationStorage.claimEmailReminder(reservation.getId(), now)) {
        continue;
      }

      try {
        reservationNotificationApi.sendEmailReminder(
            ReservationNotificationMapper.INSTANCE.toPayload(reservation));
      } catch (Exception e) {
        logger.warn("E-mail reminder failed for reservation {}, releasing for retry.",
            reservation.getId(), e);
        reservationStorage.releaseEmailReminder(reservation.getId());
      }
    }
  }

  private void sendSmsReminders(LocalDateTime now) {
    var reminder = properties.getReminder();
    var endOfDay = now.toLocalDate().atTime(LocalTime.MAX);

    var due = dueForSms(reservationStorage.getSmsRemindable(now, endOfDay, reminder.getBatchSize()),
        now);
    if (due.isEmpty()) {
      return;
    }

    logger.debug("SMS reminder sweep: {} candidate(s) for today.", due.size());

    for (var reservation : due) {
      if (!reservationStorage.claimSmsReminder(reservation.getId(), now)) {
        continue;
      }

      try {
        reservationNotificationApi.sendSmsReminder(
            ReservationNotificationMapper.INSTANCE.toPayload(reservation));
      } catch (Exception e) {
        logger.warn("SMS reminder failed for reservation {}, releasing for retry.",
            reservation.getId(), e);
        reservationStorage.releaseSmsReminder(reservation.getId());
      }
    }
  }

  /** The SMS goes out from 07:00 on the day of the visit, not the moment the day begins. */
  private List<Reservation> dueForSms(List<Reservation> candidates, LocalDateTime now) {
    return candidates.stream()
        .filter(reservation -> !reminderWindow.smsDueAt(reservation.getStartTime()).isAfter(now))
        .toList();
  }
}
