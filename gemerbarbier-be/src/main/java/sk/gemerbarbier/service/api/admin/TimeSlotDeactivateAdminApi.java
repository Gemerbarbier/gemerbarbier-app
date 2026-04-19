package sk.gemerbarbier.service.api.admin;

import java.time.LocalDate;

public interface TimeSlotDeactivateAdminApi {

  void deactivateTimeSlots(Long barberId, LocalDate date);

}
