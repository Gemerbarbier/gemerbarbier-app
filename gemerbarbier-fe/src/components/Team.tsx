import { Card } from "@/components/ui/card";
import { Award, Scissors } from "lucide-react";
import kuboPicture from "@/assets/kubo.jpeg";
import viloPicture from "@/assets/vilo.jpeg";

const Team = () => {
  const barbers = [
    {
      name: "Viliam Kroxy Knotek",
      role: "Majster Holič",
      experience: "12 rokov skúseností",
      specialties: ["Exclusive strihy", "Úprava brady", "Precízny styling"],
      image: viloPicture,
    },
    {
      name: "Jakub Bača Herich",
      role: "Senior Holič",
      experience: "8 rokov skúseností",
      specialties: ["Moderné strihy", "Úprava brady", "Klasické strihy"],
      image: kuboPicture,
    },
  ];

  return (
    <section id="team" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Náš <span className="bg-gradient-metallic bg-clip-text text-transparent">Tím</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-metallic mx-auto mb-6" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Skúsení profesionáli oddaní dokonalosti a vášmu spokojnosti
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {barbers.map((barber, index) => (
            <Card
              key={index}
              className="overflow-hidden bg-card border-border hover:border-accent/50 transition-all duration-300 hover:shadow-metallic animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={barber.image}
                  alt={barber.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-8 space-y-4">
                {/* Name and Role */}
                <div>
                  <h3 className="text-2xl font-bold mb-1">{barber.name}</h3>
                  <div className="flex items-center gap-2 text-accent">
                    <Scissors className="w-4 h-4" />
                    <span className="font-medium">{barber.role}</span>
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="w-5 h-5 text-accent" />
                  <span>{barber.experience}</span>
                </div>

                {/* Specialties */}
                <div className="pt-2">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Špecializácia:</h4>
                  <ul className="space-y-2">
                    {barber.specialties.map((specialty, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-foreground/80">
                        <span className="text-accent">•</span>
                        <span>{specialty}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
