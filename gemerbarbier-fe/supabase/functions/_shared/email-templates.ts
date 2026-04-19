/**
 * Email Templates
 * Each template returns { subject, html } from a typed payload.
 * Add new templates here and register them in the TEMPLATES map.
 */

const BRAND = {
  name: "Gemer Barbier",
  tagline: "Premium Barbershop",
  gold: "#d4af37",
  bg: "#0a0a0a",
  cardBg: "linear-gradient(145deg, #1a1a1a, #0d0d0d)",
};

function layout(innerHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: ${BRAND.bg};">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: ${BRAND.gold}; font-size: 28px; margin: 0; letter-spacing: 2px;">${BRAND.name.toUpperCase()}</h1>
          <p style="color: #888; font-size: 14px; margin-top: 8px;">${BRAND.tagline}</p>
        </div>
        <div style="background: ${BRAND.cardBg}; border: 1px solid #2a2a2a; border-radius: 16px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          ${innerHtml}
        </div>
        <div style="text-align: center; margin-top: 32px;">
          <p style="color: #444; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${BRAND.name}. Všetky práva vyhradené.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function row(label: string, value: string, isLast = false): string {
  const border = isLast ? "" : "border-bottom: 1px solid #2a2a2a;";
  return `
    <tr>
      <td style="padding: 12px 0; ${border}">
        <span style="color: #666; font-size: 14px;">${label}</span>
      </td>
      <td style="padding: 12px 0; ${border} text-align: right;">
        <span style="color: #ffffff; font-size: 14px; font-weight: 600;">${value}</span>
      </td>
    </tr>
  `;
}

function divider(): string {
  return `<div style="height: 1px; background: linear-gradient(90deg, transparent, ${BRAND.gold}, transparent); margin: 24px 0;"></div>`;
}

// ============= Template payloads =============

export interface ReservationPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string; // ISO
  time: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  barberName: string;
}

// ============= Templates =============

function reservationConfirmation(p: ReservationPayload) {
  const formattedDate = new Date(p.date).toLocaleDateString("sk-SK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const inner = `
    <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">Dobrý deň, ${p.customerName}!</h2>
    <p style="color: #888; font-size: 16px; margin: 0 0 32px 0;">Vaša rezervácia bola úspešne prijatá.</p>
    ${divider()}
    <h3 style="color: ${BRAND.gold}; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px 0;">Detaily rezervácie</h3>
    <table style="width: 100%; border-collapse: collapse;">
      ${row("Dátum", formattedDate)}
      ${row("Čas", p.time)}
      ${row("Služba", p.serviceName)}
      ${row("Trvanie", `${p.serviceDuration} minút`)}
      ${row("Holič", p.barberName)}
      <tr>
        <td style="padding: 16px 0;"><span style="color: #666; font-size: 14px;">Cena</span></td>
        <td style="padding: 16px 0; text-align: right;"><span style="color: ${BRAND.gold}; font-size: 20px; font-weight: 700;">${p.servicePrice}€</span></td>
      </tr>
    </table>
    ${divider()}
    <div style="background: rgba(212, 175, 55, 0.1); border-radius: 8px; padding: 16px; margin-top: 16px;">
      <p style="color: ${BRAND.gold}; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">📞 Kontakt na barberov</p>
      <p style="color: #cccccc; font-size: 13px; margin: 0 0 12px 0; line-height: 1.6;">
        V prípade zmeny alebo zrušenia rezervácie kontaktujte svojho barbera na tel. číslo, alebo prostredníctvom messengeru.
      </p>
      <p style="color: #ffffff; font-size: 13px; margin: 0 0 8px 0; line-height: 1.6;">
        <strong style="color: ${BRAND.gold};">Vilo</strong><br>
        tel. číslo: +421 940 194 630<br>
        messenger: Viliam Kroxy Knotek
      </p>
      <p style="color: #ffffff; font-size: 13px; margin: 12px 0 0 0; line-height: 1.6;">
        <strong style="color: ${BRAND.gold};">Kubo</strong><br>
        tel. číslo: +421 918 165 273<br>
        messenger: Jakub Bača Herich
      </p>
    </div>
    <p style="color: #666; font-size: 12px; margin: 24px 0 0 0; text-align: center;">
      Tešíme sa na vás!
    </p>
  `;

  return {
    subject: "Potvrdenie rezervácie - Gemer Barbier",
    html: layout(inner),
  };
}

function reservationReminder(p: ReservationPayload) {
  const formattedDate = new Date(p.date).toLocaleDateString("sk-SK", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const inner = `
    <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">Pripomienka rezervácie</h2>
    <p style="color: #888; font-size: 16px; margin: 0 0 32px 0;">Tešíme sa na vás zajtra, ${p.customerName}!</p>
    ${divider()}
    <table style="width: 100%; border-collapse: collapse;">
      ${row("Dátum", formattedDate)}
      ${row("Čas", p.time)}
      ${row("Služba", p.serviceName)}
      ${row("Holič", p.barberName, true)}
    </table>
    ${divider()}
    <div style="background: rgba(212, 175, 55, 0.1); border-radius: 8px; padding: 16px; margin-top: 16px;">
      <p style="color: ${BRAND.gold}; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">📞 Kontakt na barberov</p>
      <p style="color: #cccccc; font-size: 13px; margin: 0 0 12px 0; line-height: 1.6;">
        V prípade zmeny alebo zrušenia rezervácie kontaktujte svojho barbera na tel. číslo, alebo prostredníctvom messengeru.
      </p>
      <p style="color: #ffffff; font-size: 13px; margin: 0 0 8px 0; line-height: 1.6;">
        <strong style="color: ${BRAND.gold};">Vilo</strong><br>
        tel. číslo: +421 940 194 630<br>
        messenger: Viliam Kroxy Knotek
      </p>
      <p style="color: #ffffff; font-size: 13px; margin: 12px 0 0 0; line-height: 1.6;">
        <strong style="color: ${BRAND.gold};">Kubo</strong><br>
        tel. číslo: +421 918 165 273<br>
        messenger: Jakub Bača Herich
      </p>
    </div>
  `;

  return {
    subject: "Pripomienka: Vaša rezervácia je zajtra - Gemer Barbier",
    html: layout(inner),
  };
}

// ============= Registry =============

export type TemplateName = "reservation_confirmation" | "reservation_reminder";

export const TEMPLATES: Record<
    TemplateName,
    (payload: ReservationPayload) => { subject: string; html: string }
> = {
  reservation_confirmation: reservationConfirmation,
  reservation_reminder: reservationReminder,
};

export function renderTemplate(
    name: TemplateName,
    payload: ReservationPayload,
): { subject: string; html: string } {
  const fn = TEMPLATES[name];
  if (!fn) throw new Error(`Unknown template: ${name}`);
  return fn(payload);
}
