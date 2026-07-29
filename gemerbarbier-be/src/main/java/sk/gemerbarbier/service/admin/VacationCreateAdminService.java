package sk.gemerbarbier.service.admin;

import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.entity.Reservation;
import sk.gemerbarbier.entity.ReservationStatus;
import sk.gemerbarbier.entity.TimeSlot;
import sk.gemerbarbier.entity.TimeSlotStatus;
import sk.gemerbarbier.service.api.admin.VacationCreateAdminApi;
import sk.gemerbarbier.storage.api.BarberStorageApi;
import sk.gemerbarbier.storage.api.ReservationStorageApi;
import sk.gemerbarbier.storage.api.TimeSlotStorageApi;

@Service
@AllArgsConstructor
public class VacationCreateAdminService implements VacationCreateAdminApi {

  private final ReservationStorageApi reservationStorageApi;
  private final TimeSlotStorageApi timeSlotStorageApi;
  private final BarberStorageApi barberStorageApi;

  @Override
  @Transactional
  public void createVacation(
      Long barberId, LocalDate date, LocalTime startTime, LocalTime endTime,
      int slotDurationMinutes) {
    var barber = barberStorageApi.getBarberById(barberId);
    var intervalFrom = date.atTime(startTime);
    var intervalTo = date.atTime(endTime);

    var current = intervalFrom;
    while (current.isBefore(intervalTo)) {
      var slotEnd = current.plusMinutes(slotDurationMinutes);
      if (slotEnd.isAfter(intervalTo)) {
        break;
      }

      var existingSlots = timeSlotStorageApi.getTimeSlots(
          barberId, current, slotEnd.minusSeconds(1));
      boolean alreadyTaken = existingSlots.stream()
          .anyMatch(s -> TimeSlotStatus.RESERVED.equals(s.getStatus()));

      if (!alreadyTaken) {
        var reservation = Reservation.builder()
            .customerName("Dovolenka")
            .barber(barber)
            .cutService(null)
            .startTime(current)
            .endTime(slotEnd)
            .status(ReservationStatus.CREATED)
            .build();
        reservationStorageApi.createReservation(reservation);

        var existingStartTimes = existingSlots.stream()
            .map(TimeSlot::getStartTime)
            .collect(Collectors.toSet());
        existingSlots.forEach(s -> s.setStatus(TimeSlotStatus.RESERVED));
        if (!existingSlots.isEmpty()) {
          timeSlotStorageApi.saveAll(existingSlots);
        }

        var newSlots = new ArrayList<TimeSlot>();
        var tsCurrent = current;
        while (tsCurrent.isBefore(slotEnd)) {
          if (!existingStartTimes.contains(tsCurrent)) {
            newSlots.add(TimeSlot.builder()
                .barber(barber)
                .startTime(tsCurrent)
                .endTime(tsCurrent.plusMinutes(20))
                .status(TimeSlotStatus.RESERVED)
                .build());
          }
          tsCurrent = tsCurrent.plusMinutes(20);
        }
        if (!newSlots.isEmpty()) {
          timeSlotStorageApi.saveAll(newSlots);
        }
      }

      current = slotEnd;
    }
  }
}
