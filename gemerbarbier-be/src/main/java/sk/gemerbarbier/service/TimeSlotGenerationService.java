package sk.gemerbarbier.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.entity.TimeSlot;
import sk.gemerbarbier.entity.TimeSlotStatus;
import sk.gemerbarbier.storage.api.BarberStorageApi;
import sk.gemerbarbier.storage.api.TimeSlotStorageApi;

@Service
@RequiredArgsConstructor
public class TimeSlotGenerationService {

  private final BarberStorageApi barberStorageApi;
  private final TimeSlotStorageApi timeSlotStorageApi;
  private final Logger logger;

  @Scheduled(cron = "0 * * * * *", zone = "Europe/Bratislava")
  public void generateWeeklySlots() {
    logger.debug("Generating time slots...");

    var barberList = barberStorageApi.getBarberList();
    var nextMonday = LocalDate.now().plusWeeks(1).with(DayOfWeek.MONDAY);
    var weekEnd = nextMonday.plusDays(5);

    for (var barber : barberList) {
      var existingSlots = timeSlotStorageApi.getTimeSlots(barber.getId(), nextMonday.atStartOfDay(),
          weekEnd.atTime(23, 59));

      var existingStartTimes = new HashSet<LocalDateTime>();
      for (var slot : existingSlots) {
        existingStartTimes.add(slot.getStartTime());
      }

      var day = nextMonday;
      for (int i = 0; i < 5; i++) {
        var start = day.atTime(9, 0);
        var end = day.atTime(17, 0);

        while (start.isBefore(end)) {
          var slotEnd = start.plusMinutes(20);

          if (!existingStartTimes.contains(start)) {
            try {
              var timeSlot = TimeSlot.builder()
                  .barber(barber)
                  .startTime(start)
                  .endTime(slotEnd)
                  .status(TimeSlotStatus.ACTIVE)
                  .build();

              timeSlotStorageApi.save(timeSlot);
              existingStartTimes.add(start);
            } catch (Exception e) {
              logger.warn("Duplicate prevented for: {}.", start);
            }
          }
          start = start.plusMinutes(20);
        }
        day = day.plusDays(1);
      }
    }

    logger.debug("Time slots generated.");
  }
}
