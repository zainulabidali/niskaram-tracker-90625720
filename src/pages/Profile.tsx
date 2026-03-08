import { useState, useMemo } from "react";
import MobileLayout from "@/components/MobileLayout";
import { getPrayerData } from "@/lib/prayerData";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Calendar, TrendingUp, Award, LogOut, Shield, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, login, logout, loading } = useAuth();
  const navigate = useNavigate();

  // Admin login state
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const stats = useMemo(() => {
    const data = getPrayerData();
    let totalEntries = 0;
    let totalScore = 0;
    const totalDays = Object.keys(data).length;
    const uniqueStudents = new Set<string>();

    for (const date in data) {
      for (const name in data[date]) {
        totalEntries++;
        totalScore += data[date][name].score || 0;
        uniqueStudents.add(name);
      }
    }

    return {
      totalDays,
      totalEntries,
      totalScore,
      uniqueStudents: uniqueStudents.size,
      avgScore: totalEntries > 0 ? (totalScore / totalEntries).toFixed(1) : "0",
    };
  }, []);

  const statCards = [
    { icon: Calendar, label: "ദിവസങ്ങൾ", value: stats.totalDays, color: "bg-primary/10 text-primary" },
    { icon: Users, label: "വിദ്യാർത്ഥികൾ", value: stats.uniqueStudents, color: "bg-accent/10 text-accent" },
    { icon: TrendingUp, label: "ശരാശരി", value: `${stats.avgScore}/5`, color: "bg-secondary/10 text-secondary" },
    { icon: Award, label: "ആകെ എൻട്രികൾ", value: stats.totalEntries, color: "bg-primary/10 text-primary" },
  ];

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      setShowLogin(false);
      setEmail("");
      setPassword("");
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MobileLayout>
      <div className="space-y-5">
        <h2 className="text-xl font-display font-bold text-foreground text-center pt-2">👤 പ്രൊഫൈൽ</h2>

        {/* App Card */}
        <div className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-lg text-center">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3 text-2xl">
            🕌
          </div>
          <h3 className="font-display text-lg font-bold">നിസ്കാരം ട്രാക്കർ</h3>
          <p className="text-xs opacity-80 mt-1">Daily Prayer Tracking System</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-xl font-bold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Admin Section */}
        {user ? (
          <>
            <button
              onClick={() => navigate("/admin")}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] transition-all"
            >
              <Shield size={16} /> Admin Panel തുറക്കുക
            </button>
            <button
              onClick={logout}
              className="w-full py-3 rounded-2xl border border-destructive text-destructive font-bold text-sm flex items-center justify-center gap-2 hover:bg-destructive/10 transition-colors"
            >
              <LogOut size={16} /> Admin ലോഗ് ഔട്ട്
            </button>
          </>
        ) : showLogin ? (
          <form onSubmit={handleAdminLogin} className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground text-center flex items-center justify-center gap-2">
              <Shield size={16} className="text-primary" /> Admin Sign In
            </h3>

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">{error}</div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">ഇമെയിൽ</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">പാസ്‌വേഡ്</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                placeholder="••••••"
              />
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg active:scale-[0.97] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              സൈൻ ഇൻ ✨
            </button>

            <button type="button" onClick={() => { setShowLogin(false); setError(""); }}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              റദ്ദാക്കുക
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="w-full py-3 rounded-2xl border border-border bg-card/80 text-sm font-medium text-foreground flex items-center justify-center gap-2 hover:bg-muted transition-colors"
          >
            <Shield size={16} /> 🔐 Admin Sign In
          </button>
        )}

        {/* Footer */}
        <div className="text-center text-[10px] text-muted-foreground pt-2">
          <p>Designed by <a href="https://instagram.com/zainul_abid_himami" target="_blank" rel="noreferrer" className="text-accent hover:underline">Zainul Abid Himami</a></p>
          <p className="mt-1">v1.0 · © {new Date().getFullYear()} Zyn</p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Profile;
