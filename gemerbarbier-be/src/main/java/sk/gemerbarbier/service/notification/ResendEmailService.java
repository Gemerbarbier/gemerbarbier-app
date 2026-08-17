package sk.gemerbarbier.service.notification;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import sk.gemerbarbier.config.NotificationProperties;
import sk.gemerbarbier.domain.notification.EmailMessage;
import sk.gemerbarbier.service.api.EmailSendApi;

/**
 * Sends through Resend's HTTP API. Active only when {@code gemerbarbier.notifications.email.enabled}
 * is true; otherwise {@link LoggingEmailService} takes over.
 */
@Service
@ConditionalOnProperty(prefix = "gemerbarbier.notifications.email", name = "enabled",
    havingValue = "true")
public class ResendEmailService implements EmailSendApi {

  private final Logger logger;
  private final RestClient restClient;
  private final NotificationProperties properties;

  public ResendEmailService(Logger logger, @Qualifier("resendRestClient") RestClient restClient,
      NotificationProperties properties) {
    this.logger = logger;
    this.restClient = restClient;
    this.properties = properties;
  }

  /** Fail at startup rather than at the first booking of the day. */
  @PostConstruct
  void verifyConfigured() {
    if (!StringUtils.hasText(properties.getEmail().getApiKey())) {
      throw new IllegalStateException(
          "E-mail sending is enabled but RESEND_API_KEY is not configured.");
    }
  }

  @Override
  public void send(EmailMessage message) {
    var response = restClient.post()
        .uri("/emails")
        .body(new ResendRequest(properties.getEmail().getFrom(), List.of(message.to()),
            message.subject(), message.html(), message.text()))
        .retrieve()
        .onStatus(HttpStatusCode::isError, (request, clientResponse) -> {
          var body = StreamUtils.copyToString(clientResponse.getBody(), StandardCharsets.UTF_8);
          throw new IllegalStateException(
              "Resend returned " + clientResponse.getStatusCode() + ": " + body);
        })
        .body(ResendResponse.class);

    logger.info("E-mail sent via Resend to {}, id {}.", message.to(),
        response == null ? "unknown" : response.id());
  }

  private record ResendRequest(String from, List<String> to, String subject, String html,
                               String text) {

  }

  private record ResendResponse(String id) {

  }
}
