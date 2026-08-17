package sk.gemerbarbier.storage.api;

import java.time.LocalDateTime;
import java.util.List;
import sk.gemerbarbier.domain.ServiceStatistic;
import sk.gemerbarbier.entity.Reservation;

public interface ReservationStorageApi {

  void createReservation(Reservation reservation);

  List<Reservation> getReservations(Long barberId, LocalDateTime from, LocalDateTime to);

  List<Reservation> getReservationsFrom(Long barberId, LocalDateTime from);

  Reservation getById(Long reservationId);

  List<ServiceStatistic> getStatistics(LocalDateTime from, LocalDateTime to, Long barberId);

  List<Reservation> getEmailRemindable(LocalDateTime from, LocalDateTime to, int limit);

  List<Reservation> getSmsRemindable(LocalDateTime from, LocalDateTime to, int limit);

  boolean claimEmailReminder(Long reservationId, LocalDateTime sentAt);

  boolean claimSmsReminder(Long reservationId, LocalDateTime sentAt);

  void releaseEmailReminder(Long reservationId);

  void releaseSmsReminder(Long reservationId);
}
