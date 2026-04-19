package sk.gemerbarbier.model;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.openapitools.jackson.nullable.JsonNullable;
import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.*;
import jakarta.annotation.Generated;

/**
 * AvailableTimeSlotResponseDto
 */

@JsonTypeName("AvailableTimeSlotResponse")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-04-07T12:42:19.199718400+02:00[Europe/Bratislava]", comments = "Generator version: 7.5.0")
public class AvailableTimeSlotResponseDto {

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private LocalDate date;

  @Valid
  private List<String> timeList = new ArrayList<>();

  public AvailableTimeSlotResponseDto date(LocalDate date) {
    this.date = date;
    return this;
  }

  /**
   * Get date
   * @return date
  */
  @Valid 
  @Schema(name = "date", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("date")
  public LocalDate getDate() {
    return date;
  }

  public void setDate(LocalDate date) {
    this.date = date;
  }

  public AvailableTimeSlotResponseDto timeList(List<String> timeList) {
    this.timeList = timeList;
    return this;
  }

  public AvailableTimeSlotResponseDto addTimeListItem(String timeListItem) {
    if (this.timeList == null) {
      this.timeList = new ArrayList<>();
    }
    this.timeList.add(timeListItem);
    return this;
  }

  /**
   * Get timeList
   * @return timeList
  */
  
  @Schema(name = "timeList", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("timeList")
  public List<String> getTimeList() {
    return timeList;
  }

  public void setTimeList(List<String> timeList) {
    this.timeList = timeList;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    AvailableTimeSlotResponseDto availableTimeSlotResponse = (AvailableTimeSlotResponseDto) o;
    return Objects.equals(this.date, availableTimeSlotResponse.date) &&
        Objects.equals(this.timeList, availableTimeSlotResponse.timeList);
  }

  @Override
  public int hashCode() {
    return Objects.hash(date, timeList);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class AvailableTimeSlotResponseDto {\n");
    sb.append("    date: ").append(toIndentedString(date)).append("\n");
    sb.append("    timeList: ").append(toIndentedString(timeList)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}

