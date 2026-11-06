package sk.gemerbarbier.config;

import java.time.Duration;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * How long customers' personal data is kept. The same value is served to the browser so the
 * privacy policy page always states the period the backend actually enforces.
 */
@Getter
@Setter
@ConfigurationProperties("gemerbarbier.retention")
public class RetentionProperties {

  private int reservationMonths = 6;
  private Duration initialDelay = Duration.ofMinutes(2);
  private Duration interval = Duration.ofHours(6);
}
