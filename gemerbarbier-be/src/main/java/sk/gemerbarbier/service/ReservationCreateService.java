package sk.gemerbarbier.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

  private static final String NOT_FREE_FOR_WHOLE_SERVICE =
      "Vybraná služba sa do tohto termínu nezmestí — nasledujúce časy už nie sú voľné. "
          + "Vyberte prosím iný čas.";

  private final ReservationStorageApi reservationStorage;
  private final CutServiceStorageApi cutServiceStorage;
  private final BarberStorageApi barberStorage;
  private final TimeSlotStorageApi timeSlotStorage;

  @Override
  @Transactional
  public void createReservation(ReservationRequest request) {
    var service = (cutServiceStorage.getCutServiceById(request.serviceId()));

    int requiredSlots = service.getDurationMinutes() / ReservationTimeValidator.SLOT_DURATION_MINUTES;
    var start = request.startTime();
    var end = start.plusMinutes(service.getDurationMinutes());

    ReservationTimeValidator.validateOnSlotGrid(start);

    if (!start.isAfter(LocalDateTime.now(ZoneId.of("Europe/Bratislava")))) {
      throw new IllegalStateException(
          "Tento termín už uplynul. Vyberte prosím neskorší čas.");
    }

    var slots = timeSlotStorage.getTimeSlots(request.barberId(), start, end.minusSeconds(1));

    if (slots.size() != requiredSlots) {
      throw new IllegalStateException(
          "V tomto čase nemáme otvorené. Vyberte prosím termín z ponuky voľných časov.");
    }

    if (!slots.getFirst().getStartTime().equals(start)
        || !slots.getLast().getEndTime().equals(end)) {
      throw new IllegalStateException(NOT_FREE_FOR_WHOLE_SERVICE);
    }

    for (int i = 0; i < slots.size(); i++) {
      var slot = slots.get(i);

      if (!TimeSlotStatus.ACTIVE.equals(slot.getStatus())) {
        throw new IllegalStateException(
            "Tento termín je už obsadený. Vyberte prosím iný čas.");
      }

      if (i > 0) {
        var prev = slots.get(i - 1);
        if (!prev.getEndTime().equals(slot.getStartTime())) {
          throw new IllegalStateException(NOT_FREE_FOR_WHOLE_SERVICE);
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
