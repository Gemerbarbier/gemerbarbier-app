package sk.gemerbarbier.storage;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.stereotype.Component;
import sk.gemerbarbier.entity.TimeSlot;
import sk.gemerbarbier.entity.TimeSlotStatus;
import sk.gemerbarbier.repository.TimeSlotRepository;
import sk.gemerbarbier.storage.api.TimeSlotStorageApi;

@RequiredArgsConstructor
@Component
public class TimeSlotStorage implements TimeSlotStorageApi {

  private final Logger logger;
  private final TimeSlotRepository repository;

  @Override
  public List<TimeSlot> getTimeSlots(Long barberId, LocalDateTime from, LocalDateTime to,
      TimeSlotStatus status) {
    logger.debug("Getting time slot list for barber with id {} from {} to {} with status {}.",
        barberId, from, to, status);
    return repository.findByBarberIdAndStartTimeBetweenAndStatusOrderByStartTimeAsc(barberId, from,
        to, status);
  }

  @Override
  public List<TimeSlot> getTimeSlots(Long barberId, LocalDateTime from, LocalDateTime to) {
    logger.debug("Getting time slot list for barber with id {} from {} to {}.", barberId, from, to);
    return repository.findByBarberIdAndStartTimeBetweenOrderByStartTimeAsc(barberId, from,
        to);
  }

  @Override
  public TimeSlot getById(Long slotId) {
    logger.debug("Getting time by id {}.", slotId);
    return repository.findById(slotId).orElseThrow(
        () -> new EntityNotFoundException("Time slot with id " + slotId + " not found"));
  }

  @Override
  public void deactivateTimeSlots(Long barberId, LocalDateTime from, LocalDateTime to) {
    logger.debug("Deactivating time slots for barber with id {} from {} to {}.", barberId,
        from, to);
    repository.deactivateSlotsForDay(barberId, from, to);
  }

  @Override
  public void save(TimeSlot timeSlot) {
    logger.debug("Saving time slot: {}:{} for barber {}.", timeSlot.getStartTime().getHour(),
        timeSlot.getStartTime().getMinute(), timeSlot.getBarber().getName());
    repository.save(timeSlot);
  }

  @Override
  public void saveAll(List<TimeSlot> timeSlots) {
    logger.debug("Saving multiple time slots.");
    repository.saveAll(timeSlots);
  }
}
