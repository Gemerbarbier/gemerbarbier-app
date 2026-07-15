import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-barbershop.jpg";

const Hero = () => {
  const scrollToReservation = () => {
    const element = document.getElementById("reservation");
    if (element) {
      const offset = 80;
      window.scrollTo({ top: element.offsetTop - offset, behavior: "smooth" });
    }
  };

  const scrollToServices = () => {
    const element = document.getElementById("services");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-24 pb-12"
    >
      {/* Background watermark text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <h2 className="font-display font-bold uppercase leading-none text-accent/[0.04] text-[28vw] md:text-[24vw] tracking-tighter">
          GEMER
        </h2>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="lg:col-span-7 space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 border border-border bg-card/50 backdrop-blur-sm px-4 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-accent font-bold text-[10px] uppercase tracking-[0.2em]">
                Prémiový pánsky barbershop
              </span>
            </div>

            <h1 className="font-display font-bold uppercase leading-[0.85] tracking-tight text-foreground text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
              PRÉMIOVÁ <span className="text-accent">STAROSTLIVOSŤ</span>
              <br />
              <span
                className="text-transparent"
                style={{ WebkitTextStroke: "1px hsl(var(--border))" }}
              >
                O VZHĽAD
              </span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg max-w-xl border-l-2 border-accent pl-6 py-1 leading-relaxed">
              Kde sa tradičné remeslo stretáva s moderným štýlom. Industriálny
              vibe, presná technika a osobitý prístup ku každému klientovi.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button variant="metallic" size="lg" onClick={scrollToReservation}>
                Rezervovať Termín
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-border hover:border-accent hover:text-accent"
                onClick={scrollToServices}
              >
                Zobraziť Služby
              </Button>
            </div>
          </div>

          {/* Right: Image */}
          <div className="lg:col-span-5 relative animate-fade-in-right">
            <div className="relative w-full aspect-[4/5] overflow-hidden border-[10px] border-card shadow-deep group">
              <img
                src={heroImage}
                alt="Gemerbarbier interior"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-background/30 group-hover:bg-transparent transition-colors duration-1000" />
            </div>
            {/* Corner accents */}
            <div className="absolute -bottom-4 -left-4 w-28 h-28 md:w-40 md:h-40 border-b-2 border-l-2 border-accent/40 -z-10" />
            <div className="absolute -top-4 -right-4 w-28 h-28 md:w-40 md:h-40 border-t-2 border-r-2 border-border -z-10" />
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="hidden md:flex absolute bottom-0 left-0 w-full py-6 border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-10">
              <div className="flex flex-col">
                <span className="text-accent font-display font-bold text-3xl leading-none">
                  2
                </span>
                <span className="text-muted-foreground text-[9px] uppercase font-bold tracking-[0.2em] mt-2">
                  Majstri remesla
                </span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-foreground font-display font-bold text-3xl leading-none">
                  24/7
                </span>
                <span className="text-muted-foreground text-[9px] uppercase font-bold tracking-[0.2em] mt-2">
                  Online rezervácia
                </span>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-6 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest">
              <span>#Gemerbarbier</span>
              <span className="w-1 h-1 bg-border rounded-full" />
              <span>#TraditionalBarber</span>
              <span className="w-1 h-1 bg-border rounded-full" />
              <span>Revúca</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
