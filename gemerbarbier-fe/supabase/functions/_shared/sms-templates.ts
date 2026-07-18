export type SmsTemplateName = "reservation_confirmation" | "reservation_reminder";

export interface SmsReservationPayload {
  customerName: string;
  date: string;
  time: string;
  serviceName: string;
  barberName: string;
}

export function renderSmsTemplate(
  template: SmsTemplateName,
  payload: SmsReservationPayload,
): string {
  const dateOnly = payload.date.split("T")[0];
  const [y, m, d] = dateOnly.split("-");
  const humanDate = `${d}.${m}.${y}`;

  if (template === "reservation_confirmation") {
    return `GemerBarbier: Rezervacia potvrdena ${humanDate} o ${payload.time}, ${payload.serviceName} (${payload.barberName}). Info: +421 940 194 630`;
  }
  // reminder
  return `GemerBarbier: Pripominame Vasu rezervaciu zajtra ${humanDate} o ${payload.time}, ${payload.serviceName} (${payload.barberName}). Tesime sa!`;
}

/** Normalize Slovak-style phone to MSISDN integer (e.g. +421 940 194 630 -> 421940194630). */
export function normalizePhoneToMsisdn(raw: string): number | null {
  if (!raw) return null;
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = "421" + digits.slice(1); // assume SK
  const n = Number(digits);
  if (!Number.isFinite(n) || digits.length < 8) return null;
  return n;
}
