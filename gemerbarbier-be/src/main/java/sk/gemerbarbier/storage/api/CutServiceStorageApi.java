package sk.gemerbarbier.storage.api;

import java.util.List;
import sk.gemerbarbier.entity.CutService;

public interface CutServiceStorageApi {

  List<CutService> getCutServiceList();

  CutService getCutServiceById(Long cutServiceId);
}
