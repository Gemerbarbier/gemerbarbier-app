package sk.gemerbarbier.service.notification;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Contact details shown in the footer of every customer e-mail.
 *
 * <p>Barbers are matched on a substring of the name stored in the database — {@code V2__seed_barbers}
 * seeds "Vilo" and "Jakub", which the tokens below cover. When nothing matches, the caller falls
 * back to listing every barber rather than dropping the contact block.
 */
public enum BarberContact {

  VILIAM("Viliam Knotek", "+421 940 194 630", "Viliam Kroxy Knotek",
      List.of("viliam", "vilo", "knotek")),
  JAKUB("Jakub Herich", "+421 918 165 273", "Jakub Bača Herich",
      List.of("jakub", "kubo", "herich", "bača", "baca"));

  private final String displayName;
  private final String phone;
  private final String messenger;
  private final List<String> tokens;

  BarberContact(String displayName, String phone, String messenger, List<String> tokens) {
    this.displayName = displayName;
    this.phone = phone;
    this.messenger = messenger;
    this.tokens = tokens;
  }

  public String getDisplayName() {
    return displayName;
  }

  public String getPhone() {
    return phone;
  }

  public String getMessenger() {
    return messenger;
  }

  /** Phone number stripped of spaces, suitable for a {@code tel:} href. */
  public String getPhoneHref() {
    return phone.replaceAll("\\s+", "");
  }

  public static Optional<BarberContact> find(String barberName) {
    if (barberName == null || barberName.isBlank()) {
      return Optional.empty();
    }

    var needle = barberName.toLowerCase(Locale.ROOT);

    return Arrays.stream(values())
        .filter(contact -> contact.tokens.stream().anyMatch(needle::contains))
        .findFirst();
  }
}
