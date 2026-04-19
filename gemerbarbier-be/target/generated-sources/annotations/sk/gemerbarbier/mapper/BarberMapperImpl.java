package sk.gemerbarbier.mapper;

import javax.annotation.processing.Generated;
import sk.gemerbarbier.entity.Barber;
import sk.gemerbarbier.model.BarberResponseDto;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-07T12:42:22+0200",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 24 (Oracle Corporation)"
)
public class BarberMapperImpl implements BarberMapper {

    @Override
    public BarberResponseDto toBarberResponseDto(Barber barber) {
        if ( barber == null ) {
            return null;
        }

        BarberResponseDto barberResponseDto = new BarberResponseDto();

        barberResponseDto.setId( barber.getId() );
        barberResponseDto.setName( barber.getName() );

        return barberResponseDto;
    }
}
