package sk.gemerbarbier.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import sk.gemerbarbier.entity.CutService;
import sk.gemerbarbier.model.CutServiceResponseDto;

@Mapper
public interface CutServiceMapper {

  CutServiceMapper INSTANCE = Mappers.getMapper(CutServiceMapper.class);

  @Mapping(target = "duration", source = "durationMinutes")
  CutServiceResponseDto toCutServiceResponseDto(CutService cutService);

}
