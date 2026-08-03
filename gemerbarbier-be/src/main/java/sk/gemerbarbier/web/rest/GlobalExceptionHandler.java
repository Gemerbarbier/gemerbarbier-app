package sk.gemerbarbier.web.rest;

import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final String GENERIC_VALIDATION_MESSAGE =
      "Zadané údaje nie sú platné. Skontrolujte prosím formulár.";

  /**
   * Customer facing wording for every validated request field. Keep in sync with the constraints in
   * gemerbarbier-api.yaml — the bean validation defaults are English and name the field only by its
   * technical key.
   */
  private static final Map<String, String> FIELD_MESSAGES = Map.of(
      "customerName", "Zadajte celé meno (2 až 100 znakov).",
      "customerEmail", "Zadajte platnú e-mailovú adresu (najviac 254 znakov).",
      "customerPhone", "Zadajte platné telefónne číslo (6 až 32 znakov).",
      "barberId", "Vyberte holiča.",
      "serviceId", "Vyberte službu.",
      "startTime", "Vyberte dátum a čas rezervácie.",
      "note", "Poznámka môže mať najviac 255 znakov."
  );

  @ExceptionHandler(IllegalStateException.class)
  public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException ex) {
    var message = ex.getMessage() == null ? "Požiadavku nebolo možné spracovať." : ex.getMessage();
    return ResponseEntity.status(409).body(Map.of("message", message));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
    var messages = ex.getBindingResult().getFieldErrors().stream()
        .map(error -> FIELD_MESSAGES.get(error.getField()))
        .filter(Objects::nonNull)
        .collect(Collectors.toCollection(LinkedHashSet::new));

    var message = messages.isEmpty() ? GENERIC_VALIDATION_MESSAGE : String.join(" ", messages);

    return ResponseEntity.badRequest().body(Map.of("message", message));
  }
}
