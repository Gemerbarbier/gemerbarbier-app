package sk.gemerbarbier.storage;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import sk.gemerbarbier.domain.ServiceStatistic;
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
      throw new IllegalStateException("Tento termín je už obsadený. Vyberte prosím iný čas.");
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
  public List<Reservation> getReservationsFrom(Long barberId, LocalDateTime from) {
    logger.debug("Getting reservations for barber with id {} ending after {}.", barberId, from);

    return repository.findByBarberIdAndEndTimeAfter(barberId, from);
  }

  @Override
  public Reservation getById(Long reservationId) {
    logger.debug("Getting reservations by id {}.", reservationId);

    return repository.findById(reservationId).orElseThrow(
        () -> new EntityNotFoundException("Reservation with id " + reservationId + " not found"));
  }

  @Override
  public List<ServiceStatistic> getStatistics(LocalDateTime from, LocalDateTime to, Long barberId) {
    logger.debug("Getting service statistics from {} to {} for barberId {}.", from, to, barberId);

    return repository.getStatistics(from, to, barberId);
  }

  @Override
  public List<Reservation> getEmailRemindable(LocalDateTime from, LocalDateTime to, int limit) {
    logger.debug("Getting reservations due an e-mail reminder between {} and {}.", from, to);

    return repository.findEmailRemindable(from, to, PageRequest.of(0, limit));
  }

  @Override
  public List<Reservation> getSmsRemindable(LocalDateTime from, LocalDateTime to, int limit) {
    logger.debug("Getting reservations due an SMS reminder between {} and {}.", from, to);

    return repository.findSmsRemindable(from, to, PageRequest.of(0, limit));
  }

  /**
   * Each claim commits on its own so that a crash mid-sweep cannot undo the claims already made,
   * and so no transaction stays open across the outbound HTTP calls that follow.
   */
  @Override
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public boolean claimEmailReminder(Long reservationId, LocalDateTime sentAt) {
    logger.debug("Claiming e-mail reminder for reservation {}.", reservationId);

    return repository.claimEmailReminder(reservationId, sentAt) == 1;
  }

  @Override
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public boolean claimSmsReminder(Long reservationId, LocalDateTime sentAt) {
    logger.debug("Claiming SMS reminder for reservation {}.", reservationId);

    return repository.claimSmsReminder(reservationId, sentAt) == 1;
  }

  @Override
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void releaseEmailReminder(Long reservationId) {
    logger.debug("Releasing e-mail reminder claim for reservation {}.", reservationId);

    repository.releaseEmailReminder(reservationId);
  }

  @Override
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void releaseSmsReminder(Long reservationId) {
    logger.debug("Releasing SMS reminder claim for reservation {}.", reservationId);

    repository.releaseSmsReminder(reservationId);
  }
}
