package sk.gemerbarbier.domain.notification;

/**
 * A rendered e-mail ready to be handed to the transport. The plain-text body is always populated
 * alongside the HTML one — a text alternative measurably helps deliverability.
 */
public record EmailMessage(String to, String subject, String html, String text) {

}
