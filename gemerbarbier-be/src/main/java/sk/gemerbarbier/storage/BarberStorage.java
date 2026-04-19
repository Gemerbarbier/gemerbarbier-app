package sk.gemerbarbier.storage;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.stereotype.Component;
import sk.gemerbarbier.entity.Barber;
import sk.gemerbarbier.repository.BarberRepository;
import sk.gemerbarbier.storage.api.BarberStorageApi;

@RequiredArgsConstructor
@Component
public class BarberStorage implements BarberStorageApi {

  private final Logger logger;
  private final BarberRepository repository;

  @Override
  public List<Barber> getBarberList() {
    logger.debug("Getting barber list.");
    return repository.findAll();
  }

  @Override
  public Barber getBarberById(Long barberId) {
    return repository.findById(barberId).orElseThrow(
        () -> new EntityNotFoundException("Barber with id " + barberId + " not found"));
  }

}
