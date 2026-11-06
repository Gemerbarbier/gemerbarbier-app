import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { OPERATOR } from "@/lib/operator";

export const LegalSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
    <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
  </section>
);

export const OperatorDetails = () => (
  <p>
    {OPERATOR.name}
    <br />
    miesto podnikania: {OPERATOR.address}
    <br />
    IČO: {OPERATOR.ico}
    <br />
    {OPERATOR.register}
    <br />
    prevádzka: {OPERATOR.premises}
    <br />
    E-mail:{" "}
    <a href={`mailto:${OPERATOR.email}`} className="text-accent hover:underline">{OPERATOR.email}</a>
    <br />
    Telefón: {OPERATOR.phone}
  </p>
);

interface LegalPageProps {
  title: string;
  titleAccent: string;
  intro: React.ReactNode;
  effectiveDate: string;
  children: React.ReactNode;
}

const LegalPage = ({ title, titleAccent, intro, effectiveDate, children }: LegalPageProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Späť na hlavnú stránku
          </Link>

          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {title} <span className="bg-gradient-metallic bg-clip-text text-transparent">{titleAccent}</span>
            </h1>
            <div className="h-1 w-24 bg-gradient-metallic mb-6" />
            <p className="text-muted-foreground leading-relaxed">{intro}</p>
          </div>

          {children}

          <p className="text-sm text-muted-foreground">Účinné od: {effectiveDate}</p>
        </div>
      </div>
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default LegalPage;
