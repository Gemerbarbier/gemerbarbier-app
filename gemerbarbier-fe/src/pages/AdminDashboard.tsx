import { useState, useEffect, useCallback, useRef } from "react";
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
  Inbox,
  RefreshCw,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  getServiceStatistics,
  type TimeSlotAdmin,
  type ReservationAdmin,
  type ServiceStatisticsResponse,
} from "@/lib/api/admin-api";
import {
  getServices,
  type Service,
} from "@/lib/api";

// Helper: extract HH:mm from a time string (handles both "09:00" and "2026-04-07T09:00:00")
const formatTime = (t: string) => {
  if (t.includes('T')) {
    return t.split('T')[1].substring(0, 5);
  }
  return t.substring(0, 5);
};

const ADMIN_SLOT_TIMES: string[] = [];
for (let totalMin = 8 * 60; totalMin < 18 * 60; totalMin += 20) {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  ADMIN_SLOT_TIMES.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
}

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
  const _now = new Date();
  const initialDate = searchParams.get("date") || `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, "0")}-${String(_now.getDate()).padStart(2, "0")}`;
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
  type TabKey = "reservations" | "calendar" | "slots" | "stats" | "emails";
  const [activeTab, setActiveTab] = useState<TabKey>(
    (searchParams.get("tab") as TabKey) || "reservations"
  );
  const [statsPeriod, setStatsPeriod] = useState<"week" | "month" | "year">("week");
  const [statsRefDate, setStatsRefDate] = useState<Date>(new Date());
  const [statistics, setStatistics] = useState<ServiceStatisticsResponse[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Touch swipe refs (more reliable than storing on DOM element properties)
  const reservationsTouchRef = useRef<{ x: number; y: number } | null>(null);
  const calendarTouchRef = useRef<{ x: number; y: number } | null>(null);
  const statsTouchRef = useRef<{ x: number; y: number } | null>(null);

  // ID of reservation to scroll to after navigating from calendar
  const [scrollToReservationId, setScrollToReservationId] = useState<number | null>(null);

  // Calendar tab state
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const [calendarRefDate, setCalendarRefDate] = useState<Date>(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, ReservationAdmin[]>>({});
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);

  // Emails tab state
  type EmailRow = {
    id: string;
    template_name: string;
    recipient_email: string;
    status: string;
    attempts: number;
    last_error: string | null;
    sent_at: string | null;
    created_at: string;
    scheduled_at: string;
    payload: Record<string, unknown>;
  };
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [emailCounts, setEmailCounts] = useState({ total: 0, sent: 0, pending: 0, failed: 0 });
  const [emailTemplates, setEmailTemplates] = useState<string[]>([]);
  const [emailStatusFilter, setEmailStatusFilter] = useState<string>("all");
  const [emailTemplateFilter, setEmailTemplateFilter] = useState<string>("all");
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [emailsError, setEmailsError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailRow | null>(null);
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
  const [adminFormReservations, setAdminFormReservations] = useState<ReservationAdmin[]>([]);
  const [isLoadingAdminFormSlots, setIsLoadingAdminFormSlots] = useState(false);

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

  // Fetch service statistics
  const fetchStatistics = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    try {
      const period = statsPeriod.toUpperCase() as "WEEK" | "MONTH" | "YEAR";
      const y = statsRefDate.getFullYear();
      const m = String(statsRefDate.getMonth() + 1).padStart(2, '0');
      const d = String(statsRefDate.getDate()).padStart(2, '0');
      const response = await getServiceStatistics(period, `${y}-${m}-${d}`, currentBarberId || undefined);
      if (response.success && response.data) {
        setStatistics(response.data);
      } else {
        setStatistics([]);
        setStatsError(response.error?.message || "Nepodarilo sa načítať štatistiky");
      }
    } catch {
      setStatistics([]);
      setStatsError("Nepodarilo sa načítať štatistiky");
    } finally {
      setIsLoadingStats(false);
    }
  }, [statsPeriod, statsRefDate, currentBarberId]);

  useEffect(() => {
    if (activeTab === "stats") {
      fetchStatistics();
    }
  }, [activeTab, fetchStatistics]);

  // Fetch emails
  const fetchEmails = useCallback(async () => {
    setIsLoadingEmails(true);
    setEmailsError(null);
    try {
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const params = new URLSearchParams();
      if (emailStatusFilter !== "all") params.set("status", emailStatusFilter);
      if (emailTemplateFilter !== "all") params.set("template", emailTemplateFilter);
      const res = await fetch(`${projectUrl}/functions/v1/list-emails?${params.toString()}`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Chyba načítania emailov");
      setEmails(json.emails || []);
      setEmailCounts(json.counts || { total: 0, sent: 0, pending: 0, failed: 0 });
      setEmailTemplates(json.templates || []);
    } catch (e) {
      setEmailsError(e instanceof Error ? e.message : "Chyba načítania emailov");
    } finally {
      setIsLoadingEmails(false);
    }
  }, [emailStatusFilter, emailTemplateFilter]);

  useEffect(() => {
    if (activeTab === "emails") {
      fetchEmails();
    }
  }, [activeTab, fetchEmails]);

  // Fetch calendar reservations for the visible range
  const fetchCalendarRange = useCallback(async () => {
    if (!currentBarberId) return;
    setIsLoadingCalendar(true);
    try {
      const dates: string[] = [];
      const ref = new Date(calendarRefDate);
      ref.setHours(0, 0, 0, 0);
      if (calendarView === "week") {
        const d = new Date(ref);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        for (let i = 0; i < 7; i++) {
          const dd = new Date(d);
          dd.setDate(d.getDate() + i);
          dates.push(`${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, "0")}-${String(dd.getDate()).padStart(2, "0")}`);
        }
      } else {
        const year = ref.getFullYear();
        const month = ref.getMonth();
        const first = new Date(year, month, 1);
        const startDay = first.getDay();
        const startDiff = startDay === 0 ? -6 : 1 - startDay;
        const start = new Date(first);
        start.setDate(first.getDate() + startDiff);
        for (let i = 0; i < 42; i++) {
          const dd = new Date(start);
          dd.setDate(start.getDate() + i);
          dates.push(`${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, "0")}-${String(dd.getDate()).padStart(2, "0")}`);
        }
      }
      const results = await Promise.all(
        dates.map((dt) => getAdminReservations(currentBarberId, dt).then((r) => ({ dt, r })))
      );
      const map: Record<string, ReservationAdmin[]> = {};
      for (const { dt, r } of results) {
        map[dt] = r.success && r.data ? r.data.filter((x) => x.status !== "CANCELLED") : [];
      }
      setCalendarData(map);
    } finally {
      setIsLoadingCalendar(false);
    }
  }, [currentBarberId, calendarView, calendarRefDate]);

  useEffect(() => {
    if (activeTab === "calendar") {
      fetchCalendarRange();
    }
  }, [activeTab, fetchCalendarRange]);


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

  // Scroll to reservation after navigating from calendar tab
  useEffect(() => {
    if (scrollToReservationId == null || activeTab !== "reservations") return;
    const el = document.getElementById(`reservation-${scrollToReservationId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setScrollToReservationId(null);
    }
  }, [reservations, scrollToReservationId, activeTab]);

  // Fetch reservations for admin form when date changes — used to filter out occupied times
  useEffect(() => {
    if (!isAddReservationOpen || !currentBarberId) {
      setAdminFormReservations([]);
      return;
    }
    const parts = newReservation.date.split('/');
    if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
      setAdminFormReservations([]);
      return;
    }
    const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    let cancelled = false;
    const fetch = async () => {
      setIsLoadingAdminFormSlots(true);
      setNewReservation(prev => ({ ...prev, time: "" }));
      const response = await getAdminReservations(currentBarberId, isoDate);
      if (!cancelled) {
        setAdminFormReservations(response.success && response.data ? response.data : []);
        setIsLoadingAdminFormSlots(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [newReservation.date, isAddReservationOpen, currentBarberId]);

  // Fetch services for admin reservation form
  const fetchServicesForForm = useCallback(async () => {
    setIsLoadingServices(true);
    const response = await getServices();
    if (response.success && response.data) {
      setServices(response.data);
    }
    setIsLoadingServices(false);
  }, []);

  const availableAdminTimes = (() => {
    const parts = newReservation.date.split('/');
    if (parts.length !== 3 || parts[2].length !== 4) return [];
    const selectedDay = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDay < today) return [];
    const isToday = selectedDay.getTime() === today.getTime();
    const nowMin = isToday ? new Date().getHours() * 60 + new Date().getMinutes() : -1;

    const toMin = (timeStr: string) => {
      const t = timeStr.includes('T') ? timeStr.split('T')[1] : timeStr;
      const [h, m] = t.substring(0, 5).split(':').map(Number);
      return h * 60 + m;
    };

    const occupiedRanges = adminFormReservations
      .filter(r => r.status !== 'CANCELLED')
      .map(r => ({ start: toMin(r.startTime), end: toMin(r.endTime) }));

    return ADMIN_SLOT_TIMES.filter(time => {
      const [h, m] = time.split(':').map(Number);
      const slotMin = h * 60 + m;
      if (isToday && slotMin <= nowMin) return false;
      return !occupiedRanges.some(range => slotMin >= range.start && slotMin < range.end);
    });
  })();

  const handleLogout = () => {
    sessionStorage.clear();
    toast({
      title: "Odhlásenie úspešné",
      description: "Boli ste odhlásení z admin panela.",
    });
    navigate("/admin-dashboard/login");
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
      dates.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const dayNames = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];

  const getBarberInitials = () => currentBarberName.split(' ').map(n => n[0]).join('');

  const goToPreviousWeek = () => setWeekOffset((prev) => prev - 1);
  const goToNextWeek = () => setWeekOffset((prev) => prev + 1);
  const goToCurrentWeek = () => {
    setWeekOffset(0);
    setSelectedDate(localDateStr(new Date()));
  };

  const localDateStr = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate + "T00:00:00");
    next.setDate(next.getDate() + 1);
    setSelectedDate(localDateStr(next));
    const todayMonday = getMondayOfWeek(new Date());
    const nextMonday = getMondayOfWeek(next);
    setWeekOffset(Math.round((nextMonday.getTime() - todayMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  };

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate + "T00:00:00");
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(localDateStr(prev));
    const todayMonday = getMondayOfWeek(new Date());
    const prevMonday = getMondayOfWeek(prev);
    setWeekOffset(Math.round((prevMonday.getTime() - todayMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    const today = localDateStr(new Date());
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
                {isAdmin ? "Administrátor" : "Barber"}
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
            variant={activeTab === "calendar" ? "default" : "outline"}
            onClick={() => handleTabChange("calendar")}
            size="sm"
            className={cn(
              "text-xs sm:text-sm whitespace-nowrap flex-shrink-0",
              activeTab === "calendar" ? "bg-accent text-accent-foreground hover:bg-accent/80" : ""
            )}
          >
            <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Kalendár
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
          <Button
            variant={activeTab === "emails" ? "default" : "outline"}
            onClick={() => handleTabChange("emails")}
            size="sm"
            className={cn(
              "text-xs sm:text-sm whitespace-nowrap flex-shrink-0",
              activeTab === "emails" ? "bg-accent text-accent-foreground hover:bg-accent/80" : ""
            )}
          >
            <Inbox className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Emaily
          </Button>
        </div>

        {/* Week Calendar with Navigation */}
        {activeTab !== "stats" && activeTab !== "emails" && activeTab !== "calendar" && (
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
          <div
            className="grid grid-cols-7 gap-1 sm:gap-2 touch-pan-y select-none"
            onTouchStart={(e) => {
              reservationsTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }}
            onTouchEnd={(e) => {
              if (!reservationsTouchRef.current) return;
              const dx = e.changedTouches[0].clientX - reservationsTouchRef.current.x;
              const dy = e.changedTouches[0].clientY - reservationsTouchRef.current.y;
              reservationsTouchRef.current = null;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0) goToNextWeek();
                else goToPreviousWeek();
              }
            }}
          >
            {weekDates.map((date, index) => {
              const isSelected = date === selectedDate;
              const isToday = date === localDateStr(new Date());

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
        )}



        {/* Reservations Tab */}
        {activeTab === "reservations" && (
          <div
            className="space-y-3 sm:space-y-4 touch-pan-y"
            onTouchStart={(e) => {
              reservationsTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }}
            onTouchEnd={(e) => {
              if (!reservationsTouchRef.current) return;
              const dx = e.changedTouches[0].clientX - reservationsTouchRef.current.x;
              const dy = e.changedTouches[0].clientY - reservationsTouchRef.current.y;
              reservationsTouchRef.current = null;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0) goToNextDay();
                else goToPreviousDay();
              }
            }}
          >
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
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/80 gap-1 sm:gap-2 text-xs sm:text-sm w-full sm:w-auto" disabled={selectedDate < localDateStr(new Date())}>
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
                        onValueChange={(value) => setNewReservation({ ...newReservation, serviceId: value })}
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
                              <Button variant="outline" size="icon">
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
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  return date < today;
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
                          disabled={isLoadingAdminFormSlots || availableAdminTimes.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              isLoadingAdminFormSlots ? "Načítavam..." :
                              availableAdminTimes.length === 0 ? "Žiadne dostupné časy" :
                              "Vyberte čas"
                            } />
                          </SelectTrigger>
                          <SelectContent className="bg-card max-h-60">
                            {availableAdminTimes.map((time) => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
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
                        id={`reservation-${reservation.id}`}
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
                                    <a
                                      href={`tel:${reservation.customerPhone.startsWith("+") ? reservation.customerPhone.replace(/\s+/g, "") : `+${reservation.customerPhone.replace(/\s+/g, "")}`}`}
                                      className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground hover:text-accent transition-colors"
                                    >
                                      <Phone className="w-3 h-3" />
                                      {reservation.customerPhone.startsWith("+") ? reservation.customerPhone : `+${reservation.customerPhone}`}
                                    </a>
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
          <div
            className="space-y-3 sm:space-y-4 touch-pan-y"
            onTouchStart={(e) => {
              reservationsTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }}
            onTouchEnd={(e) => {
              if (!reservationsTouchRef.current) return;
              const dx = e.changedTouches[0].clientX - reservationsTouchRef.current.x;
              const dy = e.changedTouches[0].clientY - reservationsTouchRef.current.y;
              reservationsTouchRef.current = null;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0) goToNextDay();
                else goToPreviousDay();
              }
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              <h2 className="text-base sm:text-xl font-semibold">
                Časové sloty na {new Date(selectedDate).toLocaleDateString("sk-SK")}
              </h2>
              <Button
                size="sm"
                className="bg-red-400/80 hover:bg-red-400 text-white gap-1 sm:gap-2 text-xs sm:text-sm w-full sm:w-auto"
                disabled={selectedDate < localDateStr(new Date())}
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
        {activeTab === "stats" && (() => {
          const formatStatsLabel = () => {
            const d = statsRefDate;
            if (statsPeriod === "year") {
              return String(d.getFullYear());
            }
            if (statsPeriod === "month") {
              return d.toLocaleDateString("sk-SK", { month: "long", year: "numeric" });
            }
            const monday = new Date(d);
            const day = monday.getDay();
            monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day));
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            const fmt = (x: Date) => x.toLocaleDateString("sk-SK", { day: "numeric", month: "short" });
            return `${fmt(monday)} – ${fmt(sunday)} ${sunday.getFullYear()}`;
          };
          const shiftStatsDate = (dir: -1 | 1) => {
            const nd = new Date(statsRefDate);
            if (statsPeriod === "year") nd.setFullYear(nd.getFullYear() + dir);
            else if (statsPeriod === "month") nd.setMonth(nd.getMonth() + dir);
            else nd.setDate(nd.getDate() + 7 * dir);
            setStatsRefDate(nd);
          };
          const totalRevenue = statistics.reduce((s, x) => s + x.revenue, 0);
          const totalCount = statistics.reduce((s, x) => s + x.count, 0);
          return (
          <div
            className="space-y-4 sm:space-y-6 touch-pan-y"
            onTouchStart={(e) => {
              statsTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }}
            onTouchEnd={(e) => {
              if (!statsTouchRef.current) return;
              const dx = e.changedTouches[0].clientX - statsTouchRef.current.x;
              const dy = e.changedTouches[0].clientY - statsTouchRef.current.y;
              statsTouchRef.current = null;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                shiftStatsDate(dx < 0 ? 1 : -1);
              }
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              <h2 className="text-base sm:text-xl font-semibold">Štatistika služieb</h2>
              <div className="flex gap-1 sm:gap-2">
                {(["week", "month", "year"] as const).map((p) => (
                  <Button
                    key={p}
                    variant={statsPeriod === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatsPeriod(p)}
                    className={cn(
                      "text-xs sm:text-sm h-8 px-2 sm:px-3",
                      statsPeriod === p ? "bg-accent text-accent-foreground hover:bg-accent/80" : ""
                    )}
                  >
                    {p === "week" ? "Týždeň" : p === "month" ? "Mesiac" : "Rok"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Period navigator */}
            <div
              className="flex items-center justify-between gap-2 bg-card border border-border rounded-lg px-3 py-2 touch-pan-y select-none"
              onTouchStart={(e) => {
                statsTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
              }}
              onTouchEnd={(e) => {
                if (!statsTouchRef.current) return;
                const dx = e.changedTouches[0].clientX - statsTouchRef.current.x;
                const dy = e.changedTouches[0].clientY - statsTouchRef.current.y;
                statsTouchRef.current = null;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                  shiftStatsDate(dx < 0 ? 1 : -1);
                }
              }}
            >

              <Button variant="outline" size="icon" onClick={() => shiftStatsDate(-1)} className="h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="font-semibold gap-2 text-sm capitalize">
                      <CalendarIcon className="w-4 h-4" />
                      {formatStatsLabel()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3 pointer-events-auto" align="center">
                    {statsPeriod === "year" && (() => {
                      const current = statsRefDate.getFullYear();
                      const start = current - 6;
                      const years = Array.from({ length: 12 }, (_, i) => start + i);
                      return (
                        <div className="grid grid-cols-3 gap-2 w-56">
                          {years.map((y) => (
                            <Button
                              key={y}
                              variant={y === current ? "default" : "outline"}
                              size="sm"
                              className={cn("h-9", y === current && "bg-accent text-accent-foreground hover:bg-accent/80")}
                              onClick={() => {
                                const nd = new Date(statsRefDate);
                                nd.setFullYear(y);
                                setStatsRefDate(nd);
                              }}
                            >
                              {y}
                            </Button>
                          ))}
                        </div>
                      );
                    })()}
                    {statsPeriod === "month" && (() => {
                      const year = statsRefDate.getFullYear();
                      const currentMonth = statsRefDate.getMonth();
                      const months = ["Jan", "Feb", "Mar", "Apr", "Máj", "Jún", "Júl", "Aug", "Sep", "Okt", "Nov", "Dec"];
                      return (
                        <div className="w-56 space-y-3">
                          <div className="flex items-center justify-between">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                              const nd = new Date(statsRefDate); nd.setFullYear(year - 1); setStatsRefDate(nd);
                            }}>
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-semibold">{year}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                              const nd = new Date(statsRefDate); nd.setFullYear(year + 1); setStatsRefDate(nd);
                            }}>
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {months.map((m, idx) => (
                              <Button
                                key={m}
                                variant={idx === currentMonth ? "default" : "outline"}
                                size="sm"
                                className={cn("h-9", idx === currentMonth && "bg-accent text-accent-foreground hover:bg-accent/80")}
                                onClick={() => {
                                  const nd = new Date(statsRefDate);
                                  nd.setDate(1);
                                  nd.setMonth(idx);
                                  setStatsRefDate(nd);
                                }}
                              >
                                {m}
                              </Button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                    {statsPeriod === "week" && (() => {
                      const getMonday = (d: Date) => {
                        const nd = new Date(d);
                        const day = nd.getDay();
                        nd.setDate(nd.getDate() + (day === 0 ? -6 : 1 - day));
                        nd.setHours(0, 0, 0, 0);
                        return nd;
                      };
                      const getWeekNumber = (d: Date) => {
                        const target = new Date(d.valueOf());
                        const dayNr = (d.getDay() + 6) % 7;
                        target.setDate(target.getDate() - dayNr + 3);
                        const firstThursday = new Date(target.getFullYear(), 0, 4);
                        const diff = target.getTime() - firstThursday.getTime();
                        return 1 + Math.round(diff / (7 * 24 * 3600 * 1000));
                      };
                      const year = statsRefDate.getFullYear();
                      const currentMonday = getMonday(statsRefDate).getTime();
                      // Generate all weeks of the year
                      const firstDay = new Date(year, 0, 1);
                      const firstMonday = getMonday(firstDay);
                      const weeks: Date[] = [];
                      const cursor = new Date(firstMonday);
                      while (cursor.getFullYear() <= year) {
                        if (cursor.getFullYear() === year || (cursor.getFullYear() === year - 1 && weeks.length === 0)) {
                          weeks.push(new Date(cursor));
                        }
                        cursor.setDate(cursor.getDate() + 7);
                        if (weeks.length > 53) break;
                      }
                      const fmt = (x: Date) => x.toLocaleDateString("sk-SK", { day: "numeric", month: "numeric" });
                      return (
                        <div className="w-64 space-y-3">
                          <div className="flex items-center justify-between">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                              const nd = new Date(statsRefDate); nd.setFullYear(year - 1); setStatsRefDate(nd);
                            }}>
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-semibold">{year}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                              const nd = new Date(statsRefDate); nd.setFullYear(year + 1); setStatsRefDate(nd);
                            }}>
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                            {weeks.map((monday) => {
                              const sunday = new Date(monday);
                              sunday.setDate(monday.getDate() + 6);
                              const isActive = monday.getTime() === currentMonday;
                              const wn = getWeekNumber(monday);
                              return (
                                <Button
                                  key={monday.toISOString()}
                                  variant={isActive ? "default" : "ghost"}
                                  size="sm"
                                  className={cn(
                                    "w-full justify-between h-8 text-xs",
                                    isActive && "bg-accent text-accent-foreground hover:bg-accent/80"
                                  )}
                                  onClick={() => setStatsRefDate(new Date(monday))}
                                >
                                  <span className="font-medium">T{wn}</span>
                                  <span className="text-muted-foreground">{fmt(monday)} – {fmt(sunday)}</span>
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </PopoverContent>
                </Popover>

                <Button variant="outline" size="sm" onClick={() => setStatsRefDate(new Date())} className="text-xs h-8 px-2">
                  Dnes
                </Button>
              </div>
              <Button variant="outline" size="icon" onClick={() => shiftStatsDate(1)} className="h-8 w-8">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : statsError ? (
                <p className="text-center text-sm text-destructive">{statsError}</p>
              ) : statistics.length === 0 ? (
                <p className="text-center text-xs sm:text-sm text-muted-foreground">
                  Pre zvolené obdobie nie sú žiadne údaje.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="bg-muted/30 rounded-md p-3">
                      <p className="text-xs text-muted-foreground">Rezervácie</p>
                      <p className="text-lg sm:text-2xl font-semibold">{totalCount}</p>
                    </div>
                    <div className="rounded-md p-3 bg-accent/10 border border-accent/30">
                      <p className="text-xs text-accent/80 font-medium uppercase tracking-wide">Tržby</p>
                      <p className="text-xl sm:text-3xl font-bold text-accent">
                        {totalRevenue} €
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-muted-foreground">
                          <th className="py-2 pr-2 font-medium">Služba</th>
                          <th className="py-2 px-2 font-medium text-right">Počet</th>
                          <th className="py-2 pl-2 font-medium text-right">Tržby</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...statistics]
                          .sort((a, b) => b.revenue - a.revenue)
                          .map((s) => (
                            <tr key={s.serviceName} className="border-b border-border/50 last:border-0">
                              <td className="py-2 pr-2">{s.serviceName}</td>
                              <td className="py-2 px-2 text-right">{s.count}</td>
                              <td className="py-2 pl-2 text-right font-semibold text-accent">{s.revenue} €</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>


          </div>
          );
        })()}

        {activeTab === "calendar" && (() => {
          const ref = new Date(calendarRefDate);
          ref.setHours(0, 0, 0, 0);
          const monthNames = ["Január","Február","Marec","Apríl","Máj","Jún","Júl","August","September","Október","November","December"];
          const dayShort = ["Po","Ut","St","Št","Pi","So","Ne"];
          const todayStr = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();

          // Build displayed dates
          const dates: string[] = [];
          if (calendarView === "week") {
            const d = new Date(ref);
            const day = d.getDay();
            const diff = day === 0 ? -6 : 1 - day;
            d.setDate(d.getDate() + diff);
            for (let i = 0; i < 7; i++) {
              const dd = new Date(d); dd.setDate(d.getDate() + i);
              dates.push(`${dd.getFullYear()}-${String(dd.getMonth()+1).padStart(2,"0")}-${String(dd.getDate()).padStart(2,"0")}`);
            }
          } else {
            const first = new Date(ref.getFullYear(), ref.getMonth(), 1);
            const startDay = first.getDay();
            const startDiff = startDay === 0 ? -6 : 1 - startDay;
            const start = new Date(first); start.setDate(first.getDate() + startDiff);
            for (let i = 0; i < 42; i++) {
              const dd = new Date(start); dd.setDate(start.getDate() + i);
              dates.push(`${dd.getFullYear()}-${String(dd.getMonth()+1).padStart(2,"0")}-${String(dd.getDate()).padStart(2,"0")}`);
            }
          }

          let headerLabel = '';
          if (calendarView === "week") {
            const first = new Date(dates[0] + "T00:00:00");
            const last = new Date(dates[6] + "T00:00:00");
            headerLabel = `${first.getDate()}.${first.getMonth()+1}. – ${last.getDate()}.${last.getMonth()+1}.${last.getFullYear()}`;
          } else {
            headerLabel = `${monthNames[ref.getMonth()]} ${ref.getFullYear()}`;
          }

          const shift = (dir: number) => {
            const nd = new Date(calendarRefDate);
            if (calendarView === "week") nd.setDate(nd.getDate() + 7 * dir);
            else nd.setMonth(nd.getMonth() + dir);
            setCalendarRefDate(nd);
          };

          const totalCount = Object.values(calendarData).reduce((s, arr) => s + arr.length, 0);

          return (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-xl font-semibold">Kalendár rezervácií</h2>
                  <span className="text-xs sm:text-sm text-muted-foreground">({totalCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  {(["week","month"] as const).map((v) => (
                    <Button
                      key={v}
                      size="sm"
                      variant={calendarView === v ? "default" : "outline"}
                      onClick={() => setCalendarView(v)}
                      className={cn("text-xs sm:text-sm", calendarView === v ? "bg-accent text-accent-foreground hover:bg-accent/80" : "")}
                    >
                      {v === "week" ? "Týždeň" : "Mesiac"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Nav */}
              <div className="flex items-center justify-between gap-2 bg-card border border-border rounded-lg p-2 sm:p-3">
                <Button variant="outline" size="icon" onClick={() => shift(-1)} className="h-8 w-8 sm:h-9 sm:w-9">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm sm:text-base">{headerLabel}</span>
                  <Button variant="outline" size="sm" onClick={() => setCalendarRefDate(new Date())} className="text-xs">
                    Dnes
                  </Button>
                </div>
                <Button variant="outline" size="icon" onClick={() => shift(1)} className="h-8 w-8 sm:h-9 sm:w-9">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div
                className="touch-pan-y select-none"
                onTouchStart={(e) => {
                  calendarTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                }}
                onTouchEnd={(e) => {
                  if (!calendarTouchRef.current) return;
                  const dx = e.changedTouches[0].clientX - calendarTouchRef.current.x;
                  const dy = e.changedTouches[0].clientY - calendarTouchRef.current.y;
                  calendarTouchRef.current = null;
                  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                    shift(dx < 0 ? 1 : -1);
                  }
                }}
              >
              {isLoadingCalendar ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : calendarView === "week" ? (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-2 sm:gap-3">
                  {dates.map((dt, i) => {
                    const list = (calendarData[dt] || []).slice().sort((a, b) => a.startTime.localeCompare(b.startTime));
                    const d = new Date(dt + "T00:00:00");
                    const isToday = dt === todayStr;
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    return (
                      <div
                        key={dt}
                        className={cn(
                          "bg-card border rounded-lg p-2 sm:p-3 min-h-[140px] flex flex-col",
                          isToday ? "border-accent" : "border-border",
                          isWeekend && !isToday ? "opacity-70" : ""
                        )}
                      >
                        <div className="flex items-baseline justify-between mb-2 pb-2 border-b border-border">
                          <div>
                            <div className="text-[10px] sm:text-xs uppercase text-muted-foreground">{dayShort[i]}</div>
                            <div className={cn("text-base sm:text-lg font-bold", isToday ? "text-accent" : "")}>{d.getDate()}.{d.getMonth()+1}.</div>
                          </div>
                          <span className="text-xs text-muted-foreground">{list.length}</span>
                        </div>
                        <div className="space-y-1.5 flex-1">
                          {list.length === 0 ? (
                            <p className="text-[11px] text-muted-foreground italic">Bez rezervácií</p>
                          ) : (
                            list.map((r) => {
                              const cfg = getServiceConfig(r.cutServiceName);
                              return (
                                <button
                                  key={r.id}
                                  onClick={() => {
                                    setSelectedDate(dt);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const targetMonday = getMondayOfWeek(new Date(dt + "T00:00:00"));
                                    const todayMonday = getMondayOfWeek(today);
                                    setWeekOffset(Math.round((targetMonday.getTime() - todayMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)));
                                    setScrollToReservationId(r.id);
                                    setActiveTab("reservations");
                                  }}
                                  className={cn(
                                    "w-full text-left rounded px-2 py-1.5 border transition-colors",
                                    cfg ? `${cfg.bg} ${cfg.border} hover:brightness-110` : "bg-muted/40 border-border hover:bg-muted/60"
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className={cn("text-xs font-semibold", cfg?.text)}>{formatTime(r.startTime)}</span>
                                    <span className="text-[10px] text-muted-foreground truncate max-w-[70px]">{r.customerName}</span>
                                  </div>
                                  <div className="text-[10px] text-foreground/70 truncate mt-0.5">{r.cutServiceName}</div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-2 sm:p-3">
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {dayShort.map((d) => (
                      <div key={d} className="text-center text-[10px] sm:text-xs uppercase text-muted-foreground py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {dates.map((dt) => {
                      const d = new Date(dt + "T00:00:00");
                      const list = (calendarData[dt] || []).slice().sort((a, b) => a.startTime.localeCompare(b.startTime));
                      const inMonth = d.getMonth() === ref.getMonth();
                      const isToday = dt === todayStr;
                      return (
                        <button
                          key={dt}
                          onClick={() => {
                            setSelectedDate(dt);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const targetMonday = getMondayOfWeek(new Date(dt + "T00:00:00"));
                            const todayMonday = getMondayOfWeek(today);
                            setWeekOffset(Math.round((targetMonday.getTime() - todayMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)));
                            setActiveTab("reservations");
                          }}
                          className={cn(
                            "min-h-[80px] sm:min-h-[110px] text-left rounded border p-1.5 flex flex-col gap-1 transition-colors",
                            isToday ? "border-accent" : "border-border",
                            inMonth ? "bg-background hover:bg-muted/40" : "bg-muted/20 opacity-50 hover:opacity-80"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className={cn("text-xs font-bold", isToday ? "text-accent" : "")}>{d.getDate()}</span>
                            {list.length > 0 && (
                              <span className="text-[10px] px-1.5 rounded-full bg-accent/20 text-accent">{list.length}</span>
                            )}
                          </div>
                          <div className="space-y-0.5 flex-1 overflow-hidden">
                            {list.slice(0, 3).map((r) => {
                              const cfg = getServiceConfig(r.cutServiceName);
                              return (
                                <div
                                  key={r.id}
                                  className={cn(
                                    "text-[9px] sm:text-[10px] rounded px-1 py-0.5 truncate border",
                                    cfg ? `${cfg.bg} ${cfg.border} ${cfg.text}` : "bg-muted/40 border-border"
                                  )}
                                >
                                  {formatTime(r.startTime)} {r.customerName}
                                </div>
                              );
                            })}
                            {list.length > 3 && (
                              <div className="text-[9px] text-muted-foreground">+{list.length - 3}</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              </div>
            </div>

          );
        })()}


        {activeTab === "emails" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              {[
                { label: "Spolu", value: emailCounts.total, color: "text-foreground" },
                { label: "Odoslané", value: emailCounts.sent, color: "text-emerald-400" },
                { label: "Čaká", value: emailCounts.pending, color: "text-amber-400" },
                { label: "Zlyhalo", value: emailCounts.failed, color: "text-red-400" },
              ].map((c) => (
                <div key={c.label} className="bg-card border border-border rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">{c.label}</p>
                  <p className={cn("text-xl sm:text-3xl font-bold mt-1", c.color)}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4 flex flex-wrap gap-2 sm:gap-3 items-end">
              <div className="flex-1 min-w-[140px]">
                <Label className="text-xs">Stav</Label>
                <Select value={emailStatusFilter} onValueChange={setEmailStatusFilter}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všetky</SelectItem>
                    <SelectItem value="sent">Odoslané</SelectItem>
                    <SelectItem value="pending">Čakajúce</SelectItem>
                    <SelectItem value="failed">Zlyhané</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <Label className="text-xs">Šablóna</Label>
                <Select value={emailTemplateFilter} onValueChange={setEmailTemplateFilter}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všetky</SelectItem>
                    {emailTemplates.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={fetchEmails} disabled={isLoadingEmails} className="h-9">
                <RefreshCw className={cn("w-4 h-4 mr-2", isLoadingEmails && "animate-spin")} />
                Obnoviť
              </Button>
            </div>

            {/* List */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {isLoadingEmails ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : emailsError ? (
                <div className="p-6 text-center text-sm text-red-400">{emailsError}</div>
              ) : emails.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Žiadne emaily</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="text-left p-2 sm:p-3 font-medium">Stav</th>
                        <th className="text-left p-2 sm:p-3 font-medium">Príjemca</th>
                        <th className="text-left p-2 sm:p-3 font-medium hidden sm:table-cell">Šablóna</th>
                        <th className="text-left p-2 sm:p-3 font-medium">Vytvorené</th>
                        <th className="text-left p-2 sm:p-3 font-medium">Odoslané</th>
                        <th className="p-2 sm:p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {emails.map((e) => {
                        const isPendingReminder =
                          e.status === "pending" && e.template_name === "reservation_reminder";
                        const statusStyle =
                          e.status === "sent" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                          e.status === "failed" ? "bg-red-500/15 text-red-400 border-red-500/30" :
                          "bg-amber-500/15 text-amber-400 border-amber-500/30";
                        const fmt = (iso: string) => new Date(iso).toLocaleString("sk-SK", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                          timeZone: "Europe/Bratislava",
                        });
                        const createdCell = fmt(e.created_at);
                        let sentCell: React.ReactNode = "—";
                        if (e.status === "sent" && e.sent_at) {
                          sentCell = fmt(e.sent_at);
                        } else if (e.status === "pending" && e.scheduled_at) {
                          sentCell = (
                            <span className="text-amber-400">Bude: {fmt(e.scheduled_at)}</span>
                          );
                        } else if (e.status === "failed") {
                          sentCell = <span className="text-red-400">Zlyhalo</span>;
                        }
                        return (
                          <tr
                            key={e.id}
                            className={cn(
                              "border-t border-border hover:bg-muted/20",
                              isPendingReminder && "bg-amber-500/5",
                            )}
                          >
                            <td className="p-2 sm:p-3">
                              <span className={cn("px-2 py-0.5 rounded text-[10px] sm:text-xs border", statusStyle)}>
                                {e.status}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 break-all max-w-[160px] sm:max-w-none">{e.recipient_email}</td>
                            <td className="p-2 sm:p-3 hidden sm:table-cell text-muted-foreground">{e.template_name}</td>
                            <td className="p-2 sm:p-3 text-muted-foreground whitespace-nowrap">{createdCell}</td>
                            <td className="p-2 sm:p-3 whitespace-nowrap">{sentCell}</td>
                            <td className="p-2 sm:p-3 text-right">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(e)} className="h-7 text-xs">
                                Detail
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                </div>
              )}
            </div>
          </div>
        )}

        <Dialog open={!!selectedEmail} onOpenChange={(o) => !o && setSelectedEmail(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail emailu</DialogTitle>
            </DialogHeader>
            {selectedEmail && (
              <div className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">Stav:</span> {selectedEmail.status}</div>
                <div><span className="text-muted-foreground">Príjemca:</span> {selectedEmail.recipient_email}</div>
                <div><span className="text-muted-foreground">Šablóna:</span> {selectedEmail.template_name}</div>
                <div><span className="text-muted-foreground">Pokusy:</span> {selectedEmail.attempts}</div>
                <div><span className="text-muted-foreground">Vytvorené:</span> {new Date(selectedEmail.created_at).toLocaleString("sk-SK")}</div>
                {selectedEmail.sent_at && (
                  <div><span className="text-muted-foreground">Odoslané:</span> {new Date(selectedEmail.sent_at).toLocaleString("sk-SK")}</div>
                )}
                {selectedEmail.last_error && (
                  <div className="text-red-400">
                    <div className="text-muted-foreground mb-1">Chyba:</div>
                    <pre className="bg-muted/40 p-2 rounded text-xs whitespace-pre-wrap">{selectedEmail.last_error}</pre>
                  </div>
                )}
                <div>
                  <div className="text-muted-foreground mb-1">Payload:</div>
                  <pre className="bg-muted/40 p-2 rounded text-xs whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(selectedEmail.payload, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminDashboard;
