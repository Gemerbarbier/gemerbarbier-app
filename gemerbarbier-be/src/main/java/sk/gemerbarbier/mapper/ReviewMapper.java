package sk.gemerbarbier.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import sk.gemerbarbier.domain.GoogleReviews;
import sk.gemerbarbier.model.ReviewsResponseDto;

@Mapper
public interface ReviewMapper {

  ReviewMapper INSTANCE = Mappers.getMapper(ReviewMapper.class);

  ReviewsResponseDto toReviewsResponseDto(GoogleReviews reviews);
}
