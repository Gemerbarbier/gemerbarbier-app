package sk.gemerbarbier.mapper;

import javax.annotation.processing.Generated;
import sk.gemerbarbier.entity.CutService;
import sk.gemerbarbier.model.CutServiceResponseDto;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-07T12:42:22+0200",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 24 (Oracle Corporation)"
)
public class CutServiceMapperImpl implements CutServiceMapper {

    @Override
    public CutServiceResponseDto toCutServiceResponseDto(CutService cutService) {
        if ( cutService == null ) {
            return null;
        }

        CutServiceResponseDto cutServiceResponseDto = new CutServiceResponseDto();

        cutServiceResponseDto.setDuration( cutService.getDurationMinutes() );
        cutServiceResponseDto.setId( cutService.getId() );
        cutServiceResponseDto.setName( cutService.getName() );
        cutServiceResponseDto.setPrice( cutService.getPrice() );

        return cutServiceResponseDto;
    }
}
