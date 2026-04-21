import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar,
  Clock,
  LogOut,
  Plus,
  Trash2,
  Edit,
  User,
  Scissors,
  Phone,
  Mail,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Sparkles,
  Flame,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  getAdminTimeSlots,
  getAdminReservations,
  createAdminReservation,
  cancelAdminReservation,
  updateTimeSlotStatus,
  deactivateAllTimeSlots,
  type TimeSlotAdmin,
  type ReservationAdmin,
} from "@/lib/api/admin-api";
import {
  getServices,
  getAvailableSlots,
  type Service,
  type AvailableTimeSlotResponse,
} from "@/lib/api";

// Helper: extract HH:mm from a time string (handles both "09:00" and "2026-04-07T09:00:00")
const formatTime = (t: string) => {
  if (t.includes('T')) {
    return t.split('T')[1].substring(0, 5);
  }
  return t.substring(0, 5);
};

// Service color and icon mapping
const SERVICE_CONFIG_LIST: Array<{ match: string; bg: string; border: string; text: string; icon: React.ElementType }> = [
  { match: "exclusive strih & úprava brady", bg: "bg-violet-500/20", border: "border-violet-500/40", text: "text-violet-400", icon: Sparkles },
  { match: "obyčajný strih & úprava brady", bg: "bg-cyan-500/20", border: "border-cyan-500/40", text: "text-cyan-400", icon: Sparkles },
  { match: "exclusive strih", bg: "bg-rose-500/20", border: "border-rose-500/40", text: "text-rose-400", icon: Sparkles },
  { match: "úprava brady", bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-400", icon: Flame },
  { match: "obyčajný strih", bg: "bg-blue-500/20", border: "border-blue-500/40", text: "text-blue-400", icon: Scissors },
];

const getServiceConfig = (name: string) => {
  const lower = name.toLowerCase();
  return SERVICE_CONFIG_LIST.find(c => lower.includes(c.match));
};

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reservations, setReservations] = useState<ReservationAdmin[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotAdmin[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const initialDate = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [weekOffset, setWeekOffset] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(initialDate + "T00:00:00");
    const getMon = (d: Date) => {
      const dd = new Date(d);
      const day = dd.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      dd.setDate(dd.getDate() + diff);
      dd.setHours(0, 0, 0, 0);
      return dd;
    };
    const currentMonday = getMon(today);
    const selectedMonday = getMon(selected);
    return Math.round((selectedMonday.getTime() - currentMonday.getTime()) / (7 * 24 * 60 * 60 * 1000));
  });
  const [activeTab, setActiveTab] = useState<"reservations" | "slots" | "stats">(
    (searchParams.get("tab") as "reservations" | "slots" | "stats") || "reservations"
  );
  const [statsPeriod, setStatsPeriod] = useState<"week" | "month" | "year">("week");
  const [isAddReservationOpen, setIsAddReservationOpen] = useState(false);
  const [newReservation, setNewReservation] = useState({
    date: "",
    time: "",
    serviceId: "",
    note: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });

  // Services & available slots for admin reservation form
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [adminAvailableSlots, setAdminAvailableSlots] = useState<AvailableTimeSlotResponse[]>([]);
  const [isLoadingAvailableSlots, setIsLoadingAvailableSlots] = useState(false);

  const [currentBarberId, setCurrentBarberId] = useState<string>("");
  const [currentBarberName, setCurrentBarberName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const barberId = sessionStorage.getItem("barberId") || "";
    const barberName = sessionStorage.getItem("barberName") || "";
    const admin = sessionStorage.getItem("isAdmin") === "true";

    setCurrentBarberId(barberId);
    setCurrentBarberName(barberName);
    setIsAdmin(admin);
  }, []);

  // Sync state to URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedDate) params.date = selectedDate;
    if (activeTab !== "reservations") params.tab = activeTab;
    setSearchParams(params, { replace: true });
  }, [selectedDate, activeTab, setSearchParams]);

  // Fetch reservations from backend
  const fetchReservations = useCallback(async () => {
    if (!currentBarberId) return;
    setIsLoadingReservations(true);
    try {
      const response = await getAdminReservations(currentBarberId, selectedDate);
      if (response.success && response.data) {
        setReservations(response.data);
      } else {
        setReservations([]);
      }
    } catch {
      setReservations([]);
    } finally {
      setIsLoadingReservations(false);
    }
  }, [currentBarberId, selectedDate]);

  // Fetch time slots from backend
  const fetchTimeSlots = useCallback(async () => {
    if (!currentBarberId) return;
    setIsLoadingSlots(true);
    try {
      const response = await getAdminTimeSlots(currentBarberId, selectedDate);
      if (response.success && response.data) {
        setTimeSlots(response.data);
      } else {
        setTimeSlots([]);
      }
    } catch {
      setTimeSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [currentBarberId, selectedDate]);

  // Fetch data when date or barber changes
  useEffect(() => {
    if (currentBarberId) {
      fetchReservations();
      fetchTimeSlots();
    }
  }, [currentBarberId, selectedDate, fetchReservations, fetchTimeSlots]);

  // Fetch services for admin reservation form
  const fetchServicesForForm = useCallback(async () => {
    setIsLoadingServices(true);
    const response = await getServices();
    if (response.success && response.data) {
      setServices(response.data);
    }
    setIsLoadingServices(false);
  }, []);

  // Fetch available slots when service is selected in admin form
  useEffect(() => {
    if (!currentBarberId || !newReservation.serviceId) {
      setAdminAvailableSlots([]);
      return;
    }
    const fetchSlots = async () => {
      setIsLoadingAvailableSlots(true);
      const response = await getAvailableSlots({
        barberId: currentBarberId,
        serviceId: newReservation.serviceId,
      });
      if (response.success && response.data) {
        setAdminAvailableSlots(response.data);
      } else {
        setAdminAvailableSlots([]);
      }
      setIsLoadingAvailableSlots(false);
    };
    fetchSlots();
  }, [currentBarberId, newReservation.serviceId]);

  // Derive available dates and times for admin form
  const adminAvailableDates = new Set(adminAvailableSlots.map(s => s.date));
  const adminTimesForDate = (() => {
    if (!newReservation.date) return [];
    const dateParts = newReservation.date.split('/');
    if (dateParts.length !== 3) return [];
    const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    return adminAvailableSlots.find(s => s.date === isoDate)?.timeList || [];
  })();

  const handleLogout = () => {
    sessionStorage.clear();
    toast({
      title: "Odhlásenie úspešné",
      description: "Boli ste odhlásení z admin panela.",
    });
    navigate("/admin/login");
  };

  const handleCancelReservation = async (id: number) => {
    const response = await cancelAdminReservation(id);
    if (response.success) {
      toast({
        title: "Rezervácia zrušená",
        description: "Rezervácia bola úspešne zrušená.",
      });
      fetchReservations();
    } else {
      toast({
        title: "Chyba",
        description: response.error?.message || "Nepodarilo sa zrušiť rezerváciu.",
        variant: "destructive",
      });
    }
  };

  const handleAddReservation = async () => {
    if (!newReservation.customerName || !newReservation.serviceId || !newReservation.date || !newReservation.time) {
      toast({
        title: "Chýbajúce údaje",
        description: "Vyplňte meno, službu, dátum a čas.",
        variant: "destructive",
      });
      return;
    }

    // Convert dd/mm/yyyy to ISO date
    const dateParts = newReservation.date.split('/');
    const isoDate = dateParts.length === 3 
      ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
      : newReservation.date;

    // Build ISO datetime: yyyy-mm-ddTHH:mm:00
    const startTime = `${isoDate}T${newReservation.time}:00`;

    const response = await createAdminReservation({
      customerName: newReservation.customerName,
      customerEmail: newReservation.customerEmail || undefined,
      customerPhone: newReservation.customerPhone || undefined,
      barberId: parseInt(currentBarberId),
      serviceId: parseInt(newReservation.serviceId),
      startTime,
      note: newReservation.note || undefined,
    });

    if (response.success) {
      setNewReservation({ date: "", time: "", serviceId: "", note: "", customerName: "", customerEmail: "", customerPhone: "" });
      setIsAddReservationOpen(false);
      toast({
        title: "Rezervácia vytvorená",
        description: "Nová rezervácia bola úspešne pridaná.",
      });
      fetchReservations();
      fetchTimeSlots();
    } else {
      toast({
        title: "Chyba",
        description: response.error?.message || "Nepodarilo sa vytvoriť rezerváciu.",
        variant: "destructive",
      });
    }
  };

  const handleToggleSlotStatus = async (slot: TimeSlotAdmin) => {
    const newStatus = slot.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const response = await updateTimeSlotStatus(slot.id, {
      slotIds: [slot.id],
      status: newStatus,
    });

    if (response.success) {
      toast({
        title: newStatus === 'INACTIVE' ? "Slot odstránený" : "Slot obnovený",
        description: newStatus === 'INACTIVE' 
          ? "Časový slot bol vyhodený z ponuky." 
          : "Časový slot bol vrátený do ponuky.",
      });
      fetchTimeSlots();
    } else {
      toast({
        title: "Chyba",
        description: response.error?.message || "Nepodarilo sa zmeniť stav slotu.",
        variant: "destructive",
      });
    }
  };

  // Generate week dates (Monday-based week)
  const getMondayOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun, 1=Mon, ...
    const diff = day === 0 ? -6 : 1 - day; // Sunday → go back 6 days
    d.setDate(d.getDate() + diff);
    return d;
  };

  const getWeekDates = () => {
    const dates = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + weekOffset * 7);
    const startDate = getMondayOfWeek(baseDate);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const dayNames = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];

  const getBarberName = () => currentBarberName || "Neznámy";

  const getBarberInitials = () => currentBarberName.split(' ').map(n => n[0]).join('');

  const goToPreviousWeek = () => setWeekOffset((prev) => prev - 1);
  const goToNextWeek = () => setWeekOffset((prev) => prev + 1);
  const goToCurrentWeek = () => {
    setWeekOffset(0);
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const handleTabChange = (tab: "reservations" | "slots" | "stats") => {
    setActiveTab(tab);
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    setWeekOffset(0);
  };

  // Filter only active (non-cancelled) reservations for display
  const activeReservations = reservations.filter((r) => r.status !== 'CANCELLED');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
              <AvatarFallback className="bg-accent/10 text-accent text-xs sm:text-sm">
                {getBarberInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-lg truncate">{currentBarberName}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isAdmin ? "Administrátor" : "Holič"}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
            Odhlásiť
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Tab Navigation */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1">
          <Button
            variant={activeTab === "reservations" ? "default" : "outline"}
            onClick={() => handleTabChange("reservations")}
            size="sm"
            className={cn(
              "text-xs sm:text-sm whitespace-nowrap flex-shrink-0",
              activeTab === "reservations" ? "bg-accent text-accent-foreground hover:bg-accent/80" : ""
            )}
          >
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Rezervácie
          </Button>
          <Button
            variant={activeTab === "slots" ? "default" : "outline"}
            onClick={() => handleTabChange("slots")}
            size="sm"
            className={cn(
              "text-xs sm:text-sm whitespace-nowrap flex-shrink-0",
              activeTab === "slots" ? "bg-accent text-accent-foreground hover:bg-accent/80" : ""
            )}
          >
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Časové Sloty
          </Button>
          <Button
            variant={activeTab === "stats" ? "default" : "outline"}
            onClick={() => handleTabChange("stats")}
            size="sm"
            className={cn(
              "text-xs sm:text-sm whitespace-nowrap flex-shrink-0",
              activeTab === "stats" ? "bg-accent text-accent-foreground hover:bg-accent/80" : ""
            )}
          >
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Štatistika
          </Button>
        </div>

        {/* Week Calendar with Navigation */}
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek} className="h-8 w-8 sm:h-9 sm:w-9">
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToCurrentWeek} className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                Dnes
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextWeek} className="h-8 w-8 sm:h-9 sm:w-9">
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="font-semibold gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                  <span className="hidden sm:inline">{new Date(weekDates[0]).toLocaleDateString("sk-SK", { month: "long", year: "numeric" })}</span>
                  <span className="sm:hidden">{new Date(weekDates[0]).toLocaleDateString("sk-SK", { month: "short", year: "2-digit" })}</span>
                  <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={new Date(selectedDate + "T12:00:00")}
                  onSelect={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      const dateStr = `${year}-${month}-${day}`;
                      setSelectedDate(dateStr);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const currentWeekStart = getMondayOfWeek(today);
                      const targetWeekStart = getMondayOfWeek(new Date(date));
                      const diffTime = targetWeekStart.getTime() - currentWeekStart.getTime();
                      const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000));
                      setWeekOffset(diffWeeks);
                    }
                  }}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {weekDates.map((date, index) => {
              const isSelected = date === selectedDate;
              const isToday = date === new Date().toISOString().split("T")[0];

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`p-1.5 sm:p-3 rounded-lg text-center transition-all ${
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : isToday
                      ? "bg-accent/20 border border-accent"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <div className="text-[10px] sm:text-xs font-medium">{dayNames[index]}</div>
                  <div className="text-sm sm:text-lg font-bold">{new Date(date).getDate()}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reservations Tab */}
        {activeTab === "reservations" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              <h2 className="text-base sm:text-xl font-semibold">
                Rezervácie na {new Date(selectedDate).toLocaleDateString("sk-SK")}
              </h2>
              <Dialog open={isAddReservationOpen} onOpenChange={(open) => {
                setIsAddReservationOpen(open);
                if (open) {
                  fetchServicesForForm();
                  const dateParts = selectedDate.split('-');
                  const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
                  setNewReservation(prev => ({ ...prev, date: formattedDate }));
                }
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/80 gap-1 sm:gap-2 text-xs sm:text-sm w-full sm:w-auto" disabled={selectedDate < new Date().toISOString().split("T")[0]}>
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    Nová rezervácia
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">Vytvoriť novú rezerváciu</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 sm:space-y-4">
                    {/* Customer Name - required */}
                    <div>
                      <Label>Meno zákazníka *</Label>
                      <Input
                        value={newReservation.customerName}
                        onChange={(e) => setNewReservation({ ...newReservation, customerName: e.target.value })}
                        placeholder="Celé meno"
                        required
                      />
                    </div>
                    {/* Customer Email & Phone - optional */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label>E-mail</Label>
                        <Input
                          type="email"
                          value={newReservation.customerEmail}
                          onChange={(e) => setNewReservation({ ...newReservation, customerEmail: e.target.value })}
                          placeholder="Voliteľné"
                        />
                      </div>
                      <div>
                        <Label>Telefón</Label>
                        <Input
                          type="tel"
                          value={newReservation.customerPhone}
                          onChange={(e) => setNewReservation({ ...newReservation, customerPhone: e.target.value })}
                          placeholder="Voliteľné"
                        />
                      </div>
                    </div>
                    {/* Service selection - fetched from API */}
                    <div>
                      <Label>Služba *</Label>
                      <Select
                        value={newReservation.serviceId}
                        onValueChange={(value) => setNewReservation({ ...newReservation, serviceId: value, date: "", time: "" })}
                        disabled={isLoadingServices}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingServices ? "Načítavam..." : "Vyberte službu"} />
                        </SelectTrigger>
                        <SelectContent className="bg-card">
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Date & Time - based on available slots */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label>Dátum *</Label>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="dd/mm/yyyy"
                            value={newReservation.date}
                            disabled={!newReservation.serviceId}
                            onChange={(e) => {
                              let value = e.target.value.replace(/[^\d/]/g, '');
                              if (value.length === 2 && !value.includes('/')) {
                                value = value + '/';
                              } else if (value.length === 5 && value.split('/').length === 2) {
                                value = value + '/';
                              }
                              if (value.length <= 10) {
                                setNewReservation({ ...newReservation, date: value, time: "" });
                              }
                            }}
                            className="flex-1"
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="icon" disabled={!newReservation.serviceId}>
                                <CalendarIcon className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <CalendarComponent
                                mode="single"
                                selected={(() => {
                                  const parts = newReservation.date.split('/');
                                  if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                                    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                                  }
                                  return undefined;
                                })()}
                                onSelect={(date) => {
                                  if (date) {
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const year = date.getFullYear();
                                    setNewReservation({ ...newReservation, date: `${day}/${month}/${year}`, time: "" });
                                  }
                                }}
                                disabled={(date) => {
                                  const y = date.getFullYear();
                                  const m = String(date.getMonth() + 1).padStart(2, '0');
                                  const d = String(date.getDate()).padStart(2, '0');
                                  return date < new Date(new Date().toDateString()) || !adminAvailableDates.has(`${y}-${m}-${d}`);
                                }}
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div>
                        <Label>Čas *</Label>
                        <Select
                          value={newReservation.time}
                          onValueChange={(value) => setNewReservation({ ...newReservation, time: value })}
                          disabled={!newReservation.date || adminTimesForDate.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              isLoadingAvailableSlots ? "Načítavam..." :
                              !newReservation.date ? "Najprv vyberte dátum" :
                              adminTimesForDate.length === 0 ? "Žiadne voľné časy" :
                              "Vyberte čas"
                            } />
                          </SelectTrigger>
                          <SelectContent className="bg-card max-h-48">
                            {adminTimesForDate.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Poznámka</Label>
                      <Input
                        value={newReservation.note}
                        onChange={(e) => setNewReservation({ ...newReservation, note: e.target.value })}
                        placeholder="Voliteľná poznámka..."
                      />
                    </div>
                    <Button
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/80"
                      onClick={handleAddReservation}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Vytvoriť rezerváciu
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingReservations ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Načítavam rezervácie...</p>
              </div>
            ) : activeReservations.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Žiadne rezervácie na tento deň</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeReservations
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((reservation) => {
                    const serviceConfig = getServiceConfig(reservation.cutServiceName);
                    const IconComponent = serviceConfig?.icon || Scissors;

                    return (
                      <div
                        key={reservation.id}
                        className={cn(
                          "bg-card border-l-4 rounded-lg p-4",
                          serviceConfig?.border || "border-border",
                          serviceConfig?.bg || ""
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2">
                              <div className={cn(
                                "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                serviceConfig?.bg || "bg-accent/10"
                              )}>
                                <IconComponent className={cn(
                                  "w-4 h-4 sm:w-5 sm:h-5",
                                  serviceConfig?.text || "text-accent"
                                )} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-sm sm:text-base truncate">
                                  {reservation.customerName}
                                </h3>
                                <div className="flex flex-wrap items-center gap-1 sm:gap-3">
                                  <span className="text-sm sm:text-base font-bold text-accent">
                                    {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                                  </span>
                                  <span className={cn(
                                    "text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full truncate max-w-[120px] sm:max-w-none",
                                    serviceConfig?.bg || "bg-accent/20",
                                    serviceConfig?.text || "text-accent"
                                  )}>
                                    {reservation.cutServiceName}
                                  </span>
                                </div>
                                {/* Additional details */}
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                                  {reservation.customerPhone && (
                                    <span className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground">
                                      <Phone className="w-3 h-3" />
                                      {reservation.customerPhone}
                                    </span>
                                  )}
                                  {reservation.customerEmail && (
                                    <span className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground">
                                      <Mail className="w-3 h-3" />
                                      {reservation.customerEmail}
                                    </span>
                                  )}
                                </div>
                                {reservation.note && (
                                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 italic">
                                    📝 {reservation.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8 sm:h-9 sm:w-9"
                              onClick={() => handleCancelReservation(reservation.id)}
                              title="Zrušiť rezerváciu"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Time Slots Tab */}
        {activeTab === "slots" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              <h2 className="text-base sm:text-xl font-semibold">
                Časové sloty na {new Date(selectedDate).toLocaleDateString("sk-SK")}
              </h2>
              <Button
                size="sm"
                className="bg-red-400/80 hover:bg-red-400 text-white gap-1 sm:gap-2 text-xs sm:text-sm w-full sm:w-auto"
                disabled={selectedDate < new Date().toISOString().split("T")[0]}
                onClick={async () => {
                  if (!currentBarberId) return;
                  if (!confirm("Naozaj chcete deaktivovať všetky časové sloty na tento deň?")) return;
                  try {
                    const response = await deactivateAllTimeSlots(currentBarberId, selectedDate);
                    if (response.success) {
                      toast({ title: "Sloty deaktivované", description: "Všetky časové sloty boli deaktivované." });
                      fetchTimeSlots();
                    } else {
                      toast({ title: "Chyba", description: response.error?.message || "Nepodarilo sa deaktivovať sloty.", variant: "destructive" });
                    }
                  } catch {
                    toast({ title: "Chyba", description: "Nepodarilo sa deaktivovať sloty.", variant: "destructive" });
                  }
                }}
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Deaktivovať všetky</span>
                <span className="sm:hidden">Deaktivovať</span>
              </Button>
            </div>

            {isLoadingSlots ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Načítavam sloty...</p>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Žiadne sloty na tento deň</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                  {timeSlots
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((slot) => {
                      const isInactive = slot.status === 'INACTIVE';
                      const isReserved = slot.status === 'RESERVED';

                      return (
                        <div
                          key={slot.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                            isInactive
                              ? "bg-muted/50 border-muted text-muted-foreground line-through"
                              : isReserved
                              ? "bg-destructive/10 border-destructive/30 text-destructive"
                              : "bg-green-500/10 border-green-500/30 text-green-400"
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{formatTime(slot.startTime)}</span>
                          <span className="text-xs">
                            {isInactive ? "Vyhodený" : isReserved ? "Obsadený" : "Voľný"}
                          </span>
                          {!isReserved && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => handleToggleSlotStatus(slot)}
                              title={isInactive ? "Obnoviť slot" : "Vyhodiť slot"}
                            >
                              {isInactive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              <h2 className="text-base sm:text-xl font-semibold">Štatistika služieb</h2>
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant={statsPeriod === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatsPeriod("week")}
                  className={cn(
                    "text-xs sm:text-sm h-8 px-2 sm:px-3",
                    statsPeriod === "week" ? "bg-accent text-accent-foreground hover:bg-accent/80" : ""
                  )}
                >
                  Týždeň
                </Button>
                <Button
                  variant={statsPeriod === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatsPeriod("month")}
                  className={cn(
                    "text-xs sm:text-sm h-8 px-2 sm:px-3",
                    statsPeriod === "month" ? "bg-accent text-accent-foreground hover:bg-accent/80" : ""
                  )}
                >
                  Mesiac
                </Button>
                <Button
                  variant={statsPeriod === "year" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatsPeriod("year")}
                  className={cn(
                    "text-xs sm:text-sm h-8 px-2 sm:px-3",
                    statsPeriod === "year" ? "bg-accent text-accent-foreground hover:bg-accent/80" : ""
                  )}
                >
                  Rok
                </Button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Štatistiky budú dostupné po napojení na backend endpoint.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
