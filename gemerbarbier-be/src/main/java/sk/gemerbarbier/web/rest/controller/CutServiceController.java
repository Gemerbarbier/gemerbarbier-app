package sk.gemerbarbier.web.rest.controller;

import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import sk.gemerbarbier.api.CutServiceApi;
import sk.gemerbarbier.mapper.CutServiceMapper;
import sk.gemerbarbier.model.CutServiceResponseDto;
import sk.gemerbarbier.storage.api.CutServiceStorageApi;
import sk.gemerbarbier.web.rest.annotation.GemerbarbierApiController;

@GemerbarbierApiController
@AllArgsConstructor
public class CutServiceController implements CutServiceApi {

  private final CutServiceStorageApi cutServiceStorageApi;

  @Override
  public ResponseEntity<List<CutServiceResponseDto>> getCutServices() {
    var response = cutServiceStorageApi.getCutServiceList().stream()
        .map(CutServiceMapper.INSTANCE::toCutServiceResponseDto).toList();

    return ResponseEntity.ok(response);
  }
}
