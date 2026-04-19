package sk.gemerbarbier.storage;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import sk.gemerbarbier.entity.Reservation;
import sk.gemerbarbier.repository.ReservationRepository;
import sk.gemerbarbier.storage.api.ReservationStorageApi;

@RequiredArgsConstructor
@Component
public class ReservationStorage implements ReservationStorageApi {

  private final Logger logger;
  private final ReservationRepository repository;

  @Override
  public void createReservation(Reservation reservation) {
    logger.debug("Creating reservation: {}", reservation);

    try {
      repository.save(reservation);
    } catch (DataIntegrityViolationException e) {
      throw new IllegalStateException("Slot was just booked by someone else");
    }
  }

  @Override
  public List<Reservation> getReservations(Long barberId, LocalDateTime from,
      LocalDateTime to) {
    logger.debug("Getting reservations time slot list for barber with id {} from {} to {}.",
        barberId, from, to);

    return repository.findByBarberIdAndStartTimeBetween(barberId, from, to);
  }

  @Override
  public Reservation getById(Long reservationId) {
    logger.debug("Getting reservations by id {}.", reservationId);

    return repository.findById(reservationId).orElseThrow(
        () -> new EntityNotFoundException("Reservation with id " + reservationId + " not found"));
  }
}
