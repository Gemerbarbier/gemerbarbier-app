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
import sk.gemerbarbier.service.api.admin.TimeSlotGenerateAdminApi;
import sk.gemerbarbier.storage.api.BarberStorageApi;
import sk.gemerbarbier.storage.api.TimeSlotStorageApi;

@Service
@AllArgsConstructor
public class TimeSlotGenerateAdminService implements TimeSlotGenerateAdminApi {

  private static final int SLOT_DURATION_MINUTES = 20;
  private static final LocalTime LUNCH_FROM = LocalTime.of(13, 0);
  private static final LocalTime LUNCH_TO = LocalTime.of(14, 0);

  private final TimeSlotStorageApi timeSlotStorageApi;
  private final BarberStorageApi barberStorageApi;

  @Override
  @Transactional
  public void generateTimeSlots(Long barberId, LocalDate date, LocalTime startTime, LocalTime endTime) {
    var barber = barberStorageApi.getBarberById(barberId);
    var intervalFrom = date.atTime(startTime);
    var intervalTo = date.atTime(endTime);

    // Existujúce sloty (vrátane rezervovaných) sa nikdy neprepisujú - dopĺňajú sa len chýbajúce.
    var existingSlots = timeSlotStorageApi.getTimeSlots(barberId, intervalFrom, intervalTo.minusSeconds(1));
    var existingStartTimes = existingSlots.stream()
        .map(TimeSlot::getStartTime)
        .collect(Collectors.toSet());

    var newSlots = new ArrayList<TimeSlot>();
    var current = intervalFrom;
    while (current.isBefore(intervalTo)) {
      var slotEnd = current.plusMinutes(SLOT_DURATION_MINUTES);
      if (slotEnd.isAfter(intervalTo)) {
        break;
      }
      if (!existingStartTimes.contains(current)) {
        newSlots.add(TimeSlot.builder()
            .barber(barber)
            .startTime(current)
            .endTime(slotEnd)
            .status(isLunchBreak(current.toLocalTime()) ? TimeSlotStatus.INACTIVE : TimeSlotStatus.ACTIVE)
            .build());
      }
      current = current.plusMinutes(SLOT_DURATION_MINUTES);
    }
    if (!newSlots.isEmpty()) {
      timeSlotStorageApi.saveAll(newSlots);
    }
  }

  private static boolean isLunchBreak(LocalTime time) {
    return !time.isBefore(LUNCH_FROM) && time.isBefore(LUNCH_TO);
  }
}
