package sk.gemerbarbier.service.admin;

import jakarta.transaction.Transactional;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.service.api.admin.TimeSlotDeactivateAdminApi;
import sk.gemerbarbier.storage.api.TimeSlotStorageApi;

@Service
@AllArgsConstructor
public class TimeSlotDeactivateAdminService implements TimeSlotDeactivateAdminApi {

  private final TimeSlotStorageApi timeSlotStorageApi;

  @Override
  @Transactional
  public void deactivateTimeSlots(Long barberId, LocalDate date) {
    var from = date.atStartOfDay();
    var to = date.atTime(23, 59);

    timeSlotStorageApi.deactivateTimeSlots(barberId, from, to);
  }
}


