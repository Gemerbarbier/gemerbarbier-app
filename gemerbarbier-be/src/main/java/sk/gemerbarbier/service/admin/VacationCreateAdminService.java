package sk.gemerbarbier.service.admin;

import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.entity.TimeSlot;
import sk.gemerbarbier.entity.TimeSlotStatus;
import sk.gemerbarbier.service.api.admin.VacationCreateAdminApi;
import sk.gemerbarbier.storage.api.BarberStorageApi;
import sk.gemerbarbier.storage.api.TimeSlotStorageApi;

@Service
@AllArgsConstructor
public class VacationCreateAdminService implements VacationCreateAdminApi {

  private final TimeSlotStorageApi timeSlotStorageApi;
  private final BarberStorageApi barberStorageApi;

  @Override
  @Transactional
  public void createVacation(
      Long barberId, LocalDate date, LocalTime startTime, LocalTime endTime) {
    var from = date.atTime(startTime);
    var to = date.atTime(endTime);

    timeSlotStorageApi.deactivateTimeSlots(barberId, from, to);

    var existingSlots = timeSlotStorageApi.getTimeSlots(barberId, from, to);
    var existingStartTimes = existingSlots.stream()
        .map(TimeSlot::getStartTime)
        .collect(Collectors.toSet());

    var barber = barberStorageApi.getBarberById(barberId);
    var newSlots = new ArrayList<TimeSlot>();
    var slotStart = from;
    while (slotStart.isBefore(to)) {
      if (!existingStartTimes.contains(slotStart)) {
        newSlots.add(TimeSlot.builder()
            .barber(barber)
            .startTime(slotStart)
            .endTime(slotStart.plusMinutes(20))
            .status(TimeSlotStatus.INACTIVE)
            .build());
      }
      slotStart = slotStart.plusMinutes(20);
    }

    if (!newSlots.isEmpty()) {
      timeSlotStorageApi.saveAll(newSlots);
    }
  }
}
