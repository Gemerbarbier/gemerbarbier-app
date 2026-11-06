package sk.gemerbarbier.web.rest.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import sk.gemerbarbier.api.PrivacyApi;
import sk.gemerbarbier.config.RetentionProperties;
import sk.gemerbarbier.model.PrivacyConfigResponseDto;
import sk.gemerbarbier.web.rest.annotation.GemerbarbierApiController;

/** Lets the privacy policy page state the retention period the backend actually enforces. */
@GemerbarbierApiController
@AllArgsConstructor
public class PrivacyController implements PrivacyApi {

  private final RetentionProperties retentionProperties;

  @Override
  public ResponseEntity<PrivacyConfigResponseDto> getPrivacyConfig() {
    var response = new PrivacyConfigResponseDto()
        .reservationRetentionMonths(retentionProperties.getReservationMonths());

    return ResponseEntity.ok(response);
  }
}
