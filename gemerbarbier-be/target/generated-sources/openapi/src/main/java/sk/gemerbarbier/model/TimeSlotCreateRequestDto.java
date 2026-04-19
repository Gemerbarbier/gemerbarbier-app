package sk.gemerbarbier.model;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import java.time.OffsetDateTime;
import org.springframework.format.annotation.DateTimeFormat;
import org.openapitools.jackson.nullable.JsonNullable;
import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.*;
import jakarta.annotation.Generated;

/**
 * TimeSlotCreateRequestDto
 */

@JsonTypeName("TimeSlotCreateRequest")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-04-07T12:42:19.199718400+02:00[Europe/Bratislava]", comments = "Generator version: 7.5.0")
public class TimeSlotCreateRequestDto {

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private java.time.LocalDateTime startTime;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private java.time.LocalDateTime endTime;

  public TimeSlotCreateRequestDto startTime(java.time.LocalDateTime startTime) {
    this.startTime = startTime;
    return this;
  }

  /**
   * Get startTime
   * @return startTime
  */
  @Valid 
  @Schema(name = "startTime", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("startTime")
  public java.time.LocalDateTime getStartTime() {
    return startTime;
  }

  public void setStartTime(java.time.LocalDateTime startTime) {
    this.startTime = startTime;
  }

  public TimeSlotCreateRequestDto endTime(java.time.LocalDateTime endTime) {
    this.endTime = endTime;
    return this;
  }

  /**
   * Get endTime
   * @return endTime
  */
  @Valid 
  @Schema(name = "endTime", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("endTime")
  public java.time.LocalDateTime getEndTime() {
    return endTime;
  }

  public void setEndTime(java.time.LocalDateTime endTime) {
    this.endTime = endTime;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    TimeSlotCreateRequestDto timeSlotCreateRequest = (TimeSlotCreateRequestDto) o;
    return Objects.equals(this.startTime, timeSlotCreateRequest.startTime) &&
        Objects.equals(this.endTime, timeSlotCreateRequest.endTime);
  }

  @Override
  public int hashCode() {
    return Objects.hash(startTime, endTime);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class TimeSlotCreateRequestDto {\n");
    sb.append("    startTime: ").append(toIndentedString(startTime)).append("\n");
    sb.append("    endTime: ").append(toIndentedString(endTime)).append("\n");
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

