package sk.gemerbarbier.web.rest.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import sk.gemerbarbier.api.ReviewApi;
import sk.gemerbarbier.mapper.ReviewMapper;
import sk.gemerbarbier.model.ReviewsResponseDto;
import sk.gemerbarbier.service.api.GoogleReviewsApi;
import sk.gemerbarbier.web.rest.annotation.GemerbarbierApiController;

@GemerbarbierApiController
@AllArgsConstructor
public class ReviewController implements ReviewApi {

  private final GoogleReviewsApi googleReviewsApi;

  @Override
  public ResponseEntity<ReviewsResponseDto> getReviews() {
    return ResponseEntity.ok(ReviewMapper.INSTANCE.toReviewsResponseDto(
        googleReviewsApi.getReviews()));
  }
}
