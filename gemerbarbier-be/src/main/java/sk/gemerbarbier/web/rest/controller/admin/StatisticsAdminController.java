package sk.gemerbarbier.web.rest.controller.admin;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import sk.gemerbarbier.api.StatisticsAdminApi;
import sk.gemerbarbier.domain.StatisticsPeriod;
import sk.gemerbarbier.mapper.StatisticsMapper;
import sk.gemerbarbier.model.ServiceStatisticsResponseDto;
import sk.gemerbarbier.service.api.admin.StatisticsGetAdminApi;
import sk.gemerbarbier.web.rest.annotation.GemerbarbierApiController;

@GemerbarbierApiController
@AllArgsConstructor
public class StatisticsAdminController implements StatisticsAdminApi {

  private final StatisticsGetAdminApi statisticsApi;

  @Override
  public ResponseEntity<List<ServiceStatisticsResponseDto>> getServiceStatistics(
      String period, LocalDate date) {
    var response = statisticsApi.getStatistics(StatisticsPeriod.valueOf(period), date).stream()
        .map(StatisticsMapper.INSTANCE::toDto)
        .toList();
    return ResponseEntity.ok(response);
  }
}
