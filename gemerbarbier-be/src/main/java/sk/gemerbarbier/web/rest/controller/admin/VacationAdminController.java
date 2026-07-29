package sk.gemerbarbier.web.rest.controller.admin;

import java.time.LocalTime;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import sk.gemerbarbier.api.VacationAdminApi;
import sk.gemerbarbier.model.VacationCreateAdminRequestDto;
import sk.gemerbarbier.service.api.admin.VacationCreateAdminApi;
import sk.gemerbarbier.web.rest.annotation.GemerbarbierApiController;

@GemerbarbierApiController
@AllArgsConstructor
public class VacationAdminController implements VacationAdminApi {

  private final VacationCreateAdminApi vacationCreateAdminApi;

  @Override
  public ResponseEntity<Void> createVacation(VacationCreateAdminRequestDto requestDto) {
    vacationCreateAdminApi.createVacation(
        requestDto.getBarberId(),
        requestDto.getDate(),
        LocalTime.parse(requestDto.getStartTime()),
        LocalTime.parse(requestDto.getEndTime()),
        requestDto.getSlotDurationMinutes()
    );
    return ResponseEntity.status(201).build();
  }
}
