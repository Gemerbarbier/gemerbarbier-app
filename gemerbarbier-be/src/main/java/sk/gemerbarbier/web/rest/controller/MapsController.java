package sk.gemerbarbier.web.rest.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import sk.gemerbarbier.api.MapsApi;
import sk.gemerbarbier.config.GoogleProperties;
import sk.gemerbarbier.model.MapsConfigResponseDto;
import sk.gemerbarbier.web.rest.annotation.GemerbarbierApiController;

/**
 * Hands the browser what it needs to render the map. The Maps JavaScript API key is public by
 * design — it is protected by an HTTP referrer restriction in the Google Cloud console.
 */
@GemerbarbierApiController
@AllArgsConstructor
public class MapsController implements MapsApi {

  private final GoogleProperties googleProperties;

  @Override
  public ResponseEntity<MapsConfigResponseDto> getMapsConfig() {
    var response = new MapsConfigResponseDto()
        .apiKey(googleProperties.getMapsApiKey())
        .placeId(googleProperties.getPlaceId());

    return ResponseEntity.ok(response);
  }
}
