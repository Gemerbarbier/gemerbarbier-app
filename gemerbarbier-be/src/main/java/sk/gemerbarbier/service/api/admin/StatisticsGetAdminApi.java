package sk.gemerbarbier.service.api.admin;

import java.util.List;
import sk.gemerbarbier.domain.ServiceStatistic;
import sk.gemerbarbier.domain.StatisticsPeriod;

public interface StatisticsGetAdminApi {

  List<ServiceStatistic> getStatistics(StatisticsPeriod period);
}
