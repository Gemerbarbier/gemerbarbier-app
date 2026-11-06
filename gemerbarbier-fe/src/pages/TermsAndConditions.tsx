import { Link } from "react-router-dom";
import LegalPage, { LegalSection as Section, OperatorDetails } from "@/components/LegalPage";
import { OPERATOR } from "@/lib/operator";

const EFFECTIVE_DATE = "1. 8. 2026";

const TermsAndConditions = () => {
  return (
    <LegalPage
      title="Obchodné"
      titleAccent="Podmienky"
      effectiveDate={EFFECTIVE_DATE}
      intro={
        <>
          Tieto obchodné podmienky upravujú rezerváciu termínov a poskytovanie holičských služieb
          v prevádzke Gemerbarbier.
        </>
      }
    >
      <Section title="Poskytovateľ Služieb">
        <OperatorDetails />
      </Section>

      <Section title="Služby a Ceny">
        <p>
          Aktuálny zoznam služieb a ich ceny sú uvedené na tejto stránke v sekcii Služby. Ceny sú
          uvedené v eurách a sú konečné. Cena sa platí v prevádzke po poskytnutí služby.
        </p>
      </Section>

      <Section title="Rezervácia Termínu">
        <p>
          Termín si môžete rezervovať cez rezervačný formulár na tejto stránke, telefonicky alebo
          e-mailom. Pri online rezervácii vyberiete barbera, službu a voľný termín a uvediete svoje
          meno, e-mail a telefónne číslo.
        </p>
        <p>
          Rezervácia je vytvorená jej odoslaním. Potvrdenie vám zašleme e-mailom a pred termínom vám
          pošleme pripomienku e-mailom a SMS. Odoslaním rezervácie potvrdzujete, že ste sa s týmito
          obchodnými podmienkami oboznámili.
        </p>
      </Section>

      <Section title="Zmena a Zrušenie Rezervácie">
        <p>
          Rezerváciu môžete zrušiť alebo zmeniť e-mailom na{" "}
          <a href={`mailto:${OPERATOR.email}`} className="text-accent hover:underline">{OPERATOR.email}</a>,
          telefonicky alebo cez Messenger. Telefónne číslo a Messenger kontakt na vášho barbera nájdete
          v potvrdzovacom e-maile. Zrušenie je bezplatné a nie je viazané na žiadnu lehotu.
        </p>
        <p>
          Prosíme vás však, aby ste nám zrušenie oznámili čo najskôr, aby termín mohol využiť niekto iný.
        </p>
        <p>
          Pri meškaní sa čas služby môže skrátiť alebo môže byť potrebné termín presunúť, aby sme
          nezdržali ďalších zákazníkov.
        </p>
        <p>
          Ak termín z vážnych dôvodov (napr. choroba) nemôžeme dodržať my, bezodkladne vás o tom
          budeme informovať a ponúkneme vám náhradný termín.
        </p>
      </Section>

      <Section title="Vady Služby (Reklamácia)">
        <p>
          Ak nie ste so službou spokojní, vytknite nám vadu bez zbytočného odkladu osobne
          v prevádzke, telefonicky alebo e-mailom. Bezodkladne vám potvrdíme jej prijatie a lehotu
          na jej odstránenie, ktorá nebude dlhšia ako 30 dní odo dňa vytknutia vady.
        </p>
      </Section>

      <Section title="Alternatívne Riešenie Sporov">
        <p>
          Ak nie ste spokojní so spôsobom, akým sme vybavili vašu reklamáciu, alebo ak sa domnievate,
          že sme porušili vaše práva, môžete nás požiadať o nápravu. Ak vašu žiadosť zamietneme alebo
          na ňu neodpovieme do 30 dní, môžete podať návrh na alternatívne riešenie sporu subjektu
          alternatívneho riešenia sporov, napríklad Slovenskej obchodnej inšpekcii (
          <a
            href="https://www.soi.sk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            www.soi.sk
          </a>
          ). Tým nie je dotknuté vaše právo obrátiť sa na súd.
        </p>
      </Section>

      <Section title="Orgán Dozoru">
        <p>
          Slovenská obchodná inšpekcia, Inšpektorát SOI pre Banskobystrický kraj, Dolná 46,
          974 00 Banská Bystrica.
        </p>
      </Section>

      <Section title="Ochrana Osobných Údajov">
        <p>
          Informácie o tom, ako spracúvame vaše osobné údaje, nájdete na stránke{" "}
          <Link to="/ochrana-osobnych-udajov" className="text-accent hover:underline">
            Ochrana osobných údajov
          </Link>
          .
        </p>
      </Section>

      <Section title="Záverečné Ustanovenia">
        <p>
          Tieto obchodné podmienky môžeme meniť. Na rezerváciu sa vzťahuje znenie účinné v čase jej
          vytvorenia.
        </p>
      </Section>
    </LegalPage>
  );
};

export default TermsAndConditions;
