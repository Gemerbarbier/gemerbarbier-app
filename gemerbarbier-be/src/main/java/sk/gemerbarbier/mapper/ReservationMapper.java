package sk.gemerbarbier.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import sk.gemerbarbier.domain.request.ReservationRequest;
import sk.gemerbarbier.entity.Reservation;
import sk.gemerbarbier.model.ReservationAdminResponseDto;
import sk.gemerbarbier.model.ReservationCreateAdminRequestDto;
import sk.gemerbarbier.model.ReservationCreateRequestDto;

@Mapper
public interface ReservationMapper {

  ReservationMapper INSTANCE = Mappers.getMapper(ReservationMapper.class);

  @Mapping(target = "barber", ignore = true)
  @Mapping(target = "cutService", ignore = true)
  @Mapping(target = "endTime", ignore = true)
  @Mapping(target = "status", ignore = true)
  @Mapping(target = "id", ignore = true)
  Reservation toReservation(ReservationRequest request);

  @Mapping(target = "note", ignore = true)
  ReservationRequest toReservationRequest(ReservationCreateRequestDto requestDto);

  ReservationRequest toReservationRequest(ReservationCreateAdminRequestDto requestDto);

  @Mapping(target = "cutServiceName", source = "cutService.name")
  ReservationAdminResponseDto toReservationAdminResponseDto(Reservation reservation);

}
