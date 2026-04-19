package sk.gemerbarbier.storage.api;

import java.util.List;
import sk.gemerbarbier.entity.Barber;

public interface BarberStorageApi {

  List<Barber> getBarberList();

  Barber getBarberById(Long barberId);
}
