package sk.gemerbarbier.model;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.annotation.JsonValue;
import org.openapitools.jackson.nullable.JsonNullable;
import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.*;
import jakarta.annotation.Generated;

/**
 * ReservationAdminResponseDto
 */

@JsonTypeName("ReservationAdminResponse")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-04-07T12:42:19.199718400+02:00[Europe/Bratislava]", comments = "Generator version: 7.5.0")
public class ReservationAdminResponseDto {

  private Integer id;

  private String startTime;

  private String endTime;

  private String customerName;

  private String customerEmail;

  private String customerPhone;

  private String cutServiceName;

  private String note;

  /**
   * Gets or Sets status
   */
  public enum StatusEnum {
    CREATED("CREATED"),
    
    CANCELLED("CANCELLED");

    private String value;

    StatusEnum(String value) {
      this.value = value;
    }

    @JsonValue
    public String getValue() {
      return value;
    }

    @Override
    public String toString() {
      return String.valueOf(value);
    }

    @JsonCreator
    public static StatusEnum fromValue(String value) {
      for (StatusEnum b : StatusEnum.values()) {
        if (b.value.equals(value)) {
          return b;
        }
      }
      throw new IllegalArgumentException("Unexpected value '" + value + "'");
    }
  }

  private StatusEnum status;

  public ReservationAdminResponseDto id(Integer id) {
    this.id = id;
    return this;
  }

  /**
   * Get id
   * @return id
  */
  
  @Schema(name = "id", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("id")
  public Integer getId() {
    return id;
  }

  public void setId(Integer id) {
    this.id = id;
  }

  public ReservationAdminResponseDto startTime(String startTime) {
    this.startTime = startTime;
    return this;
  }

  /**
   * Get startTime
   * @return startTime
  */
  
  @Schema(name = "startTime", example = "09:00", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("startTime")
  public String getStartTime() {
    return startTime;
  }

  public void setStartTime(String startTime) {
    this.startTime = startTime;
  }

  public ReservationAdminResponseDto endTime(String endTime) {
    this.endTime = endTime;
    return this;
  }

  /**
   * Get endTime
   * @return endTime
  */
  
  @Schema(name = "endTime", example = "09:40", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("endTime")
  public String getEndTime() {
    return endTime;
  }

  public void setEndTime(String endTime) {
    this.endTime = endTime;
  }

  public ReservationAdminResponseDto customerName(String customerName) {
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

  public ReservationAdminResponseDto customerEmail(String customerEmail) {
    this.customerEmail = customerEmail;
    return this;
  }

  /**
   * Get customerEmail
   * @return customerEmail
  */
  
  @Schema(name = "customerEmail", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("customerEmail")
  public String getCustomerEmail() {
    return customerEmail;
  }

  public void setCustomerEmail(String customerEmail) {
    this.customerEmail = customerEmail;
  }

  public ReservationAdminResponseDto customerPhone(String customerPhone) {
    this.customerPhone = customerPhone;
    return this;
  }

  /**
   * Get customerPhone
   * @return customerPhone
  */
  
  @Schema(name = "customerPhone", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("customerPhone")
  public String getCustomerPhone() {
    return customerPhone;
  }

  public void setCustomerPhone(String customerPhone) {
    this.customerPhone = customerPhone;
  }

  public ReservationAdminResponseDto cutServiceName(String cutServiceName) {
    this.cutServiceName = cutServiceName;
    return this;
  }

  /**
   * Get cutServiceName
   * @return cutServiceName
  */
  
  @Schema(name = "cutServiceName", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("cutServiceName")
  public String getCutServiceName() {
    return cutServiceName;
  }

  public void setCutServiceName(String cutServiceName) {
    this.cutServiceName = cutServiceName;
  }

  public ReservationAdminResponseDto note(String note) {
    this.note = note;
    return this;
  }

  /**
   * Get note
   * @return note
  */
  
  @Schema(name = "note", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("note")
  public String getNote() {
    return note;
  }

  public void setNote(String note) {
    this.note = note;
  }

  public ReservationAdminResponseDto status(StatusEnum status) {
    this.status = status;
    return this;
  }

  /**
   * Get status
   * @return status
  */
  
  @Schema(name = "status", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("status")
  public StatusEnum getStatus() {
    return status;
  }

  public void setStatus(StatusEnum status) {
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
    ReservationAdminResponseDto reservationAdminResponse = (ReservationAdminResponseDto) o;
    return Objects.equals(this.id, reservationAdminResponse.id) &&
        Objects.equals(this.startTime, reservationAdminResponse.startTime) &&
        Objects.equals(this.endTime, reservationAdminResponse.endTime) &&
        Objects.equals(this.customerName, reservationAdminResponse.customerName) &&
        Objects.equals(this.customerEmail, reservationAdminResponse.customerEmail) &&
        Objects.equals(this.customerPhone, reservationAdminResponse.customerPhone) &&
        Objects.equals(this.cutServiceName, reservationAdminResponse.cutServiceName) &&
        Objects.equals(this.note, reservationAdminResponse.note) &&
        Objects.equals(this.status, reservationAdminResponse.status);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, startTime, endTime, customerName, customerEmail, customerPhone, cutServiceName, note, status);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class ReservationAdminResponseDto {\n");
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    startTime: ").append(toIndentedString(startTime)).append("\n");
    sb.append("    endTime: ").append(toIndentedString(endTime)).append("\n");
    sb.append("    customerName: ").append(toIndentedString(customerName)).append("\n");
    sb.append("    customerEmail: ").append(toIndentedString(customerEmail)).append("\n");
    sb.append("    customerPhone: ").append(toIndentedString(customerPhone)).append("\n");
    sb.append("    cutServiceName: ").append(toIndentedString(cutServiceName)).append("\n");
    sb.append("    note: ").append(toIndentedString(note)).append("\n");
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

