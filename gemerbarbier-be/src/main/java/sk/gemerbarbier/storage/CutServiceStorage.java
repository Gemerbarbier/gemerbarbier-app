package sk.gemerbarbier.storage;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.stereotype.Component;
import sk.gemerbarbier.entity.CutService;
import sk.gemerbarbier.repository.CutServiceRepository;
import sk.gemerbarbier.storage.api.CutServiceStorageApi;

@RequiredArgsConstructor
@Component
public class CutServiceStorage implements CutServiceStorageApi {

  private final Logger logger;
  private final CutServiceRepository repository;

  @Override
  public List<CutService> getCutServiceList() {
    logger.debug("Getting cut service list.");

    return repository.findAll();
  }

  @Override
  public CutService getCutServiceById(Long cutServiceId) {
    logger.debug("Getting cut service by id {}.", cutServiceId);

    return repository.findById(cutServiceId).orElseThrow(
        () -> new EntityNotFoundException("Cut service with id " + cutServiceId + " not found"));
  }

}
