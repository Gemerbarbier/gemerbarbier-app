/**
 * Email Templates
 * Each template returns { subject, html, text } from a typed payload.
 * Add new templates here and register them in the TEMPLATES map.
 *
 * Colour strategy: the HTML ships a LIGHT base and switches to the dark brand
 * palette via prefers-color-scheme. A dark-by-default email breaks in Gmail's
 * dark mode, which inverts light text into dark text while keeping the dark
 * background — the result is unreadable. Clients that honour prefers-color-scheme
 * (Apple Mail, Outlook.com) get the brand dark look; Gmail's own inversion turns
 * the light base into something readable instead of fighting it.
 */

const BRAND = {
  name: "Gemer Barbier",
  tagline: "Premium Barbershop",
};

/** Light base. Gold is darkened — #d4af37 on white is only ~1.9:1 and unreadable. */
const LIGHT = {
  pageBg: "#f4f4f5",
  cardBg: "#ffffff",
  border: "#e4e4e7",
  textPrimary: "#18181b",
  textSecondary: "#52525b",
  gold: "#8a6d1f",
  accentBg: "#faf6e9",
};

/** Dark overrides, applied through the .gb-* classes below. */
const DARK = {
  pageBg: "#0a0a0a",
  cardBg: "#141414",
  border: "#2a2a2a",
  textPrimary: "#f5f5f5",
  textSecondary: "#a1a1aa",
  gold: "#d4af37",
  accentBg: "#1c1710",
};

const CONTACT_INTRO =
  "V prípade zmeny alebo zrušenia rezervácie kontaktujte svojho barbera na tel. číslo, alebo prostredníctvom messengeru.";

const BARBERS = [
  { name: "Vilo", phone: "+421 940 194 630", messenger: "Viliam Kroxy Knotek" },
  { name: "Kubo", phone: "+421 918 165 273", messenger: "Jakub Bača Herich" },
];

function darkModeStyles(): string {
  return `
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    @media (prefers-color-scheme: dark) {
      .gb-page { background-color: ${DARK.pageBg} !important; }
      .gb-card { background-color: ${DARK.cardBg} !important; border-color: ${DARK.border} !important; }
      .gb-text { color: ${DARK.textPrimary} !important; }
      .gb-muted { color: ${DARK.textSecondary} !important; }
      .gb-gold { color: ${DARK.gold} !important; }
      .gb-rule { background-color: ${DARK.border} !important; }
      .gb-accent { background-color: ${DARK.accentBg} !important; }
      .gb-divide { border-bottom-color: ${DARK.border} !important; }
    }
  `;
}

