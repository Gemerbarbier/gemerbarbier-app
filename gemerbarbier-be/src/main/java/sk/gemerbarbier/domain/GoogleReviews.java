package sk.gemerbarbier.domain;

import java.util.List;

/** The shop's Google reviews together with its aggregate rating. */
public record GoogleReviews(List<GoogleReview> reviews, Double averageRating, Integer totalReviews) {

  public static GoogleReviews empty() {
    return new GoogleReviews(List.of(), 0.0, 0);
  }
}
