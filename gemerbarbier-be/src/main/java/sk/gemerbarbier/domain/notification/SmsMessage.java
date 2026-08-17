package sk.gemerbarbier.domain.notification;

/**
 * A rendered SMS ready to be handed to the transport. The recipient is already normalised to an
 * MSISDN, so the transport never has to reason about Slovak dialling prefixes.
 */
public record SmsMessage(long msisdn, String text) {

}
