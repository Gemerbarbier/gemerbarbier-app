package sk.gemerbarbier.service.api.admin;

import java.time.LocalDate;
import java.util.List;
import sk.gemerbarbier.entity.Reservation;

public interface ReservationGetAdminApi {

  List<Reservation> getReservations(Long barberId, LocalDate date);
}
