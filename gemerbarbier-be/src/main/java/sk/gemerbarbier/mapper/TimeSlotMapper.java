package sk.gemerbarbier.mapper;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;
import sk.gemerbarbier.entity.TimeSlot;
import sk.gemerbarbier.entity.TimeSlotStatus;
import sk.gemerbarbier.model.AvailableTimeSlotResponseDto;
import sk.gemerbarbier.model.TimeSlotAdminResponseDto;
import sk.gemerbarbier.model.TimeSlotAdminResponseDto.StatusEnum;

@Mapper
public interface TimeSlotMapper {

  TimeSlotMapper INSTANCE = Mappers.getMapper(TimeSlotMapper.class);

  TimeSlotAdminResponseDto toTimeSlotAdminResponseDto(TimeSlot timeSlot);

  default List<AvailableTimeSlotResponseDto> toAvailableResponseDtoList(List<TimeSlot> slots) {
    return groupByDate(slots).entrySet().stream()
        .map(this::toAvailableTimeSlotResponseDto)
        .sorted(Comparator.comparing(AvailableTimeSlotResponseDto::getDate))
        .toList();
  }

  private Map<LocalDate, List<TimeSlot>> groupByDate(List<TimeSlot> slots) {
    return slots.stream()
        .collect(Collectors.groupingBy(ts -> ts.getStartTime().toLocalDate()));
  }

  private AvailableTimeSlotResponseDto toAvailableTimeSlotResponseDto(
      Map.Entry<LocalDate, List<TimeSlot>> entry) {
    var dto = new AvailableTimeSlotResponseDto();
    dto.setDate(entry.getKey());
    dto.setTimeList(extractAndSortTimes(entry.getValue()));
    return dto;
  }

  private List<String> extractAndSortTimes(List<TimeSlot> slots) {
    var formatter = DateTimeFormatter.ofPattern("HH:mm");
    return slots.stream()
        .map(ts -> ts.getStartTime()
            .toLocalTime()
            .format(formatter))
        .sorted()
        .toList();
  }

}
