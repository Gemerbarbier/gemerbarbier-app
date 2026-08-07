/**
 * Email Templates
 * Each template returns { subject, html } from a typed payload.
 * Add new templates here and register them in the TEMPLATES map.
 */

const BRAND = {
  name: "Gemerbarbier",
  tagline: "Premium Barbershop",
  gold: "#b8860b",
  dark: "#111111",
  text: "#1a1a1a",
  muted: "#555555",
  lightBg: "#f8f8f8",
  white: "#ffffff",
  border: "#e0e0e0",
};

const BARBERS = [
  {
    match: ["viliam", "vilo", "knotek"],
    name: "Viliam Knotek",
    phone: "+421 940 194 630",
    messenger: "Viliam Kroxy Knotek",
  },
  {
    match: ["jakub", "kubo", "herich", "bača", "baca"],
    name: "Jakub Herich",
    phone: "+421 918 165 273",
    messenger: "Jakub Bača Herich",
  },
];

function findBarber(barberName: string) {
  const n = (barberName || "").toLowerCase();
  return BARBERS.find((b) => b.match.some((m) => n.includes(m)));
}

function layout(innerHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: ${BRAND.lightBg}; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 600px; margin: 0 auto; padding: 32px 16px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="color: ${BRAND.gold}; font-size: 26px; margin: 0; letter-spacing: 2px; font-weight: 700;">${BRAND.name.toUpperCase()}</h1>
          <p style="color: ${BRAND.muted}; font-size: 13px; margin-top: 6px; letter-spacing: 1px;">${BRAND.tagline}</p>
        </div>
        <div style="background: ${BRAND.white}; border: 1px solid ${BRAND.border}; border-radius: 12px; padding: 24px;">
          ${innerHtml}
        </div>
        <div style="text-align: center; margin-top: 28px;">
          <p style="color: ${BRAND.muted}; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${BRAND.name}. Všetky práva vyhradené.</p>
          <p style="color: ${BRAND.muted}; font-size: 12px; margin: 8px 0 0 0;">
            <a href="https://gemerbarbier.sk" style="color: ${BRAND.gold}; text-decoration: none;">gemerbarbier.sk</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Stacked row: label on its own line, value below → nothing overflows on mobile.
function row(label: string, value: string, isLast = false): string {
  const border = isLast ? "" : `border-bottom: 1px solid #eeeeee;`;
  return `
    <tr>
      <td style="padding: 10px 0; ${border}">
        <div style="color: ${BRAND.muted}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">${label}</div>
        <div style="color: ${BRAND.text}; font-size: 16px; font-weight: 600; line-height: 1.4; word-break: break-word;">${value}</div>
      </td>
    </tr>
  `;
}

function divider(): string {
  return `<div style="height: 1px; background: ${BRAND.border}; margin: 20px 0;"></div>`;
}

function contactBlock(barberName: string): string {
  const b = findBarber(barberName);
  const shop = `
    <p style="color: ${BRAND.text}; font-size: 14px; margin: 0 0 6px 0; line-height: 1.6;">
      <strong style="color: ${BRAND.gold};">E-mail:</strong>
      <a href="mailto:gemerbarbierra@gmail.com" style="color: ${BRAND.text};">gemerbarbierra@gmail.com</a>
    </p>
    <p style="color: ${BRAND.text}; font-size: 14px; margin: 0; line-height: 1.6;">
      <strong style="color: ${BRAND.gold};">Adresa:</strong> Magnezitárov 1209/9, 050 01 Revúca
    </p>
  `;

  const barberPart = b
    ? `
      <p style="color: ${BRAND.text}; font-size: 14px; margin: 0 0 6px 0; line-height: 1.6;">
        <strong style="color: ${BRAND.gold};">${b.name}</strong>
      </p>
      <p style="color: ${BRAND.text}; font-size: 14px; margin: 0 0 6px 0; line-height: 1.6;">
        <strong style="color: ${BRAND.gold};">Telefón:</strong>
        <a href="tel:${b.phone.replace(/\s+/g, "")}" style="color: ${BRAND.text};">${b.phone}</a>
      </p>
      <p style="color: ${BRAND.text}; font-size: 14px; margin: 0 0 14px 0; line-height: 1.6;">
        <strong style="color: ${BRAND.gold};">Messenger:</strong> ${b.messenger}
      </p>
    `
    : BARBERS.map(
        (x) => `
      <p style="color: ${BRAND.text}; font-size: 14px; margin: 0 0 6px 0; line-height: 1.6;">
        <strong style="color: ${BRAND.gold};">${x.name}</strong> –
        <a href="tel:${x.phone.replace(/\s+/g, "")}" style="color: ${BRAND.text};">${x.phone}</a>
      </p>
    `,
      ).join("") + `<div style="height: 8px;"></div>`;

  return `
    <div style="background: #fffbeb; border: 1px solid #f3e8c6; border-radius: 8px; padding: 18px; margin-top: 16px;">
      <p style="color: ${BRAND.gold}; font-size: 14px; margin: 0 0 10px 0; font-weight: 700;">Kontakt</p>
      <p style="color: ${BRAND.muted}; font-size: 13px; margin: 0 0 14px 0; line-height: 1.6;">
        V prípade zmeny alebo zrušenia rezervácie nás kontaktujte telefonicky, e-mailom alebo cez Messenger.
      </p>
      ${barberPart}
      ${shop}
    </div>
  `;
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
    <h2 style="color: ${BRAND.text}; font-size: 22px; margin: 0 0 8px 0; font-weight: 700; line-height: 1.3;">Dobrý deň, ${p.customerName}!</h2>
    <p style="color: ${BRAND.muted}; font-size: 15px; margin: 0 0 20px 0; line-height: 1.5;">Vaša rezervácia bola úspešne prijatá.</p>
    ${divider()}
    <h3 style="color: ${BRAND.gold}; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 0; font-weight: 700;">Detaily rezervácie</h3>
    <table style="width: 100%; border-collapse: collapse;">
      ${row("Dátum", formattedDate)}
      ${row("Čas", p.time)}
      ${row("Služba", p.serviceName)}
      ${row("Trvanie", `${p.serviceDuration} minút`)}
      ${row("Barber", p.barberName)}
      <tr>
        <td style="padding: 10px 0;">
          <div style="color: ${BRAND.muted}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">Cena</div>
          <div style="color: ${BRAND.gold}; font-size: 22px; font-weight: 700;">${p.servicePrice}€</div>
        </td>
      </tr>
    </table>
    ${contactBlock(p.barberName)}
    <p style="color: ${BRAND.muted}; font-size: 13px; margin: 20px 0 0 0; text-align: center; line-height: 1.5;">
      Tešíme sa na vás!
    </p>
  `;

  return {
    subject: "Potvrdenie rezervácie - Gemerbarbier",
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
    <h2 style="color: ${BRAND.text}; font-size: 22px; margin: 0 0 8px 0; font-weight: 700; line-height: 1.3;">Pripomienka rezervácie</h2>
    <p style="color: ${BRAND.muted}; font-size: 15px; margin: 0 0 20px 0; line-height: 1.5;">Tešíme sa na vás zajtra, ${p.customerName}!</p>
    ${divider()}
    <table style="width: 100%; border-collapse: collapse;">
      ${row("Dátum", formattedDate)}
      ${row("Čas", p.time)}
      ${row("Služba", p.serviceName)}
      ${row("Barber", p.barberName, true)}
    </table>
    ${contactBlock(p.barberName)}
  `;

  return {
    subject: "Pripomienka: Vaša rezervácia je zajtra - Gemerbarbier",
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
