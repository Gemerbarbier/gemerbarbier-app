package sk.gemerbarbier.web.rest.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Cheap liveness endpoint for an external pinger.
 *
 * <p>Render's free tier sleeps an idle instance, and a sleeping JVM runs no scheduled work — a ping
 * every few minutes keeps the reminder sweep and the weekly slot generation alive. Pinging "/" would
 * hit {@link SpaController} and serve the whole SPA shell instead, so this exists separately.
 */
@RestController
@RequestMapping("/gemerbarbier")
public class HealthController {

  @GetMapping("/health")
  public ResponseEntity<Void> health() {
    return ResponseEntity.noContent().build();
  }
}
