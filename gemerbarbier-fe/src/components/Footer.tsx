import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-dark border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-metallic bg-clip-text text-transparent">
                GEMERBARBIER
              </h3>
              <p className="text-muted-foreground">
                Kde sa tradícia stretáva s moderným štýlom. Zažite prémiovú starostlivosť v sofistikovanej atmosfére.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">Rýchle Odkazy</h4>
              <ul className="space-y-2">
                {["O Nás", "Služby", "Tím", "Galéria", "Recenzie", "Kontakt"].map((link, idx) => (
                  <li key={link}>
                    <button
                      onClick={() => {
                        const ids = ["about", "services", "team", "gallery", "reviews", "contact"];
                        const element = document.getElementById(ids[idx]);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social & Contact */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">Spojte sa s Nami</h4>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="p-3 rounded-full bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5 text-accent" />
                </a>
                <a
                  href="#"
                  className="p-3 rounded-full bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-accent" />
                </a>
                <a
                  href="#"
                  className="p-3 rounded-full bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5 text-accent" />
                </a>
              </div>
              <div className="text-muted-foreground space-y-1 text-sm">
                <p>+421 900 123 456</p>
                <p>info@gemerbarbier.sk</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Gemerbarbier. Všetky práva vyhradené.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                Ochrana Súkromia
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                Obchodné Podmienky
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
