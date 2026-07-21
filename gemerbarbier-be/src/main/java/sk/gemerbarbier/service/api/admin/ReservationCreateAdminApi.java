package sk.gemerbarbier.service.api.admin;

import sk.gemerbarbier.domain.request.ReservationRequest;

public interface ReservationCreateAdminApi {

  void createReservation(ReservationRequest request);
}
