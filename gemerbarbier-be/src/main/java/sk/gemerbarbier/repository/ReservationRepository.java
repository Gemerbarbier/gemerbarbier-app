package sk.gemerbarbier.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import sk.gemerbarbier.domain.ServiceStatistic;
import sk.gemerbarbier.entity.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

  List<Reservation> findByBarberIdAndStartTimeBetween(Long barberId, LocalDateTime timeFrom,
      LocalDateTime timeTo);

  @Query("""
      SELECT new sk.gemerbarbier.domain.ServiceStatistic(
          r.cutService.name,
          COUNT(r),
          SUM(r.cutService.price)
      )
      FROM Reservation r
      WHERE r.startTime BETWEEN :from AND :to
        AND r.status = 'CREATED'
      GROUP BY r.cutService.name
      ORDER BY COUNT(r) DESC
      """)
  List<ServiceStatistic> getStatistics(LocalDateTime from, LocalDateTime to);
}
