package sk.gemerbarbier.domain.request;

import java.time.LocalDateTime;

public record ReservationRequest(
    String customerName,
    String customerEmail,
    String customerPhone,
    Long barberId,
    Long serviceId,
    LocalDateTime startTime,
    String note
) {

}
