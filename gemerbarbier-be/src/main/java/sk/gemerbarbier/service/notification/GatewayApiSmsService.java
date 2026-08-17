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
import sk.gemerbarbier.domain.notification.SmsMessage;
import sk.gemerbarbier.service.api.SmsSendApi;

/**
 * Sends through GatewayAPI's REST endpoint directly, replacing the Lovable connector that used to
 * proxy these calls.
 */
@Service
@ConditionalOnProperty(prefix = "gemerbarbier.notifications.sms", name = "enabled",
    havingValue = "true")
public class GatewayApiSmsService implements SmsSendApi {

  private final Logger logger;
  private final RestClient restClient;
  private final NotificationProperties properties;

  public GatewayApiSmsService(Logger logger,
      @Qualifier("gatewayApiRestClient") RestClient restClient,
      NotificationProperties properties) {
    this.logger = logger;
    this.restClient = restClient;
    this.properties = properties;
  }

  @PostConstruct
  void verifyConfigured() {
    if (!StringUtils.hasText(properties.getSms().getApiKey())) {
      throw new IllegalStateException(
          "SMS sending is enabled but GATEWAYAPI_API_KEY is not configured.");
    }
  }

  @Override
  public void send(SmsMessage message) {
    var response = restClient.post()
        .uri("/rest/mtsms")
        .body(new GatewayApiRequest(properties.getSms().getSender(), message.text(),
            List.of(new Recipient(message.msisdn()))))
        .retrieve()
        .onStatus(HttpStatusCode::isError, (request, clientResponse) -> {
          var body = StreamUtils.copyToString(clientResponse.getBody(), StandardCharsets.UTF_8);
          throw new IllegalStateException(
              "GatewayAPI returned " + clientResponse.getStatusCode() + ": " + body);
        })
        .body(GatewayApiResponse.class);

    logger.info("SMS sent via GatewayAPI to {}, ids {}.", message.msisdn(),
        response == null ? List.of() : response.ids());
  }

  private record GatewayApiRequest(String sender, String message, List<Recipient> recipients) {

  }

  private record Recipient(long msisdn) {

  }

  private record GatewayApiResponse(List<Long> ids) {

  }
}
