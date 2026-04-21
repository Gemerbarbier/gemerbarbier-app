import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  getBarbers,
  getServices,
  getAvailableSlots,
  createReservation,
  type Barber,
  type Service,
  type AvailableTimeSlotResponse,
} from "@/lib/api";

const Reservation = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBarbers, setIsLoadingBarbers] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableTimeSlotResponse[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: undefined as Date | undefined,
    time: "",
    serviceId: "",
    barberId: "",
    note: "",
  });

  // Fetch barbers on mount
  useEffect(() => {
    const fetchBarbers = async () => {
      setIsLoadingBarbers(true);
      const response = await getBarbers();
      if (response.success && response.data) {
        setBarbers(response.data);
      } else {
        toast({
          title: "Chyba",
          description: "Nepodarilo sa načítať holičov",
          variant: "destructive",
        });
      }
      setIsLoadingBarbers(false);
    };
    fetchBarbers();
  }, [toast]);

  // Fetch services when barber is selected
  useEffect(() => {
    if (!formData.barberId) {
      setServices([]);
      return;
    }

    const fetchServices = async () => {
      setIsLoadingServices(true);
      const response = await getServices();
      if (response.success && response.data) {
        setServices(response.data);
      } else {
        toast({
          title: "Chyba",
          description: "Nepodarilo sa načítať služby",
          variant: "destructive",
        });
      }
      setIsLoadingServices(false);
    };
    fetchServices();
  }, [formData.barberId, toast]);

  // Fetch available slots when barber and service are selected
  useEffect(() => {
    if (!formData.barberId || !formData.serviceId) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      const response = await getAvailableSlots({
        barberId: formData.barberId,
        serviceId: formData.serviceId,
      });
      if (response.success && response.data) {
        setAvailableSlots(response.data);
      } else {
        toast({
          title: "Chyba",
          description: "Nepodarilo sa načítať dostupné termíny",
          variant: "destructive",
        });
      }
      setIsLoadingSlots(false);
    };
    fetchSlots();
  }, [formData.barberId, formData.serviceId, toast]);

  // Derive available dates and times from slots
  const availableDates = new Set(availableSlots.map(s => s.date));
  const timesForSelectedDate = formData.date
    ? availableSlots.find(s => s.date === format(formData.date!, "yyyy-MM-dd"))?.timeList || []
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time || !formData.serviceId || !formData.barberId) {
      toast({
        title: "Chýbajúce Informácie",
        description: "Prosím vyplňte všetky polia pre dokončenie rezervácie.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const startTime = `${format(formData.date, "yyyy-MM-dd")}T${formData.time}:00`;

    const response = await createReservation({
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      barberId: parseInt(formData.barberId),
      serviceId: parseInt(formData.serviceId),
      startTime,
      ...(formData.note ? { note: formData.note } : {}),
    });

    if (response.success) {
      // Get service and barber details for email (id may be number or string)
      const selectedService = services.find(s => String(s.id) === String(formData.serviceId));
      const selectedBarber = barbers.find(b => String(b.id) === String(formData.barberId));

      // Send confirmation email (non-blocking)
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        await fetch(`${supabaseUrl}/functions/v1/send-reservation-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            date: format(formData.date, "yyyy-MM-dd"),
            time: formData.time,
            serviceName: selectedService?.name || "Služba",
            servicePrice: selectedService?.price || 0,
            serviceDuration: selectedService?.duration || 30,
            barberName: selectedBarber?.name || "Holič",
          }),
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't show error to user - reservation was still successful
      }

      toast({
        title: "Rezervácia Prijatá!",
        description: "Potvrdenie vám bolo zaslané e-mailom.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        date: undefined,
        time: "",
        serviceId: "",
        barberId: "",
        note: "",
      });
    } else {
      toast({
        title: "Chyba",
        description: response.error?.message || "Nepodarilo sa vytvoriť rezerváciu",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormData({
      ...formData,
      date,
      time: "",
    });
  };

  const handleBarberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      barberId: e.target.value,
      serviceId: "",
      date: undefined,
      time: "",
    });
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      serviceId: e.target.value,
      date: undefined,
      time: "",
    });
  };

  return (
    <section id="reservation" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Rezervujte si <span className="bg-gradient-metallic bg-clip-text text-transparent">Termín</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-metallic mx-auto mb-6" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Rezervujte si miesto a zažite prémiovú starostlivosť v jej najlepšej forme
          </p>
        </div>

        {/* Booking Form */}
        <Card className="max-w-3xl mx-auto p-8 md:p-12 bg-card border-border shadow-deep animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <CalendarIcon className="w-8 h-8 text-accent" />
            <h3 className="text-2xl font-bold">Detaily Rezervácie</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Celé Meno *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ján Novák"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-background border-border focus:border-accent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jan@priklad.sk"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-background border-border focus:border-accent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefónne Číslo *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+421 900 000 000"
                value={formData.phone}
                onChange={handleChange}
                required
                className="bg-background border-border focus:border-accent"
              />
            </div>

            {/* Barber Selection */}
            <div className="space-y-2">
              <Label htmlFor="barberId">Vyberte Holiča *</Label>
              <select
                id="barberId"
                name="barberId"
                value={formData.barberId}
                onChange={handleBarberChange}
                required
                disabled={isLoadingBarbers}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
              >
                <option value="" className="text-muted-foreground">
                  {isLoadingBarbers ? "Načítavam..." : "Vyberte holiča..."}
                </option>
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Selection */}
            <div className="space-y-2">
              <Label htmlFor="serviceId">Vyberte Službu *</Label>
              <select
                id="serviceId"
                name="serviceId"
                value={formData.serviceId}
                onChange={handleServiceChange}
                required
                disabled={!formData.barberId || isLoadingServices}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" className="text-muted-foreground">
                  {!formData.barberId 
                    ? "Najprv vyberte holiča" 
                    : isLoadingServices 
                      ? "Načítavam..." 
                      : "Vyberte službu..."}
                </option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.duration} min) - {service.price}€
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Preferovaný Dátum *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={!formData.serviceId}
                      className={cn(
                        "w-full h-10 justify-start text-left font-normal bg-background border-border hover:bg-accent/10",
                        !formData.date && "text-muted-foreground",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        formData.serviceId && "border-accent text-accent hover:text-accent"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "dd.MM.yyyy", { locale: sk })
                      ) : (
                        <span>{formData.serviceId ? "Vyberte dátum..." : "Najprv vyberte službu"}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={handleDateSelect}
                      disabled={(date) => {
                        const dateStr = format(date, "yyyy-MM-dd");
                        return date < new Date() || date.getDay() === 0 || !availableDates.has(dateStr);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Preferovaný Čas *</Label>
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  disabled={!formData.date || isLoadingSlots}
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" className="text-muted-foreground">
                    {!formData.date 
                      ? "Najprv vyberte dátum" 
                      : isLoadingSlots 
                        ? "Načítavam..." 
                        : timesForSelectedDate.length === 0 
                          ? "Žiadne voľné termíny" 
                          : "Vyberte čas..."}
                  </option>
                  {timesForSelectedDate.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Poznámka</Label>
              <textarea
                id="note"
                name="note"
                placeholder="Voliteľná poznámka k rezervácii..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="metallic"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Odosielam...
                  </>
                ) : (
                  "Potvrdiť Rezerváciu"
                )}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              * Všetky polia sú povinné. Potvrdenie vám zašleme e-mailom čoskoro.
            </p>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default Reservation;
