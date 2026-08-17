package sk.gemerbarbier.config;

import java.time.Duration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * HTTP clients for the outbound integrations. Timeouts are always set explicitly — an unbounded
 * POST issued from the reminder sweep's scheduler thread would wedge the whole sweep.
 */
@Configuration
@EnableConfigurationProperties({NotificationProperties.class, GoogleProperties.class})
public class NotificationConfiguration {

  @Bean
  public RestClient resendRestClient(NotificationProperties properties) {
    return RestClient.builder()
        .requestFactory(requestFactory(properties.getConnectTimeout(),
            properties.getReadTimeout()))
        .baseUrl(properties.getEmail().getBaseUrl())
        .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getEmail().getApiKey())
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .build();
  }

  /**
   * GatewayAPI authenticates with HTTP basic where the API token is the username and the password
   * is empty. Talking to it directly removes the Lovable connector that used to sit in the middle.
   */
  @Bean
  public RestClient gatewayApiRestClient(NotificationProperties properties) {
    return RestClient.builder()
        .requestFactory(requestFactory(properties.getConnectTimeout(),
            properties.getReadTimeout()))
        .baseUrl(properties.getSms().getBaseUrl())
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .requestInterceptor((request, body, execution) -> {
          request.getHeaders().setBasicAuth(properties.getSms().getApiKey(), "");
          return execution.execute(request, body);
        })
        .build();
  }

  @Bean
  public RestClient googlePlacesRestClient(GoogleProperties googleProperties,
      NotificationProperties notificationProperties) {
    return RestClient.builder()
        .requestFactory(requestFactory(notificationProperties.getConnectTimeout(),
            notificationProperties.getReadTimeout()))
        .baseUrl(googleProperties.getPlacesBaseUrl())
        .build();
  }

  private ClientHttpRequestFactory requestFactory(Duration connectTimeout, Duration readTimeout) {
    var settings = ClientHttpRequestFactorySettings.defaults()
        .withConnectTimeout(connectTimeout)
        .withReadTimeout(readTimeout);

    return ClientHttpRequestFactoryBuilder.detect().build(settings);
  }
}
