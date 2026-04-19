package sk.gemerbarbier.web.rest.controller.admin;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import sk.gemerbarbier.api.ReservationAdminApi;
import sk.gemerbarbier.mapper.ReservationMapper;
import sk.gemerbarbier.model.ReservationAdminResponseDto;
import sk.gemerbarbier.model.ReservationCreateAdminRequestDto;
import sk.gemerbarbier.service.api.ReservationCreateApi;
import sk.gemerbarbier.service.api.admin.ReservationCancelAdminApi;
import sk.gemerbarbier.service.api.admin.ReservationGetAdminApi;
import sk.gemerbarbier.web.rest.annotation.GemerbarbierApiController;

@GemerbarbierApiController
@AllArgsConstructor
public class ReservationAdminController implements ReservationAdminApi {

  private final ReservationGetAdminApi api;
  private final ReservationCancelAdminApi cancelAdminApi;
  private final ReservationCreateApi createApi;

  @Override
  public ResponseEntity<List<ReservationAdminResponseDto>> getReservationsByDate(Long barberId,
      LocalDate date) {
    var response = api.getReservations(barberId, date).stream()
        .map(ReservationMapper.INSTANCE::toReservationAdminResponseDto).toList();
    return ResponseEntity.ok(response);
  }

  @Override
  public ResponseEntity<Void> cancelReservation(Long reservationId) {
    cancelAdminApi.cancelReservation(reservationId);
    return ResponseEntity.ok().build();
  }

  @Override
  public ResponseEntity<Void> createReservationAsAdmin(
      ReservationCreateAdminRequestDto requestDto) {
    var request = ReservationMapper.INSTANCE.toReservationRequest(requestDto);
    createApi.createReservation(request);
    return ResponseEntity.ok().build();
  }
}
