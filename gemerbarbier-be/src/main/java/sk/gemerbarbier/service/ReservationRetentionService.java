package sk.gemerbarbier.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.config.RetentionProperties;
import sk.gemerbarbier.storage.api.ReservationStorageApi;

/**
 * Erases customers' personal data once the retention period stated in the privacy policy has
 * passed since the reservation was created.
 *
 * <p>Runs on a fixed delay for the same reason as the reminder sweep: Render's free tier sleeps,
 * and a missed cron occurrence is never backfilled, whereas the initial delay gives every wake-up
 * its own sweep.
 */
@Service
@RequiredArgsConstructor
public class ReservationRetentionService {

  static final String ANONYMIZED_NAME = "Anonymizovaný zákazník";

  private final Logger logger;
  private final ReservationStorageApi reservationStorage;
  private final RetentionProperties retentionProperties;

  @Scheduled(
      initialDelayString = "${gemerbarbier.retention.initial-delay:PT2M}",
      fixedDelayString = "${gemerbarbier.retention.interval:PT6H}")
  public void anonymizeExpiredReservations() {
    var months = retentionProperties.getReservationMonths();
    // A zero or negative period would wipe every reservation, including today's bookings.
    if (months < 1) {
      logger.warn("Reservation retention of {} month(s) is invalid, skipping anonymization.",
          months);
      return;
    }

    var cutoff = LocalDateTime.now(ZoneId.of("Europe/Bratislava")).minusMonths(months);

    var anonymized = reservationStorage.anonymizeCreatedBefore(cutoff, ANONYMIZED_NAME);
    if (anonymized > 0) {
      logger.info("Erased personal data from {} reservation(s) created before {}.", anonymized,
          cutoff);
    }
  }
}