function layout(innerHtml: string): string {
  return `
    <!DOCTYPE html>
    <html lang="sk">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <style>${darkModeStyles()}</style>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0;">
      <!-- Page background lives on this table: Gmail strips <body>, so a body background is lost. -->
      <table role="presentation" class="gb-page" bgcolor="${LIGHT.pageBg}" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${LIGHT.pageBg}; margin: 0; padding: 0;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">
              <tr>
                <td align="center" style="padding-bottom: 32px;">
                  <h1 class="gb-gold" style="color: ${LIGHT.gold}; font-size: 28px; margin: 0; letter-spacing: 2px;">${BRAND.name.toUpperCase()}</h1>
                  <p class="gb-muted" style="color: ${LIGHT.textSecondary}; font-size: 14px; margin: 8px 0 0 0;">${BRAND.tagline}</p>
                </td>
              </tr>
              <tr>
                <td class="gb-card" bgcolor="${LIGHT.cardBg}" style="background-color: ${LIGHT.cardBg}; border: 1px solid ${LIGHT.border}; border-radius: 16px; padding: 32px;">
                  ${innerHtml}
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-top: 32px;">
                  <p class="gb-muted" style="color: ${LIGHT.textSecondary}; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${BRAND.name}. Všetky práva vyhradené.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function row(label: string, value: string, isLast = false): string {
  const divide = isLast ? "" : `border-bottom: 1px solid ${LIGHT.border};`;
  const divideClass = isLast ? "" : "gb-divide";
  return `
    <tr>
      <td class="${divideClass}" style="padding: 12px 0; ${divide}">
        <span class="gb-muted" style="color: ${LIGHT.textSecondary}; font-size: 14px;">${label}</span>
      </td>
      <td class="${divideClass}" style="padding: 12px 0; ${divide} text-align: right;">
        <span class="gb-text" style="color: ${LIGHT.textPrimary}; font-size: 14px; font-weight: 600;">${value}</span>
      </td>
    </tr>
  `;
}

/** Solid rule, not a gradient — Outlook drops gradients and would render nothing. */
function divider(): string {
  return `<div class="gb-rule" style="height: 1px; background-color: ${LIGHT.border}; margin: 24px 0; font-size: 0; line-height: 0;">&nbsp;</div>`;
}

function contactBlock(): string {
  const barbers = BARBERS.map((b) => `
      <p class="gb-text" style="color: ${LIGHT.textPrimary}; font-size: 13px; margin: 12px 0 0 0; line-height: 1.6;">
        <strong class="gb-gold" style="color: ${LIGHT.gold};">${b.name}</strong><br>
        tel. číslo: ${b.phone}<br>
        messenger: ${b.messenger}
      </p>
  `).join("");

  return `
    <div class="gb-accent" style="background-color: ${LIGHT.accentBg}; border-radius: 8px; padding: 16px; margin-top: 16px;">
      <p class="gb-gold" style="color: ${LIGHT.gold}; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">📞 Kontakt na barberov</p>
      <p class="gb-muted" style="color: ${LIGHT.textSecondary}; font-size: 13px; margin: 0; line-height: 1.6;">${CONTACT_INTRO}</p>
      ${barbers}
    </div>
  `;
}

function contactBlockText(): string {
  const barbers = BARBERS
    .map((b) => `${b.name}\n  tel. číslo: ${b.phone}\n  messenger: ${b.messenger}`)
    .join("\n");
  return `KONTAKT NA BARBEROV\n${CONTACT_INTRO}\n\n${barbers}`;
}

function formatDate(iso: string, withYear: boolean): string {
  return new Date(iso).toLocaleDateString("sk-SK", {
    weekday: "long",
    ...(withYear ? { year: "numeric" } : {}),
    month: "long",
    day: "numeric",
  });
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
  const formattedDate = formatDate(p.date, true);

  const inner = `
    <h2 class="gb-text" style="color: ${LIGHT.textPrimary}; font-size: 24px; margin: 0 0 8px 0;">Dobrý deň, ${p.customerName}!</h2>
    <p class="gb-muted" style="color: ${LIGHT.textSecondary}; font-size: 16px; margin: 0 0 32px 0;">Vaša rezervácia bola úspešne prijatá.</p>
    ${divider()}
    <h3 class="gb-gold" style="color: ${LIGHT.gold}; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px 0;">Detaily rezervácie</h3>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse;">
      ${row("Dátum", formattedDate)}
      ${row("Čas", p.time)}
      ${row("Služba", p.serviceName)}
      ${row("Trvanie", `${p.serviceDuration} minút`)}
      ${row("Barber", p.barberName)}
      <tr>
        <td style="padding: 16px 0;"><span class="gb-muted" style="color: ${LIGHT.textSecondary}; font-size: 14px;">Cena</span></td>
        <td style="padding: 16px 0; text-align: right;"><span class="gb-gold" style="color: ${LIGHT.gold}; font-size: 20px; font-weight: 700;">${p.servicePrice}€</span></td>
      </tr>
    </table>
    ${divider()}
    ${contactBlock()}
    <p class="gb-muted" style="color: ${LIGHT.textSecondary}; font-size: 12px; margin: 24px 0 0 0; text-align: center;">
      Tešíme sa na vás!
    </p>
  `;

  const text = `Dobrý deň, ${p.customerName}!

Vaša rezervácia bola úspešne prijatá.

DETAILY REZERVÁCIE
Dátum:   ${formattedDate}
Čas:     ${p.time}
Služba:  ${p.serviceName}
Trvanie: ${p.serviceDuration} minút
Barber:  ${p.barberName}
Cena:    ${p.servicePrice}€

${contactBlockText()}

Tešíme sa na vás!
${BRAND.name}`;

  return {
    subject: "Potvrdenie rezervácie - Gemer Barbier",
    html: layout(inner),
    text,
  };
}

function reservationReminder(p: ReservationPayload) {
  const formattedDate = formatDate(p.date, false);

  const inner = `
    <h2 class="gb-text" style="color: ${LIGHT.textPrimary}; font-size: 24px; margin: 0 0 8px 0;">Pripomienka rezervácie</h2>
    <p class="gb-muted" style="color: ${LIGHT.textSecondary}; font-size: 16px; margin: 0 0 32px 0;">Tešíme sa na vás zajtra, ${p.customerName}!</p>
    ${divider()}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse;">
      ${row("Dátum", formattedDate)}
      ${row("Čas", p.time)}
      ${row("Služba", p.serviceName)}
      ${row("Barber", p.barberName, true)}
    </table>
    ${divider()}
    ${contactBlock()}
  `;

  const text = `Pripomienka rezervácie

Tešíme sa na vás zajtra, ${p.customerName}!

Dátum:  ${formattedDate}
Čas:    ${p.time}
Služba: ${p.serviceName}
Barber: ${p.barberName}

${contactBlockText()}

${BRAND.name}`;

  return {
    subject: "Pripomienka: Vaša rezervácia je zajtra - Gemer Barbier",
    html: layout(inner),
    text,
  };
}

// ============= Registry =============

export type TemplateName = "reservation_confirmation" | "reservation_reminder";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export const TEMPLATES: Record<
  TemplateName,
  (payload: ReservationPayload) => RenderedEmail
> = {
  reservation_confirmation: reservationConfirmation,
  reservation_reminder: reservationReminder,
};

export function renderTemplate(
  name: TemplateName,
  payload: ReservationPayload,
): RenderedEmail {
  const fn = TEMPLATES[name];
  if (!fn) throw new Error(`Unknown template: ${name}`);
  return fn(payload);
}
