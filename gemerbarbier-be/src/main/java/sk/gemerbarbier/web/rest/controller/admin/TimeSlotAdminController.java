package sk.gemerbarbier.web.rest.controller.admin;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import sk.gemerbarbier.api.TimeSlotAdminApi;
import sk.gemerbarbier.entity.TimeSlotStatus;
import sk.gemerbarbier.mapper.TimeSlotMapper;
import sk.gemerbarbier.model.TimeSlotAdminResponseDto;
import sk.gemerbarbier.model.TimeSlotStatusUpdateRequestDto;
import sk.gemerbarbier.service.api.admin.TimeSlotDeactivateAdminApi;
import sk.gemerbarbier.service.api.admin.TimeSlotGetAdminApi;
import sk.gemerbarbier.service.api.admin.TimeSlotUpdateAdminApi;
import sk.gemerbarbier.web.rest.annotation.GemerbarbierApiController;

@GemerbarbierApiController
@AllArgsConstructor
public class TimeSlotAdminController implements TimeSlotAdminApi {

  private final TimeSlotUpdateAdminApi timeSlotUpdateAdminApi;
  private final TimeSlotGetAdminApi timeSlotGetAdminApi;
  private final TimeSlotDeactivateAdminApi timeSlotDeactivateAdminApi;

  @Override
  public ResponseEntity<Void> updateTimeSlotStatus(Long slotId,
      TimeSlotStatusUpdateRequestDto requestDto) {
    timeSlotUpdateAdminApi.updateSlotStatus(slotId,
        TimeSlotStatus.valueOf(requestDto.getStatus().getValue()));

    return ResponseEntity.ok().build();
  }

  @Override
  public ResponseEntity<List<TimeSlotAdminResponseDto>> getTimeSlots(
      Long barberId, LocalDate date) {
    var response = timeSlotGetAdminApi.getTimeSlots(barberId, date).stream()
        .map(TimeSlotMapper.INSTANCE::toTimeSlotAdminResponseDto).toList();

    return ResponseEntity.ok(response);
  }

  @Override
  public ResponseEntity<Void> deactivateTimeSlots(Long barberId, LocalDate date) {
    timeSlotDeactivateAdminApi.deactivateTimeSlots(barberId, date);

    return ResponseEntity.ok().build();
  }

}
