package sk.gemerbarbier.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sk.gemerbarbier.domain.ServiceStatistic;
import sk.gemerbarbier.entity.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

  List<Reservation> findByBarberIdAndStartTimeBetween(Long barberId, LocalDateTime timeFrom,
      LocalDateTime timeTo);

  List<Reservation> findByBarberIdAndEndTimeAfter(Long barberId, LocalDateTime timeFrom);

  @Query("""
      SELECT new sk.gemerbarbier.domain.ServiceStatistic(
          r.cutService.name,
          COUNT(r),
          SUM(r.cutService.price)
      )
      FROM Reservation r
      WHERE r.startTime BETWEEN :from AND :to
        AND r.status = 'CREATED'
        AND (:barberId IS NULL OR r.barber.id = :barberId)
      GROUP BY r.cutService.name
      ORDER BY COUNT(r) DESC
      """)
  List<ServiceStatistic> getStatistics(LocalDateTime from, LocalDateTime to, Long barberId);

  @Query("""
      SELECT r FROM Reservation r
      WHERE r.status = sk.gemerbarbier.entity.ReservationStatus.CREATED
        AND r.reminderSentAt IS NULL
        AND r.startTime > :from
        AND r.startTime <= :to
        AND r.customerEmail IS NOT NULL
        AND r.customerEmail <> ''
      ORDER BY r.startTime
      """)
  List<Reservation> findEmailRemindable(LocalDateTime from, LocalDateTime to, Pageable pageable);

  @Query("""
      SELECT r FROM Reservation r
      WHERE r.status = sk.gemerbarbier.entity.ReservationStatus.CREATED
        AND r.smsReminderSentAt IS NULL
        AND r.startTime > :from
        AND r.startTime <= :to
        AND r.customerPhone IS NOT NULL
        AND r.customerPhone <> ''
      ORDER BY r.startTime
      """)
  List<Reservation> findSmsRemindable(LocalDateTime from, LocalDateTime to, Pageable pageable);

  /**
   * Claims the e-mail reminder for one reservation. Returns 1 for the winner and 0 for everyone
   * else, which is what makes concurrent or overlapping sweeps safe.
   */
  @Modifying
  @Query("""
      UPDATE Reservation r SET r.reminderSentAt = :sentAt
      WHERE r.id = :id
        AND r.reminderSentAt IS NULL
        AND r.status = sk.gemerbarbier.entity.ReservationStatus.CREATED
      """)
  int claimEmailReminder(@Param("id") Long id, @Param("sentAt") LocalDateTime sentAt);

  @Modifying
  @Query("""
      UPDATE Reservation r SET r.smsReminderSentAt = :sentAt
      WHERE r.id = :id
        AND r.smsReminderSentAt IS NULL
        AND r.status = sk.gemerbarbier.entity.ReservationStatus.CREATED
      """)
  int claimSmsReminder(@Param("id") Long id, @Param("sentAt") LocalDateTime sentAt);

  /** Hands a claim back after a failed send so the next sweep retries it. */
  @Modifying
  @Query("UPDATE Reservation r SET r.reminderSentAt = NULL WHERE r.id = :id")
  int releaseEmailReminder(@Param("id") Long id);

  @Modifying
  @Query("UPDATE Reservation r SET r.smsReminderSentAt = NULL WHERE r.id = :id")
  int releaseSmsReminder(@Param("id") Long id);
}
