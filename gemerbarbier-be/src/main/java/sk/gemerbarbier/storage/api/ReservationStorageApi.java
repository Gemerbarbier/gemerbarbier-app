package sk.gemerbarbier.storage.api;

import java.time.LocalDateTime;
import java.util.List;
import sk.gemerbarbier.entity.Reservation;

public interface ReservationStorageApi {

  void createReservation(Reservation reservation);

  List<Reservation> getReservations(Long barberId, LocalDateTime from, LocalDateTime to);

  Reservation getById(Long reservationId);
}
