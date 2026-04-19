package sk.gemerbarbier.web.rest.controller;

import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import sk.gemerbarbier.api.BarberApi;
import sk.gemerbarbier.mapper.BarberMapper;
import sk.gemerbarbier.model.BarberResponseDto;
import sk.gemerbarbier.storage.api.BarberStorageApi;
import sk.gemerbarbier.web.rest.annotation.GemerbarbierApiController;

@GemerbarbierApiController
@AllArgsConstructor
public class BarberController implements BarberApi {

  private final BarberStorageApi barberStorageApi;

  public static void main(String[] args) {
    var encoder = new BCryptPasswordEncoder();
    System.out.println(encoder.encode("*Vilo123*"));
    //System.out.println(encoder.encode("*Kubo123*"));
  }

  @Override
  public ResponseEntity<List<BarberResponseDto>> getBarbers() {
    var response = barberStorageApi.getBarberList()
        .stream()
        .map(BarberMapper.INSTANCE::toBarberResponseDto).toList();

    return ResponseEntity.ok(response);
  }
}
