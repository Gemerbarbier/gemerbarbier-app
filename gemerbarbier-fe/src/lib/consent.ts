import { useEffect, useState } from "react";

/**
 * Cookie consent state shared between the consent banner and components that load
 * third-party content (e.g. Google Maps), which may only run after the visitor agrees.
 */
export type ConsentValue = "accepted" | "rejected";

export const CONSENT_STORAGE_KEY = "gb-cookie-consent";
const CONSENT_CHANGE_EVENT = "gb-consent-change";
const CONSENT_OPEN_EVENT = "gb-consent-open";

export const getConsent = (): ConsentValue | null => {
  const value = localStorage.getItem(CONSENT_STORAGE_KEY);
  return value === "accepted" || value === "rejected" ? value : null;
};

export const setConsent = (value: ConsentValue): void => {
  localStorage.setItem(CONSENT_STORAGE_KEY, value);
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
};

/** Re-opens the consent banner so the visitor can change or withdraw their choice. */
export const openConsentSettings = (): void => {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
};

export const onConsentSettingsOpen = (handler: () => void): (() => void) => {
  window.addEventListener(CONSENT_OPEN_EVENT, handler);
  return () => window.removeEventListener(CONSENT_OPEN_EVENT, handler);
};

export const useConsent = (): ConsentValue | null => {
  const [consent, setConsentState] = useState<ConsentValue | null>(getConsent);

  useEffect(() => {
    const update = () => setConsentState(getConsent());
    window.addEventListener(CONSENT_CHANGE_EVENT, update);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, update);
  }, []);

  return consent;
};
