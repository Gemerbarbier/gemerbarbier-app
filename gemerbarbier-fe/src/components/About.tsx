import { Award, Users, Clock } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Award,
      title: "Skúsení Holiči",
      description: "Vyškolení profesionáli s rokmi skúseností",
    },
    {
      icon: Users,
      title: "Prémiový Servis",
      description: "Personalizovaná starostlivosť pre každého klienta",
    },
    {
      icon: Clock,
      title: "Flexibilný Čas",
      description: "Otvorené 7 dní v týždni pre vaše pohodlie",
    },
  ];

  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              O <span className="bg-gradient-metallic bg-clip-text text-transparent">Gemerbarbier</span>
            </h2>
            <div className="h-1 w-24 bg-gradient-metallic mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Založené s vášňou pre precíznosť a štýl, spájame tradičné holičské 
              techniky s modernými trendmi, aby sme poskytli bezkonkurenčný zážitok.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-card border border-border rounded-lg p-8 shadow-deep hover:shadow-metallic transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-colors">
                    <feature.icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Story Section */}
          <div className="bg-card border border-border rounded-lg p-8 md:p-12 shadow-deep animate-fade-in">
            <h3 className="text-2xl font-bold mb-6 text-center md:text-left">Náš Príbeh</h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                V Gemerbarbier veríme, že skvelý strih je viac než len služba – je to umenie. 
                Náš holičstvo spája nadčasové tradície klasického holičstva s modernými technikami a štýlom.
              </p>
              <p>
                Každý člen nášho tímu je majstrom svojho remesla, oddaný poskytovaniu prémiového 
                zážitku v sofistikovanom a zároveň príjemnom prostredí. Používame len najlepšie produkty 
                a nástroje, aby každá návšteva zanechala váš najlepší vzhľad a pocit.
              </p>
              <p>
                Či už prichádzate na klasický strih, moderný štýl, alebo tradičné holenie britovou, 
                sme odhodlaní prekročiť vaše očakávania pri každej návšteve.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
