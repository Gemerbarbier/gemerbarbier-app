package sk.gemerbarbier.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import sk.gemerbarbier.entity.Barber;
import sk.gemerbarbier.model.BarberResponseDto;

@Mapper
public interface BarberMapper {

  BarberMapper INSTANCE = Mappers.getMapper(BarberMapper.class);

  BarberResponseDto toBarberResponseDto(Barber barber);
}
