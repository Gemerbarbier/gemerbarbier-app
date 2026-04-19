import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import GoogleMap from "@/components/GoogleMap";

const Contact = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Adresa",
      details: ["Ulica 123", "Centrum", "Mesto, 12345"],
    },
    {
      icon: Phone,
      title: "Telefón",
      details: ["+421 900 123 456", "+421 900 987 654"],
    },
    {
      icon: Mail,
      title: "E-mail",
      details: ["info@gemerbarbier.sk", "rezervacie@gemerbarbier.sk"],
    },
    {
      icon: Clock,
      title: "Otváracie Hodiny",
      details: ["Pon - Pia: 9:00 - 20:00", "Sob - Ned: 10:00 - 18:00"],
    },
  ];

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Kontaktujte <span className="bg-gradient-metallic bg-clip-text text-transparent">Nás</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-metallic mx-auto mb-6" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Navštívte nás alebo nás kontaktujte – sme tu pre vás
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {contactInfo.map((info, index) => (
            <Card
              key={index}
              className="p-6 bg-card border-border hover:border-accent/50 transition-all duration-300 hover:shadow-metallic animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-accent/10 border border-accent/20">
                  <info.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold">{info.title}</h3>
                <div className="space-y-1">
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-sm text-muted-foreground">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Interactive Map */}
        <div className="max-w-7xl mx-auto animate-fade-in">
          <GoogleMap />
        </div>
      </div>
    </section>
  );
};

export default Contact;
