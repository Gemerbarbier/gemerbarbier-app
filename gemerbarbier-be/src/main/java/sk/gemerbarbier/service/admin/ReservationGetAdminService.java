package sk.gemerbarbier.service.admin;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.entity.Reservation;
import sk.gemerbarbier.service.api.admin.ReservationGetAdminApi;
import sk.gemerbarbier.storage.api.ReservationStorageApi;

@Service
@AllArgsConstructor
public class ReservationGetAdminService implements ReservationGetAdminApi {

  private final ReservationStorageApi reservationStorage;

  @Override
  public List<Reservation> getReservations(Long barberId, LocalDate date) {
    var from = date.atStartOfDay();
    var to = date.atTime(23, 59);

    return reservationStorage.getReservations(barberId, from, to);
  }
}
