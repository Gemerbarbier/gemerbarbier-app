package sk.gemerbarbier.service.admin;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.entity.TimeSlotStatus;
import sk.gemerbarbier.service.api.admin.TimeSlotUpdateAdminApi;
import sk.gemerbarbier.storage.api.TimeSlotStorageApi;

@Service
@AllArgsConstructor
public class TimeSlotUpdateAdminService implements TimeSlotUpdateAdminApi {

  private final TimeSlotStorageApi timeSlotStorageApi;

  @Override
  public void updateSlotStatus(Long slotId, TimeSlotStatus newStatus) {
    var slot = timeSlotStorageApi.getById(slotId);

    if (TimeSlotStatus.RESERVED.equals(slot.getStatus())) {
      throw new IllegalStateException("Cannot modify reserved slot");
    }

    slot.setStatus(newStatus);
    timeSlotStorageApi.save(slot);
  }
}


