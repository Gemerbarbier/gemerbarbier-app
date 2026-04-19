package sk.gemerbarbier.service.admin;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.entity.ReservationStatus;
import sk.gemerbarbier.entity.TimeSlotStatus;
import sk.gemerbarbier.service.api.admin.ReservationCancelAdminApi;
import sk.gemerbarbier.storage.api.ReservationStorageApi;
import sk.gemerbarbier.storage.api.TimeSlotStorageApi;

@Service
@AllArgsConstructor
public class ReservationCancelAdminService implements ReservationCancelAdminApi {

  private final ReservationStorageApi reservationStorage;
  private final TimeSlotStorageApi timeSlotStorageApi;

  @Override
  public void cancelReservation(Long reservationId) {
    var reservation = reservationStorage.getById(reservationId);

    if (ReservationStatus.CANCELLED.equals(reservation.getStatus())) {
      throw new RuntimeException("Reservation already cancelled");
    }

    reservation.setStatus(ReservationStatus.CANCELLED);

    var slots = timeSlotStorageApi.getTimeSlots(reservation.getBarber().getId(),
        reservation.getStartTime(), reservation.getEndTime(), TimeSlotStatus.RESERVED);

    slots.forEach(slot -> {
      if (slot.getStatus() == TimeSlotStatus.RESERVED) {
        slot.setStatus(TimeSlotStatus.ACTIVE);
      }
    });

    timeSlotStorageApi.saveAll(slots);
  }
}
