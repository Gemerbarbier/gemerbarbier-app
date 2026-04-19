package sk.gemerbarbier.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import sk.gemerbarbier.entity.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

  boolean existsByBarberIdAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(Long barberId,
      LocalDateTime s, LocalDateTime e);

  List<Reservation> findByBarberIdAndStartTimeBetween(Long barberId, LocalDateTime timeFrom,
      LocalDateTime timeTo);
}
