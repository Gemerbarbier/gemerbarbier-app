package sk.gemerbarbier.service.notification;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.Year;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;
import sk.gemerbarbier.domain.notification.EmailMessage;
import sk.gemerbarbier.domain.notification.ReservationNotificationPayload;

/**
 * Renders the customer e-mails from the HTML templates under {@code resources/email}.
 *
 * <p>Substitution is a single pass over each template, so a value that happens to contain something
 * like <code>{{CONTACT}}</code> is never re-scanned and cannot inject markup. Every value coming
 * from a customer is HTML-escaped on top of that.
 */
@Component
public class EmailTemplateRenderer {

  static final ZoneId ZONE = ZoneId.of("Europe/Bratislava");

  private static final Locale SK = Locale.of("sk", "SK");
  private static final DateTimeFormatter LONG_DATE =
      DateTimeFormatter.ofPattern("EEEE d. MMMM yyyy", SK);
  private static final DateTimeFormatter SHORT_DATE =
      DateTimeFormatter.ofPattern("EEEE d. MMMM", SK);
  private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("HH:mm");
  private static final Pattern TOKEN = Pattern.compile("\\{\\{(\\w+)}}");

  private static final String SHOP_EMAIL = "gemerbarbierra@gmail.com";
  private static final String SHOP_ADDRESS = "Magnezitárov 1209/9, 050 01 Revúca";

  private final Logger logger;

  private final String layout;
  private final String confirmation;
  private final String reminder;
  private final String contactBlock;
  private final String contactBarberKnown;
  private final String contactBarberRow;

  EmailTemplateRenderer(Logger logger) {
    this.logger = logger;
    this.layout = load("email/layout.html");
    this.confirmation = load("email/reservation-confirmation.html");
    this.reminder = load("email/reservation-reminder.html");
    this.contactBlock = load("email/contact-block.html");
    this.contactBarberKnown = load("email/contact-barber-known.html");
    this.contactBarberRow = load("email/contact-barber-row.html");
  }

  /**
   * Slovak month and weekday names come from the JDK's locale data, which a slimmed-down runtime
   * image can lack. Logging one formatted date at startup surfaces that immediately instead of via
   * English month names in a customer's inbox.
   */
  @PostConstruct
  void logLocaleSample() {
    logger.debug("Slovak date formatting sample: {}.", LONG_DATE.format(LocalDate.now(ZONE)));
  }

  public EmailMessage renderConfirmation(ReservationNotificationPayload payload) {
    var content = render(confirmation, Map.of(
        "CUSTOMER_NAME", escape(payload.customerName()),
        "DATE", escape(LONG_DATE.format(payload.startTime())),
        "TIME", escape(TIME.format(payload.startTime())),
        "SERVICE", escape(payload.serviceName()),
        "DURATION", escape(String.valueOf(payload.serviceDuration())),
        "BARBER", escape(payload.barberName()),
        "PRICE", escape(String.valueOf(payload.servicePrice())),
        "CONTACT", renderContactBlock(payload.barberName())));

    return new EmailMessage(payload.customerEmail(), "Potvrdenie rezervácie - Gemerbarbier",
        wrapInLayout(content), confirmationText(payload));
  }

  public EmailMessage renderReminder(ReservationNotificationPayload payload) {
    var today = payload.startTime().toLocalDate().equals(LocalDate.now(ZONE));
    var when = today ? "dnes" : "zajtra";

    var content = render(reminder, Map.of(
        "WHEN", when,
        "CUSTOMER_NAME", escape(payload.customerName()),
        "DATE", escape(SHORT_DATE.format(payload.startTime())),
        "TIME", escape(TIME.format(payload.startTime())),
        "SERVICE", escape(payload.serviceName()),
        "BARBER", escape(payload.barberName()),
        "CONTACT", renderContactBlock(payload.barberName())));

    return new EmailMessage(payload.customerEmail(),
        "Pripomienka: Vaša rezervácia je " + when + " - Gemerbarbier",
        wrapInLayout(content), reminderText(payload, when));
  }

  private String wrapInLayout(String content) {
    return render(layout, Map.of(
        "CONTENT", content,
        "YEAR", String.valueOf(Year.now(ZONE).getValue())));
  }

