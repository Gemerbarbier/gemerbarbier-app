package sk.gemerbarbier.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import sk.gemerbarbier.domain.notification.ReservationNotificationPayload;
import sk.gemerbarbier.entity.Reservation;

/**
 * Flattens a reservation into the snapshot the notification services work from. Always call this
 * while the entity is still attached — the notification itself is rendered on another thread.
 */
@Mapper
public interface ReservationNotificationMapper {

  ReservationNotificationMapper INSTANCE = Mappers.getMapper(ReservationNotificationMapper.class);

  @Mapping(target = "serviceName", source = "cutService.name")
  @Mapping(target = "servicePrice", source = "cutService.price")
  @Mapping(target = "serviceDuration", source = "cutService.durationMinutes")
  @Mapping(target = "barberName", source = "barber.name")
  ReservationNotificationPayload toPayload(Reservation reservation);
}
