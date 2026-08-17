package sk.gemerbarbier.service.notification;

import java.util.Optional;

/**
 * Turns the free-text phone number a customer typed into an MSISDN.
 *
 * <p>Port of the {@code normalizePhoneToMsisdn} helper the Supabase function used, including its
 * assumption that a leading zero means a Slovak number.
 */
final class PhoneNormalizer {

  private static final String SLOVAK_PREFIX = "421";
  private static final int MIN_DIGITS = 8;

  private PhoneNormalizer() {
  }

  static Optional<Long> toMsisdn(String raw) {
    if (raw == null || raw.isBlank()) {
      return Optional.empty();
    }

    var digits = raw.replaceAll("[^\\d+]", "");

    if (digits.startsWith("+")) {
      digits = digits.substring(1);
    } else if (digits.startsWith("00")) {
      digits = digits.substring(2);
    } else if (digits.startsWith("0")) {
      digits = SLOVAK_PREFIX + digits.substring(1);
    }

    if (digits.length() < MIN_DIGITS) {
      return Optional.empty();
    }

    try {
      return Optional.of(Long.parseLong(digits));
    } catch (NumberFormatException e) {
      return Optional.empty();
    }
  }
}
