import { useEffect, useState } from "react";
import LegalPage, { LegalSection as Section, OperatorDetails } from "@/components/LegalPage";
import { OPERATOR } from "@/lib/operator";
import { openConsentSettings } from "@/lib/consent";
import { getPrivacyConfig } from "@/lib/api";

const EFFECTIVE_DATE = "1. 8. 2026";

const formatMonths = (months: number) => {
  if (months === 1) return "1 mesiac";
  if (months >= 2 && months <= 4) return `${months} mesiace`;
  return `${months} mesiacov`;
};

const PrivacyPolicy = () => {
  // Comes from the backend (RESERVATION_RETENTION_MONTHS), which also enforces it.
  const [retentionMonths, setRetentionMonths] = useState<number | null>(null);

  useEffect(() => {
    getPrivacyConfig().then(({ data }) => {
      if (data?.reservationRetentionMonths) {
        setRetentionMonths(data.reservationRetentionMonths);
      }
    });
  }, []);

  return (
    <LegalPage
      title="Ochrana"
      titleAccent="Osobných Údajov"
      effectiveDate={EFFECTIVE_DATE}
      intro={
        <>
          Na tejto stránke vás informujeme, ako spracúvame vaše osobné údaje podľa Nariadenia
          Európskeho parlamentu a Rady (EÚ) 2016/679 (GDPR) a zákona č. 18/2018 Z. z. o ochrane
          osobných údajov.
        </>
      }
    >
      <Section title="Prevádzkovateľ">
        <OperatorDetails />
        <p>Zodpovednú osobu (DPO) sme nevymenovali. Vo veciach ochrany údajov nás kontaktujte na uvedenom e-maile.</p>
      </Section>

      <Section title="Online Rezervácia">
        <p>
          <strong className="text-foreground">Údaje:</strong> meno, e-mail, telefónne číslo, voliteľná poznámka,
          zvolený barber, služba a termín.
        </p>
        <p>
          <strong className="text-foreground">Účel:</strong> vytvorenie a správa rezervácie, zaslanie potvrdenia
          a pripomienky termínu e-mailom a SMS, kontaktovanie pri zmene alebo zrušení termínu.
        </p>
        <p>
          <strong className="text-foreground">Právny základ:</strong> plnenie zmluvy a opatrenia pred jej
          uzavretím na vašu žiadosť (čl. 6 ods. 1 písm. b) GDPR).
        </p>
        <p>
          Meno, e-mail a telefónne číslo sú potrebné na vytvorenie rezervácie. Bez nich rezerváciu
          online nie je možné vytvoriť, môžete nás však kontaktovať telefonicky.
        </p>
        <p>
          <strong className="text-foreground">Doba uchovávania:</strong>{" "}
          {retentionMonths ? formatMonths(retentionMonths) : "…"} od vytvorenia rezervácie. Potom vaše
          meno, e-mail, telefónne číslo a poznámku automaticky vymažeme. Ponecháme len anonymný záznam o termíne a službe na štatistické účely.
        </p>
      </Section>

      <Section title="Komunikácia E-mailom a Telefonicky">
        <p>
          Ak nás kontaktujete e-mailom, telefonicky alebo cez Instagram, spracúvame údaje, ktoré nám
          poskytnete, len na vybavenie vašej požiadavky. Právnym základom je náš oprávnený záujem
          odpovedať na vašu správu (čl. 6 ods. 1 písm. f) GDPR), prípadne plnenie zmluvy.
        </p>
      </Section>

      <Section title="Príjemcovia Údajov">
        <p>Vaše údaje sprístupňujeme len poskytovateľom služieb, ktorí nám pomáhajú prevádzkovať rezervácie:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Resend (Resend, Inc., USA) – odosielanie potvrdzovacích a pripomienkových e-mailov,</li>
          <li>GatewayAPI (OnlineCity.IO ApS, Dánsko) – odosielanie SMS pripomienok,</li>
          <li>WebSupport s.r.o. (Slovensko) – webhosting,</li>
          <li>Render Services, Inc. (USA) – prevádzka databázy na serveroch vo Frankfurte (EÚ),</li>
          <li>Google (Google Ireland Limited) – mapa na stránke (len so súhlasom).</li>
        </ul>
        <p>
          Pri poskytovateľoch so sídlom mimo EÚ (USA) sa prenos uskutočňuje na základe rozhodnutia
          Európskej komisie o primeranosti (EU-US Data Privacy Framework) alebo štandardných zmluvných
          doložiek. Vaše údaje nepredávame a nepoužívame na marketing.
        </p>
      </Section>

      <Section title="Cookies a Lokálne Úložisko">
        <p>
          Bez vášho súhlasu ukladáme vo vašom prehliadači len nevyhnutné technické údaje: vašu voľbu
          ohľadom cookies a verziu aplikácie (na načítanie aktuálnej verzie stránky).
        </p>
        <p>
          Mapa Google Maps v sekcii Kontakt sa načíta až po vašom súhlase, pretože spoločnosť Google
          pri jej zobrazení môže ukladať vlastné cookies a spracúvať vašu IP adresu. Súhlas môžete
          kedykoľvek odvolať alebo zmeniť{" "}
          <button onClick={openConsentSettings} className="text-accent hover:underline">
            v nastaveniach cookies
          </button>
          . Analytické ani reklamné cookies nepoužívame.
        </p>
      </Section>

      <Section title="Vaše Práva">
        <p>Máte právo:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>na prístup k svojim osobným údajom (čl. 15 GDPR),</li>
          <li>na opravu nesprávnych údajov (čl. 16 GDPR),</li>
          <li>na vymazanie údajov (čl. 17 GDPR),</li>
          <li>na obmedzenie spracúvania (čl. 18 GDPR),</li>
          <li>na prenosnosť údajov (čl. 20 GDPR),</li>
          <li>kedykoľvek odvolať udelený súhlas bez vplyvu na zákonnosť spracúvania pred jeho odvolaním.</li>
        </ul>
        <p className="text-foreground font-medium">
          Máte tiež právo kedykoľvek namietať proti spracúvaniu založenému na našom oprávnenom
          záujme (čl. 21 GDPR).
        </p>
        <p>
          Svoje práva si môžete uplatniť e-mailom na{" "}
          <a href={`mailto:${OPERATOR.email}`} className="text-accent hover:underline">{OPERATOR.email}</a>.
          Ak sa domnievate, že spracúvame vaše údaje nezákonne, môžete podať návrh na začatie konania
          na Úrad na ochranu osobných údajov Slovenskej republiky, Hraničná 12, 820 07 Bratislava 27,{" "}
          <a
            href="https://dataprotection.gov.sk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            dataprotection.gov.sk
          </a>
          .
        </p>
        <p>Automatizované rozhodovanie ani profilovanie nevykonávame.</p>
      </Section>
    </LegalPage>
  );
};

export default PrivacyPolicy;
