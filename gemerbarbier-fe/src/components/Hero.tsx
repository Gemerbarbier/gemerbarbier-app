import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";
import heroImage from "@/assets/hero-barbershop.jpg";

const Hero = () => {
  const scrollToReservation = () => {
    const element = document.getElementById("reservation");
    if (element) {
      const offset = 80;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Modern barbershop interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm animate-scale-in">
              <Scissors className="w-12 h-12 text-accent" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight">
            <span className="block text-foreground mb-2">PRÉMIOVÁ</span>
            <span className="block bg-gradient-metallic bg-clip-text text-transparent">
              STAROSTLIVOSŤ
            </span>
            <span className="block text-foreground">O VZHĽAD</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Kde sa tradičné remeslo stretáva s moderným štýlom
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button variant="metallic" size="lg" onClick={scrollToReservation}>
              Rezervovať Termín
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-accent/50 hover:bg-accent/10 hover:border-accent"
              onClick={() => {
                const element = document.getElementById("services");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Zobraziť Služby
            </Button>
          </div>

          {/* Decorative Line */}
          <div className="pt-8 flex items-center justify-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-accent" />
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-accent" />
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
