import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, User, Scissors, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api/auth-api";
import { setAccessToken, setRefreshToken } from "@/lib/auth";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to /admin-dashboard if already logged in
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("adminDemo");
    if (isLoggedIn) {
      navigate("/admin-dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await authApi.login({ username: email, password });

    if (response.success && response.data) {
      setAccessToken(response.data.accessToken, response.data.expiresIn);
      if (response.data.refreshToken) {
        setRefreshToken(response.data.refreshToken);
      }

      const user = response.data.user;
      sessionStorage.setItem("adminDemo", "true");
      if (user) {
        sessionStorage.setItem("barberId", String(user.id));
        sessionStorage.setItem("barberName", user.name || user.username);
        sessionStorage.setItem("isAdmin", "true");
      }

      toast({
        title: "Prihlásenie úspešné",
        description: `Vitajte, ${user?.name || user?.username || ""}!`,
      });
      navigate("/admin-dashboard");
    } else {
      toast({
        title: "Neplatné prihlasovacie údaje",
        description: response.error?.message || "Skontrolujte email a heslo.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
            <Scissors className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">Prihláste sa pre správu rezervácií</p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vas@email.sk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Prihlasujem...
                </>
              ) : (
                "Prihlásiť sa"
              )}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground text-center">
              Prístup majú iba registrovaní používatelia.
              <br />
              Kontaktujte administrátora pre vytvorenie účtu.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Späť na hlavnú stránku
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
