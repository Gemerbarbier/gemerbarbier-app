package sk.gemerbarbier.service.api.admin;

import java.time.LocalDate;
import java.util.List;
import sk.gemerbarbier.entity.TimeSlot;

public interface TimeSlotGetAdminApi {

  List<TimeSlot> getTimeSlots(Long barberId, LocalDate date);

}
