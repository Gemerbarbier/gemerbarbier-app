package sk.gemerbarbier.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.entity.ReservationStatus;
import sk.gemerbarbier.entity.TimeSlot;
import sk.gemerbarbier.entity.TimeSlotStatus;
import sk.gemerbarbier.service.api.TimeSlotGetApi;
import sk.gemerbarbier.storage.api.CutServiceStorageApi;
import sk.gemerbarbier.storage.api.ReservationStorageApi;
import sk.gemerbarbier.storage.api.TimeSlotStorageApi;

@Service
@AllArgsConstructor
public class TimeSlotGetService implements TimeSlotGetApi {

  private final ReservationStorageApi reservationStorage;
  private final CutServiceStorageApi cutServiceStorage;
  private final TimeSlotStorageApi timeSlotStorage;

  @Override
  public List<TimeSlot> getAvailableSlots(Long barberId, Long serviceId) {
    var service = cutServiceStorage.getCutServiceById(serviceId);
    int requiredSlots = service.getDurationMinutes() / 20;

    var now = LocalDateTime.now();
    var to = now.plusDays(30);

    var slots = timeSlotStorage.getTimeSlots(barberId, now, to, TimeSlotStatus.ACTIVE);
    var reservations = reservationStorage.getReservations(barberId, now, to);

    var availableStarts = new ArrayList<TimeSlot>();
    for (int i = 0; i <= slots.size() - requiredSlots; i++) {

      boolean valid = true;

      for (int j = 0; j < requiredSlots - 1; j++) {
        var current = slots.get(i + j);
        var next = slots.get(i + j + 1);

        if (!current.getEndTime().equals(next.getStartTime())) {
          valid = false;
          break;
        }
      }

      if (!valid) {
        continue;
      }

      var start = slots.get(i).getStartTime();
      var end = slots.get(i + requiredSlots - 1).getEndTime();

      if (start.isBefore(now)) {
        continue;
      }

      boolean overlaps = reservations.stream().anyMatch(r ->
          r.getStatus() != ReservationStatus.CANCELLED &&
              r.getStartTime().isBefore(end) &&
              r.getEndTime().isAfter(start)
      );

      if (overlaps) {
        continue;
      }

      availableStarts.add(slots.get(i));
    }

    return availableStarts;
  }
}
