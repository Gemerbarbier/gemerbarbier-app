package sk.gemerbarbier.service.api.admin;

import sk.gemerbarbier.entity.TimeSlotStatus;

public interface TimeSlotUpdateAdminApi {

  void updateSlotStatus(Long slotId, TimeSlotStatus newStatus);

}
