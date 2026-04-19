package sk.gemerbarbier.model;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import org.openapitools.jackson.nullable.JsonNullable;
import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.*;
import jakarta.annotation.Generated;

/**
 * ReservationResponseDto
 */

@JsonTypeName("ReservationResponse")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-04-07T12:42:19.199718400+02:00[Europe/Bratislava]", comments = "Generator version: 7.5.0")
public class ReservationResponseDto {

  private Long id;

  private String customerName;

  private Long barberId;

  private Long serviceId;

  private String startTime;

  private String endTime;

  private String status;

  public ReservationResponseDto id(Long id) {
    this.id = id;
    return this;
  }

  /**
   * Get id
   * @return id
  */
  
  @Schema(name = "id", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("id")
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public ReservationResponseDto customerName(String customerName) {
    this.customerName = customerName;
    return this;
  }

  /**
   * Get customerName
   * @return customerName
  */
  
  @Schema(name = "customerName", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("customerName")
  public String getCustomerName() {
    return customerName;
  }

  public void setCustomerName(String customerName) {
    this.customerName = customerName;
  }

  public ReservationResponseDto barberId(Long barberId) {
    this.barberId = barberId;
    return this;
  }

  /**
   * Get barberId
   * @return barberId
  */
  
  @Schema(name = "barberId", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("barberId")
  public Long getBarberId() {
    return barberId;
  }

  public void setBarberId(Long barberId) {
    this.barberId = barberId;
  }

  public ReservationResponseDto serviceId(Long serviceId) {
    this.serviceId = serviceId;
    return this;
  }

  /**
   * Get serviceId
   * @return serviceId
  */
  
  @Schema(name = "serviceId", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("serviceId")
  public Long getServiceId() {
    return serviceId;
  }

  public void setServiceId(Long serviceId) {
    this.serviceId = serviceId;
  }

  public ReservationResponseDto startTime(String startTime) {
    this.startTime = startTime;
    return this;
  }

  /**
   * Get startTime
   * @return startTime
  */
  
  @Schema(name = "startTime", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("startTime")
  public String getStartTime() {
    return startTime;
  }

  public void setStartTime(String startTime) {
    this.startTime = startTime;
  }

  public ReservationResponseDto endTime(String endTime) {
    this.endTime = endTime;
    return this;
  }

  /**
   * Get endTime
   * @return endTime
  */
  
  @Schema(name = "endTime", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("endTime")
  public String getEndTime() {
    return endTime;
  }

  public void setEndTime(String endTime) {
    this.endTime = endTime;
  }

  public ReservationResponseDto status(String status) {
    this.status = status;
    return this;
  }

  /**
   * Get status
   * @return status
  */
  
  @Schema(name = "status", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("status")
  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    ReservationResponseDto reservationResponse = (ReservationResponseDto) o;
    return Objects.equals(this.id, reservationResponse.id) &&
        Objects.equals(this.customerName, reservationResponse.customerName) &&
        Objects.equals(this.barberId, reservationResponse.barberId) &&
        Objects.equals(this.serviceId, reservationResponse.serviceId) &&
        Objects.equals(this.startTime, reservationResponse.startTime) &&
        Objects.equals(this.endTime, reservationResponse.endTime) &&
        Objects.equals(this.status, reservationResponse.status);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, customerName, barberId, serviceId, startTime, endTime, status);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class ReservationResponseDto {\n");
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    customerName: ").append(toIndentedString(customerName)).append("\n");
    sb.append("    barberId: ").append(toIndentedString(barberId)).append("\n");
    sb.append("    serviceId: ").append(toIndentedString(serviceId)).append("\n");
    sb.append("    startTime: ").append(toIndentedString(startTime)).append("\n");
    sb.append("    endTime: ").append(toIndentedString(endTime)).append("\n");
    sb.append("    status: ").append(toIndentedString(status)).append("\n");
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

