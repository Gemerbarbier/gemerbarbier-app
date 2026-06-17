package sk.gemerbarbier.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import sk.gemerbarbier.domain.ServiceStatistic;
import sk.gemerbarbier.model.ServiceStatisticsResponseDto;

@Mapper
public interface StatisticsMapper {

  StatisticsMapper INSTANCE = Mappers.getMapper(StatisticsMapper.class);

  ServiceStatisticsResponseDto toDto(ServiceStatistic statistic);
}