  private String renderContactBlock(String barberName) {
    var barberPart = BarberContact.find(barberName)
        .map(contact -> render(contactBarberKnown, Map.of(
            "BARBER_NAME", escape(contact.getDisplayName()),
            "BARBER_PHONE", escape(contact.getPhone()),
            "BARBER_PHONE_HREF", escape(contact.getPhoneHref()),
            "BARBER_MESSENGER", escape(contact.getMessenger()))))
        .orElseGet(this::allBarbersContact);

    return render(contactBlock, Map.of("BARBER_PART", barberPart));
  }

  private String allBarbersContact() {
    return Arrays.stream(BarberContact.values())
        .map(contact -> render(contactBarberRow, Map.of(
            "BARBER_NAME", escape(contact.getDisplayName()),
            "BARBER_PHONE", escape(contact.getPhone()),
            "BARBER_PHONE_HREF", escape(contact.getPhoneHref()))))
        .collect(Collectors.joining()) + "<div style=\"height: 8px;\"></div>";
  }

  private String confirmationText(ReservationNotificationPayload payload) {
    return String.join("\n",
        "Dobrý deň, " + payload.customerName() + "!",
        "",
        "Vaša rezervácia bola úspešne prijatá.",
        "",
        "Dátum: " + LONG_DATE.format(payload.startTime()),
        "Čas: " + TIME.format(payload.startTime()),
        "Služba: " + payload.serviceName(),
        "Trvanie: " + payload.serviceDuration() + " minút",
        "Barber: " + payload.barberName(),
        "Cena: " + payload.servicePrice() + "€",
        "",
        contactText(payload.barberName()),
        "",
        "Tešíme sa na vás!",
        "gemerbarbier.sk");
  }

  private String reminderText(ReservationNotificationPayload payload, String when) {
    return String.join("\n",
        "Pripomienka rezervácie",
        "",
        "Tešíme sa na vás " + when + ", " + payload.customerName() + "!",
        "",
        "Dátum: " + SHORT_DATE.format(payload.startTime()),
        "Čas: " + TIME.format(payload.startTime()),
        "Služba: " + payload.serviceName(),
        "Barber: " + payload.barberName(),
        "",
        contactText(payload.barberName()),
        "",
        "gemerbarbier.sk");
  }

  private String contactText(String barberName) {
    var barbers = BarberContact.find(barberName)
        .map(contact -> contact.getDisplayName() + " – " + contact.getPhone()
            + " (Messenger: " + contact.getMessenger() + ")")
        .orElseGet(() -> Arrays.stream(BarberContact.values())
            .map(contact -> contact.getDisplayName() + " – " + contact.getPhone())
            .collect(Collectors.joining("\n")));

    return String.join("\n",
        "V prípade zmeny alebo zrušenia rezervácie nás kontaktujte:",
        barbers,
        "E-mail: " + SHOP_EMAIL,
        "Adresa: " + SHOP_ADDRESS);
  }

  private static String render(String template, Map<String, String> values) {
    var matcher = TOKEN.matcher(template);
    var result = new StringBuilder();

    while (matcher.find()) {
      var token = matcher.group(1);
      var value = values.get(token);

      if (value == null) {
        throw new IllegalStateException("No value supplied for template token " + token);
      }

      matcher.appendReplacement(result, Matcher.quoteReplacement(value));
    }
    matcher.appendTail(result);

    return result.toString();
  }

  /**
   * Escapes for UTF-8 explicitly. The single-argument overload assumes ISO-8859-1 and would turn
   * half the Slovak alphabet into named entities — "Obyčajn&amp;yacute;" — while leaving the
   * characters Latin-1 cannot represent alone. The templates declare UTF-8, so only the markup
   * characters need escaping.
   */
  private static String escape(String value) {
    return value == null ? "" : HtmlUtils.htmlEscape(value, StandardCharsets.UTF_8.name());
  }

  private static String load(String path) {
    try {
      return new ClassPathResource(path).getContentAsString(StandardCharsets.UTF_8);
    } catch (IOException e) {
      throw new UncheckedIOException("Cannot load e-mail template " + path, e);
    }
  }
}
