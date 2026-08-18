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
  const [phoneTouched, setPhoneTouched] = useState(false);

  // formData.phone holds only the national number (after the fixed +421 prefix), grouped as
  // "9xx xxx xxx" for readability.
  const isPhoneValid = /^9\d{8}$/.test(formData.phone.replace(/\s/g, ""));
  const showPhoneError = phoneTouched && formData.phone.length > 0 && !isPhoneValid;

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
          description: "Nepodarilo sa načítať barberov",
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

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const rawTimesForSelectedDate = formData.date
    ? availableSlots.find(s => s.date === format(formData.date!, "yyyy-MM-dd"))?.timeList || []
    : [];

  const timesForSelectedDate = formData.date && isToday(formData.date)
    ? rawTimesForSelectedDate.filter(time => time > currentTimeStr)
    : rawTimesForSelectedDate;

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

    if (!isPhoneValid) {
      setPhoneTouched(true);
      toast({
        title: "Neplatné telefónne číslo",
        description: "Zadajte platné slovenské mobilné číslo v tvare 9xx xxx xxx.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const startTime = `${format(formData.date, "yyyy-MM-dd")}T${formData.time}:00`;

    const response = await createReservation({
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: `+421 ${formData.phone}`,
      barberId: parseInt(formData.barberId),
      serviceId: parseInt(formData.serviceId),
      startTime,
      ...(formData.note ? { note: formData.note } : {}),
    });

    if (response.success) {
      // The backend sends the confirmation e-mail itself, once the reservation has committed.
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
      setPhoneTouched(false);
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, "");

    // A customer typing the full domestic form (e.g. "0940 123 456") shouldn't have to also
    // delete the leading 0 themselves — the +421 prefix is already shown beside the field.
    if (digits.startsWith("0")) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 9);

    const grouped = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)]
      .filter(Boolean)
      .join(" ");

    setPhoneTouched(true);
    setFormData({ ...formData, phone: grouped });
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
                  minLength={2}
                  maxLength={100}
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
                  maxLength={254}
                  className="bg-background border-border focus:border-accent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefónne Číslo *</Label>
              {showPhoneError && (
                <p className="text-sm font-medium text-destructive">
                  Zadajte platné slovenské mobilné číslo v tvare 9xx xxx xxx.
                </p>
              )}
              <div className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-10 select-none items-center rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground"
                >
                  +421
                </span>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="9xx xxx xxx"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onBlur={() => setPhoneTouched(true)}
                  required
                  aria-invalid={showPhoneError}
                  className={cn(
                    "bg-background border-border focus:border-accent",
                    showPhoneError && "border-destructive focus:border-destructive"
                  )}
                />
              </div>
            </div>

            {/* Barber Selection */}
            <div className="space-y-2">
              <Label htmlFor="barberId">Vyberte Barbera *</Label>
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
                  {isLoadingBarbers ? "Načítavam..." : "Vyberte barbera..."}
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
                    ? "Najprv vyberte barbera" 
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

            {/* No availability message */}
            {formData.barberId && formData.serviceId && !isLoadingSlots && availableSlots.length === 0 && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive space-y-2">
                <p>Pre vybraného barbera a službu sú momentálne všetky termíny obsadené. Skúste prosím iného barbera alebo inú službu.</p>
                <p className="font-medium">Nové termíny sa otvárajú v nedeľu o 22:00.</p>
              </div>
            )}

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
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today || date.getDay() === 0 || !availableDates.has(dateStr);
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
                maxLength={255}
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
