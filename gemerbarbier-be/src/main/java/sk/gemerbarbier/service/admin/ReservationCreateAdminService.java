package sk.gemerbarbier.service.admin;

import java.util.ArrayList;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sk.gemerbarbier.domain.request.ReservationRequest;
import sk.gemerbarbier.entity.ReservationStatus;
import sk.gemerbarbier.entity.TimeSlot;
import sk.gemerbarbier.entity.TimeSlotStatus;
import sk.gemerbarbier.mapper.ReservationMapper;
import sk.gemerbarbier.service.api.admin.ReservationCreateAdminApi;
import sk.gemerbarbier.storage.api.BarberStorageApi;
import sk.gemerbarbier.storage.api.CutServiceStorageApi;
import sk.gemerbarbier.storage.api.ReservationStorageApi;
import sk.gemerbarbier.storage.api.TimeSlotStorageApi;

@Service
@AllArgsConstructor
public class ReservationCreateAdminService implements ReservationCreateAdminApi {

  private final ReservationStorageApi reservationStorage;
  private final CutServiceStorageApi cutServiceStorage;
  private final BarberStorageApi barberStorage;
  private final TimeSlotStorageApi timeSlotStorage;

  @Override
  @Transactional
  public void createReservation(ReservationRequest request) {
    var service = cutServiceStorage.getCutServiceById(request.serviceId());
    var barber = barberStorage.getBarberById(request.barberId());

    var start = request.startTime();
    var end = start.plusMinutes(service.getDurationMinutes());

    var slots = timeSlotStorage.getTimeSlots(request.barberId(), start, end.minusSeconds(1));

    boolean alreadyTaken = slots.stream().anyMatch(s -> TimeSlotStatus.RESERVED.equals(s.getStatus()));
    if (alreadyTaken) {
      throw new IllegalStateException("Na tomto čase už existuje rezervácia");
    }

    slots.forEach(s -> s.setStatus(TimeSlotStatus.RESERVED));

    var existingStartTimes = slots.stream()
        .map(TimeSlot::getStartTime)
        .collect(Collectors.toSet());

    var newSlots = new ArrayList<TimeSlot>();
    var slotStart = start;
    while (slotStart.isBefore(end)) {
      if (!existingStartTimes.contains(slotStart)) {
        newSlots.add(TimeSlot.builder()
            .barber(barber)
            .startTime(slotStart)
            .endTime(slotStart.plusMinutes(20))
            .status(TimeSlotStatus.RESERVED)
            .build());
      }
      slotStart = slotStart.plusMinutes(20);
    }

    var reservation = ReservationMapper.INSTANCE.toReservation(request);
    reservation.setCutService(service);
    reservation.setBarber(barber);
    reservation.setStatus(ReservationStatus.CREATED);
    reservation.setEndTime(end);
    reservationStorage.createReservation(reservation);

    if (!slots.isEmpty()) {
      timeSlotStorage.saveAll(slots);
    }
    if (!newSlots.isEmpty()) {
      try {
        timeSlotStorage.saveAll(newSlots);
      } catch (DataIntegrityViolationException e) {
        throw new IllegalStateException("Na tomto čase už existuje rezervácia");
      }
    }
  }
}
