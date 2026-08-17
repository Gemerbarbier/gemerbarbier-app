package sk.gemerbarbier.config;

import java.time.Duration;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Google Maps and Places settings. The maps key is deliberately handed to the browser — a Maps
 * JavaScript API key is public by design and is protected by an HTTP referrer restriction set in
 * the Google Cloud console, not by keeping it secret.
 */
@Getter
@Setter
@ConfigurationProperties("gemerbarbier.google")
public class GoogleProperties {

  private String mapsApiKey;
  private String placesApiKey;
  private String placeId;

  /** Reviews change rarely; caching keeps page loads off Google's metered API. */
  private Duration reviewsCache = Duration.ofHours(6);

  private String placesBaseUrl = "https://maps.googleapis.com";
}
