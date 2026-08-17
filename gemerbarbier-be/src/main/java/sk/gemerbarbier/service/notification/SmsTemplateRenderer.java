package sk.gemerbarbier.service.notification;

import java.text.Normalizer;
import java.time.format.DateTimeFormatter;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;
import sk.gemerbarbier.domain.notification.ReservationNotificationPayload;

/**
 * Renders the reminder SMS.
 *
 * <p>Everything is stripped of diacritics so the message stays inside the GSM-7 alphabet. A single
 * accented character forces the whole SMS into UCS-2, which cuts the segment length from 160
 * characters to 70 and typically doubles the cost — and service names in the database ("Obyčajný
 * strih") are full of them.
 */
@Component
public class SmsTemplateRenderer {

  private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("HH:mm");
  private static final Pattern COMBINING_MARKS = Pattern.compile("\\p{M}+");

  public String renderReminder(ReservationNotificationPayload payload) {
    return "Gemerbarbier: Pripominame Vasu rezervaciu dnes o " + TIME.format(payload.startTime())
        + ", " + stripDiacritics(payload.serviceName())
        + " (" + stripDiacritics(payload.barberName()) + "). Tesime sa!";
  }

  private static String stripDiacritics(String value) {
    if (value == null) {
      return "";
    }

    return COMBINING_MARKS.matcher(Normalizer.normalize(value, Normalizer.Form.NFD))
        .replaceAll("");
  }
}
