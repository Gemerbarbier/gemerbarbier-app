package sk.gemerbarbier.domain;

/** A single Google review, already flattened out of the Places API's response shape. */
public record GoogleReview(String name, Integer rating, String text, String date,
                           String profilePhoto) {

}
