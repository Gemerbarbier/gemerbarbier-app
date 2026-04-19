package sk.gemerbarbier.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import sk.gemerbarbier.entity.TimeSlot;
import sk.gemerbarbier.entity.TimeSlotStatus;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

  List<TimeSlot> findByBarberIdAndStartTimeBetweenOrderByStartTimeAsc(Long barberId,
      LocalDateTime startTimeFrom, LocalDateTime startTimeTo);

  List<TimeSlot> findByBarberIdAndStartTimeBetweenAndStatusOrderByStartTimeAsc(Long barberId,
      LocalDateTime startTimeFrom, LocalDateTime startTimeTo, TimeSlotStatus status);

  @Modifying
  @Query("""
          UPDATE TimeSlot t
          SET t.status = 'INACTIVE'
          WHERE t.barber.id = :barberId
            AND t.startTime >= :from
            AND t.startTime < :to
            AND t.status <> 'RESERVED'
      """)
  void deactivateSlotsForDay(
      Long barberId,
      LocalDateTime from,
      LocalDateTime to
  );

}
