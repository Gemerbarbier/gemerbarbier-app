package sk.gemerbarbier.service.api.admin;

import java.time.LocalDate;
import java.util.List;
import sk.gemerbarbier.domain.ServiceStatistic;
import sk.gemerbarbier.domain.StatisticsPeriod;

public interface StatisticsGetAdminApi {

  List<ServiceStatistic> getStatistics(StatisticsPeriod period, LocalDate date, Long barberId);
}
