package sk.gemerbarbier.service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.domain.request.ReservationRequest;
import sk.gemerbarbier.entity.ReservationStatus;
import sk.gemerbarbier.entity.TimeSlotStatus;
import sk.gemerbarbier.mapper.ReservationMapper;
import sk.gemerbarbier.service.api.ReservationCreateApi;
import sk.gemerbarbier.storage.api.BarberStorageApi;
import sk.gemerbarbier.storage.api.CutServiceStorageApi;
import sk.gemerbarbier.storage.api.ReservationStorageApi;
import sk.gemerbarbier.storage.api.TimeSlotStorageApi;

@Service
@AllArgsConstructor
public class ReservationCreateService implements ReservationCreateApi {

  private final ReservationStorageApi reservationStorage;
  private final CutServiceStorageApi cutServiceStorage;
  private final BarberStorageApi barberStorage;
  private final TimeSlotStorageApi timeSlotStorage;

  @Override
  public void createReservation(ReservationRequest request) {
    var service = (cutServiceStorage.getCutServiceById(request.serviceId()));

    int requiredSlots = service.getDurationMinutes() / 20;
    var start = request.startTime();
    var end = start.plusMinutes(service.getDurationMinutes());

    var slots = timeSlotStorage.getTimeSlots(request.barberId(), start, end.minusSeconds(1));

    if (slots.size() != requiredSlots) {
      throw new IllegalStateException("Invalid slot count");
    }

    for (int i = 0; i < slots.size(); i++) {
      var slot = slots.get(i);

      if (!TimeSlotStatus.ACTIVE.equals(slot.getStatus())) {
        throw new IllegalStateException("Slot already taken");
      }

      if (i > 0) {
        var prev = slots.get(i - 1);
        if (!prev.getEndTime().equals(slot.getStartTime())) {
          throw new IllegalStateException("Slots not continuous");
        }
      }
    }

    slots.forEach(s -> s.setStatus(TimeSlotStatus.RESERVED));

    var reservation = ReservationMapper.INSTANCE.toReservation(request);
    reservation.setCutService(cutServiceStorage.getCutServiceById(request.serviceId()));
    reservation.setBarber(barberStorage.getBarberById(request.barberId()));
    reservation.setStatus(ReservationStatus.CREATED);
    reservation.setEndTime(end);
    reservationStorage.createReservation(reservation);
    timeSlotStorage.saveAll(slots);
  }
}
