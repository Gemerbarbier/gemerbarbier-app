import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "gb-cookie-consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const decide = (value: "accepted" | "rejected") => {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[100] animate-fade-in">
      <div className="relative bg-card border border-accent/40 shadow-deep p-5 md:p-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-metallic" />
        <button
          onClick={() => decide("rejected")}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Zavrieť"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-accent/10 border border-accent/30">
            <Cookie className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg uppercase tracking-wide mb-1">
              Súbory Cookies
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Používame cookies na zlepšenie vášho zážitku a analýzu návštevnosti.
              Kliknutím na „Prijať" súhlasíte s ich používaním.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="metallic"
            size="sm"
            className="flex-1"
            onClick={() => decide("accepted")}
          >
            Prijať
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => decide("rejected")}
          >
            Odmietnuť
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
