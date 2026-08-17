package sk.gemerbarbier.service.google;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import sk.gemerbarbier.config.GoogleProperties;
import sk.gemerbarbier.domain.GoogleReview;
import sk.gemerbarbier.domain.GoogleReviews;
import sk.gemerbarbier.service.api.GoogleReviewsApi;

/**
 * Fetches the shop's Google reviews.
 *
 * <p>Results are cached because the previous implementation called Google's metered API on every
 * page load. When a refresh fails the last good copy is served instead of an error — a hiccup at
 * Google should not blank out a section of the homepage.
 */
@Service
public class GoogleReviewsService implements GoogleReviewsApi {

  private final Logger logger;
  private final RestClient restClient;
  private final GoogleProperties properties;
  private final AtomicReference<CachedReviews> cache = new AtomicReference<>();

  public GoogleReviewsService(Logger logger,
      @Qualifier("googlePlacesRestClient") RestClient restClient, GoogleProperties properties) {
    this.logger = logger;
    this.restClient = restClient;
    this.properties = properties;
  }

  @Override
  public GoogleReviews getReviews() {
    var cached = cache.get();

    if (cached != null && cached.isFresh(properties.getReviewsCache())) {
      return cached.reviews();
    }

    if (!StringUtils.hasText(properties.getPlacesApiKey())
        || !StringUtils.hasText(properties.getPlaceId())) {
      logger.warn("Google Places is not configured — returning no reviews.");
      return GoogleReviews.empty();
    }

    try {
      var fresh = fetchFromGoogle();
      cache.set(new CachedReviews(fresh, Instant.now()));

      return fresh;
    } catch (Exception e) {
      if (cached != null) {
        logger.warn("Refreshing Google reviews failed — serving the cached copy.", e);
        return cached.reviews();
      }

      logger.warn("Fetching Google reviews failed and nothing is cached yet.", e);
      return GoogleReviews.empty();
    }
  }

  private GoogleReviews fetchFromGoogle() {
    var response = restClient.get()
        .uri(uriBuilder -> uriBuilder
            .path("/maps/api/place/details/json")
            .queryParam("place_id", properties.getPlaceId())
            .queryParam("fields", "reviews,rating,user_ratings_total")
            .queryParam("key", properties.getPlacesApiKey())
            .build())
        .retrieve()
        .body(PlaceDetailsResponse.class);

    if (response == null || !"OK".equals(response.status())) {
      throw new IllegalStateException("Google Places returned status "
          + (response == null ? "no body" : response.status() + ": " + response.errorMessage()));
    }

    var result = Optional.ofNullable(response.result()).orElseGet(PlaceResult::empty);
    var reviews = Optional.ofNullable(result.reviews()).orElseGet(List::of).stream()
        .map(review -> new GoogleReview(review.authorName(), review.rating(), review.text(),
            review.relativeTimeDescription(), review.profilePhotoUrl()))
        .toList();

    logger.debug("Fetched {} Google review(s).", reviews.size());

    return new GoogleReviews(reviews,
        Optional.ofNullable(result.rating()).orElse(0.0),
        Optional.ofNullable(result.userRatingsTotal()).orElse(0));
  }

  private record CachedReviews(GoogleReviews reviews, Instant fetchedAt) {

    boolean isFresh(Duration ttl) {
      return Instant.now().isBefore(fetchedAt.plus(ttl));
    }
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record PlaceDetailsResponse(String status,
                                      @JsonProperty("error_message") String errorMessage,
                                      PlaceResult result) {

  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record PlaceResult(Double rating,
                             @JsonProperty("user_ratings_total") Integer userRatingsTotal,
                             List<PlaceReview> reviews) {

    static PlaceResult empty() {
      return new PlaceResult(0.0, 0, List.of());
    }
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record PlaceReview(@JsonProperty("author_name") String authorName,
                             Integer rating,
                             String text,
                             @JsonProperty("relative_time_description")
                             String relativeTimeDescription,
                             @JsonProperty("profile_photo_url") String profilePhotoUrl) {

  }
}
