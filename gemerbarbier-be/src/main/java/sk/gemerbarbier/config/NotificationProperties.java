package sk.gemerbarbier.config;

import java.time.Duration;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Settings for the customer notifications the backend sends out. Both channels default to disabled
 * so that a misconfigured environment logs instead of mailing or texting real customers.
 */
@Getter
@Setter
@ConfigurationProperties("gemerbarbier.notifications")
public class NotificationProperties {

  private Duration connectTimeout = Duration.ofSeconds(5);
  private Duration readTimeout = Duration.ofSeconds(10);

  private Email email = new Email();
  private Sms sms = new Sms();
  private Reminder reminder = new Reminder();

  @Getter
  @Setter
  public static class Email {

    private boolean enabled;
    private String from = "Gemerbarbier <rezervacie@gemerbarbier.sk>";
    private String apiKey;
    private String baseUrl = "https://api.resend.com";
  }

  @Getter
  @Setter
  public static class Sms {

    /** GatewayAPI caps the alphanumeric sender at 11 characters. */
    private boolean enabled;
    private String sender = "Gemerbarber";
    private String apiKey;
    private String baseUrl = "https://gatewayapi.com";
  }

  @Getter
  @Setter
  public static class Reminder {

    /**
     * The sweep runs on a fixed delay rather than a cron so that a cold start on Render's free tier
     * — where the instance sleeps and cron occurrences are lost, never backfilled — produces a
     * catch-up run shortly after every wake-up.
     */
    private Duration initialDelay = Duration.ofMinutes(1);
    private Duration interval = Duration.ofMinutes(15);

    /** A reservation is eligible for an e-mail reminder between these two distances out. */
    private int leadHours = 24;
    private int minLeadHours = 2;

    /** Wall-clock hour on the day of the reservation at which the SMS reminder becomes due. */
    private int smsHour = 7;

    private int batchSize = 50;
  }
}
