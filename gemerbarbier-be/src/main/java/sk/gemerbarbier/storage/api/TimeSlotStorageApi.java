package sk.gemerbarbier.storage.api;

import java.time.LocalDateTime;
import java.util.List;
import sk.gemerbarbier.entity.TimeSlot;
import sk.gemerbarbier.entity.TimeSlotStatus;

public interface TimeSlotStorageApi {

  List<TimeSlot> getTimeSlots(Long barberId, LocalDateTime from, LocalDateTime to,
      TimeSlotStatus status);

  List<TimeSlot> getTimeSlots(Long barberId, LocalDateTime from, LocalDateTime to);

  TimeSlot getById(Long slotId);

  void deactivateTimeSlots(Long barberId, LocalDateTime from, LocalDateTime to);

  void save(TimeSlot timeSlot);

  void saveAll(List<TimeSlot> timeSlots);
}
