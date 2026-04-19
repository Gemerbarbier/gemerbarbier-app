package sk.gemerbarbier.service.api;

import sk.gemerbarbier.domain.request.ReservationRequest;

public interface ReservationCreateApi {

  void createReservation(ReservationRequest request);
}
