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
 * ReservationCreateRequestDto
 */

@JsonTypeName("ReservationCreateRequest")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-04-07T12:42:19.199718400+02:00[Europe/Bratislava]", comments = "Generator version: 7.5.0")
public class ReservationCreateRequestDto {

  private String customerName;

  private String customerEmail;

  private String customerPhone;

  private Long barberId;

  private Long serviceId;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private java.time.LocalDateTime startTime;

  public ReservationCreateRequestDto() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public ReservationCreateRequestDto(String customerName, String customerEmail, String customerPhone, Long barberId, Long serviceId, java.time.LocalDateTime startTime) {
    this.customerName = customerName;
    this.customerEmail = customerEmail;
    this.customerPhone = customerPhone;
    this.barberId = barberId;
    this.serviceId = serviceId;
    this.startTime = startTime;
  }

  public ReservationCreateRequestDto customerName(String customerName) {
    this.customerName = customerName;
    return this;
  }

  /**
   * Get customerName
   * @return customerName
  */
  @NotNull 
  @Schema(name = "customerName", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("customerName")
  public String getCustomerName() {
    return customerName;
  }

  public void setCustomerName(String customerName) {
    this.customerName = customerName;
  }

  public ReservationCreateRequestDto customerEmail(String customerEmail) {
    this.customerEmail = customerEmail;
    return this;
  }

  /**
   * Get customerEmail
   * @return customerEmail
  */
  @NotNull 
  @Schema(name = "customerEmail", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("customerEmail")
  public String getCustomerEmail() {
    return customerEmail;
  }

  public void setCustomerEmail(String customerEmail) {
    this.customerEmail = customerEmail;
  }

  public ReservationCreateRequestDto customerPhone(String customerPhone) {
    this.customerPhone = customerPhone;
    return this;
  }

  /**
   * Get customerPhone
   * @return customerPhone
  */
  @NotNull 
  @Schema(name = "customerPhone", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("customerPhone")
  public String getCustomerPhone() {
    return customerPhone;
  }

  public void setCustomerPhone(String customerPhone) {
    this.customerPhone = customerPhone;
  }

  public ReservationCreateRequestDto barberId(Long barberId) {
    this.barberId = barberId;
    return this;
  }

  /**
   * Get barberId
   * @return barberId
  */
  @NotNull 
  @Schema(name = "barberId", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("barberId")
  public Long getBarberId() {
    return barberId;
  }

  public void setBarberId(Long barberId) {
    this.barberId = barberId;
  }

  public ReservationCreateRequestDto serviceId(Long serviceId) {
    this.serviceId = serviceId;
    return this;
  }

  /**
   * Get serviceId
   * @return serviceId
  */
  @NotNull 
  @Schema(name = "serviceId", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("serviceId")
  public Long getServiceId() {
    return serviceId;
  }

  public void setServiceId(Long serviceId) {
    this.serviceId = serviceId;
  }

  public ReservationCreateRequestDto startTime(java.time.LocalDateTime startTime) {
    this.startTime = startTime;
    return this;
  }

  /**
   * Get startTime
   * @return startTime
  */
  @NotNull @Valid 
  @Schema(name = "startTime", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("startTime")
  public java.time.LocalDateTime getStartTime() {
    return startTime;
  }

  public void setStartTime(java.time.LocalDateTime startTime) {
    this.startTime = startTime;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    ReservationCreateRequestDto reservationCreateRequest = (ReservationCreateRequestDto) o;
    return Objects.equals(this.customerName, reservationCreateRequest.customerName) &&
        Objects.equals(this.customerEmail, reservationCreateRequest.customerEmail) &&
        Objects.equals(this.customerPhone, reservationCreateRequest.customerPhone) &&
        Objects.equals(this.barberId, reservationCreateRequest.barberId) &&
        Objects.equals(this.serviceId, reservationCreateRequest.serviceId) &&
        Objects.equals(this.startTime, reservationCreateRequest.startTime);
  }

  @Override
  public int hashCode() {
    return Objects.hash(customerName, customerEmail, customerPhone, barberId, serviceId, startTime);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class ReservationCreateRequestDto {\n");
    sb.append("    customerName: ").append(toIndentedString(customerName)).append("\n");
    sb.append("    customerEmail: ").append(toIndentedString(customerEmail)).append("\n");
    sb.append("    customerPhone: ").append(toIndentedString(customerPhone)).append("\n");
    sb.append("    barberId: ").append(toIndentedString(barberId)).append("\n");
    sb.append("    serviceId: ").append(toIndentedString(serviceId)).append("\n");
    sb.append("    startTime: ").append(toIndentedString(startTime)).append("\n");
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

