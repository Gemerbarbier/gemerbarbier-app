package sk.gemerbarbier.service;

import java.time.LocalDateTime;

/**
 * Guards that a reservation starts on the 20-minute slot grid. Without it a request crafted outside
 * the UI (e.g. 14:50 for a 60-minute service) matches the slots of the following grid positions and
 * creates an off-grid reservation that leaves the overlapped slot ACTIVE.
 */
public final class ReservationTimeValidator {

  public static final int SLOT_DURATION_MINUTES = 20;

  private ReservationTimeValidator() {
  }

  public static void validateOnSlotGrid(LocalDateTime start) {
    if (start.getMinute() % SLOT_DURATION_MINUTES != 0 || start.getSecond() != 0
        || start.getNano() != 0) {
      throw new IllegalStateException(
          "Rezervácia môže začínať len o :00, :20 alebo :40. "
              + "Vyberte prosím termín z ponuky voľných časov.");
    }
  }
}
