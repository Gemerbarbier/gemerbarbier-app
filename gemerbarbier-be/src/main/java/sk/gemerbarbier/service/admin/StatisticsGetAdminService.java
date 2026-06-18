package sk.gemerbarbier.service.admin;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import sk.gemerbarbier.domain.ServiceStatistic;
import sk.gemerbarbier.domain.StatisticsPeriod;
import sk.gemerbarbier.service.api.admin.StatisticsGetAdminApi;
import sk.gemerbarbier.storage.api.ReservationStorageApi;

@Service
@AllArgsConstructor
public class StatisticsGetAdminService implements StatisticsGetAdminApi {

  private final ReservationStorageApi reservationStorage;

  @Override
  public List<ServiceStatistic> getStatistics(StatisticsPeriod period, LocalDate date) {
    LocalDate referenceDate = date != null ? date : LocalDate.now();
    LocalDateTime to = referenceDate.plusDays(1).atStartOfDay();
    LocalDateTime from = switch (period) {
      case WEEK ->
          referenceDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
      case MONTH -> referenceDate.withDayOfMonth(1).atStartOfDay();
      case YEAR -> referenceDate.withDayOfYear(1).atStartOfDay();
    };
    return reservationStorage.getStatistics(from, to);
  }
}
