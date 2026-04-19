package sk.gemerbarbier.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String customerName;
  private String customerEmail;
  private String customerPhone;
  private String note;

  @ManyToOne
  private Barber barber;

  @ManyToOne
  private CutService cutService;

  private LocalDateTime startTime;
  private LocalDateTime endTime;

  @Enumerated(EnumType.STRING)
  private ReservationStatus status;

}
