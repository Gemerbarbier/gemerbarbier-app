package sk.gemerbarbier.web.rest.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import sk.gemerbarbier.api.ReservationApi;
import sk.gemerbarbier.mapper.ReservationMapper;
import sk.gemerbarbier.model.ReservationCreateRequestDto;
import sk.gemerbarbier.model.ReservationResponseDto;
import sk.gemerbarbier.service.api.ReservationCreateApi;
import sk.gemerbarbier.web.rest.annotation.GemerbarbierApiController;

@GemerbarbierApiController
@AllArgsConstructor
public class ReservationCreateController implements ReservationApi {

  private final ReservationCreateApi reservationCreateService;

  @Override
  public ResponseEntity<ReservationResponseDto> createReservation(
      ReservationCreateRequestDto requestDto) {
    var request = ReservationMapper.INSTANCE.toReservationRequest(requestDto);
    reservationCreateService.createReservation(request);

    return ResponseEntity.ok().build();
  }
}
