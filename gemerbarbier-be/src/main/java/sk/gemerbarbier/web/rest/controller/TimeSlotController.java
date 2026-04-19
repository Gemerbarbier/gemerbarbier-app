package sk.gemerbarbier.web.rest.controller;

import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import sk.gemerbarbier.api.TimeSlotApi;
import sk.gemerbarbier.mapper.TimeSlotMapper;
import sk.gemerbarbier.model.AvailableTimeSlotResponseDto;
import sk.gemerbarbier.service.api.TimeSlotGetApi;
import sk.gemerbarbier.web.rest.annotation.GemerbarbierApiController;

@GemerbarbierApiController
@AllArgsConstructor
public class TimeSlotController implements TimeSlotApi {

  private final TimeSlotGetApi timeSlotApi;

  @Override
  public ResponseEntity<List<AvailableTimeSlotResponseDto>> getAvailableSlots(Long barberId,
      Long serviceId) {

    var response = TimeSlotMapper.INSTANCE.toAvailableResponseDtoList(
        timeSlotApi.getAvailableSlots(barberId, serviceId));

    return ResponseEntity.ok(response);
  }
}
