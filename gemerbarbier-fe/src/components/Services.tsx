import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

const Services = () => {
  const services = [
    {
      title: "Úprava brady",
      price: "13€",
      duration: "20 min",
      description: "Precízne tvarovanie a úprava brady pre dokonalý mužský vzhľad",
      features: ["Tvarovanie podľa typu tváre", "Olejové ošetrenie", "Styling brady"],
    },
    {
      title: "Obyčajný strih",
      price: "13€",
      duration: "20 min",
      description: "Klasický strih vlasov pre každodenný štýlový vzhľad",
      features: ["Konzultácia zahrnutá", "Umytie vlasov", "Finálny styling"],
    },
    {
      title: "Exclusive strih",
      price: "18€",
      duration: "40 min",
      description: "Prémiový strih s extra starostlivosťou a prémiovými produktmi",
      features: ["Prémiové produkty", "Masáž hlavy", "Individuálny styling"],
    },
    {
      title: "Obyčajný strih + úprava brady",
      price: "25€",
      duration: "40 min",
      description: "Kompletná úprava vlasov aj brady v jednom sedení",
      features: ["Strih vlasov", "Úprava brady", "Ošetrenie pokožky"],
    },
    {
      title: "Exclusive strih + úprava brady",
      price: "30€",
      duration: "60 min",
      description: "Ultimátny balík starostlivosti pre náročných gentlemanov",
      features: ["Prémiový strih", "Luxusná úprava brady", "Relaxačná masáž", "Nápoj zdarma"],
    },
  ];

  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Naše <span className="bg-gradient-metallic bg-clip-text text-transparent">Služby</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-metallic mx-auto mb-6" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Profesionálne služby starostlivosti navrhnuté pre váš najlepší vzhľad
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group bg-card border-border hover:border-accent/50 transition-all duration-300 hover:shadow-metallic animate-fade-in p-6"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="space-y-4">
                {/* Title and Price/Duration */}
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-2xl font-bold">{service.title}</h3>
                  <div className="flex flex-col items-end gap-1 text-accent shrink-0">
                    <span className="text-3xl font-bold">{service.price}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span className="text-sm whitespace-nowrap">{service.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 pt-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-foreground/80">
                      <span className="text-accent">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
