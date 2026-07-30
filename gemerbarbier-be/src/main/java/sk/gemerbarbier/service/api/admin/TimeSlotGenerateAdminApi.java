package sk.gemerbarbier.service.api.admin;

import java.time.LocalDate;
import java.time.LocalTime;

public interface TimeSlotGenerateAdminApi {

  void generateTimeSlots(Long barberId, LocalDate date, LocalTime startTime, LocalTime endTime);
}
