package sk.gemerbarbier.service.api;

import java.util.List;
import sk.gemerbarbier.entity.TimeSlot;

public interface TimeSlotGetApi {

  List<TimeSlot> getAvailableSlots(Long barberId, Long serviceId);
}
