package sk.gemerbarbier.service.admin;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.entity.TimeSlot;
import sk.gemerbarbier.service.api.admin.TimeSlotGetAdminApi;
import sk.gemerbarbier.storage.api.TimeSlotStorageApi;

@Service
@AllArgsConstructor
public class TimeSlotGetAdminService implements TimeSlotGetAdminApi {

  private final TimeSlotStorageApi timeSlotStorageApi;

  @Override
  public List<TimeSlot> getTimeSlots(Long barberId, LocalDate date) {
    var from = date.atStartOfDay();
    var to = date.atTime(23, 59);

    return timeSlotStorageApi.getTimeSlots(barberId, from, to);
  }
}


