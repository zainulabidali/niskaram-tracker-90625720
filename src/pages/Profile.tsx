import { useMemo } from "react";
import MobileLayout from "@/components/MobileLayout";
import { getPrayerData, CLASSES } from "@/lib/prayerData";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Calendar, TrendingUp, Award, LogOut } from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();

  const stats = useMemo(() => {
    const data = getPrayerData();
    let totalEntries = 0;
    let totalScore = 0;
    let totalDays = Object.keys(data).length;
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

  return (
    <MobileLayout>
      <div className="space-y-5">
        <h2 className="text-xl font-display font-bold text-foreground text-center pt-2">👤 പ്രൊഫൈൽ</h2>

        {/* User Card */}
        <div className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-lg text-center">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3 text-2xl">
            🕌
          </div>
          <h3 className="font-display text-lg font-bold">നിസ്കാരം ട്രാക്കർ</h3>
          <p className="text-xs opacity-80 mt-1">{user?.email}</p>
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

        {/* Admin */}
        <a href="/admin" className="block text-center py-3 rounded-2xl border border-border bg-card/80 text-sm font-medium text-foreground hover:bg-muted transition-colors">
          🔐 Admin Panel
        </a>

        {/* Logout */}
        <button onClick={logout}
          className="w-full py-3 rounded-2xl border border-destructive text-destructive font-bold text-sm flex items-center justify-center gap-2 hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={16} /> ലോഗ് ഔട്ട്
        </button>

        <div className="text-center text-[10px] text-muted-foreground pt-2">
          <p>Designed by <a href="https://instagram.com/zainul_abid_himami" target="_blank" rel="noreferrer" className="text-accent hover:underline">Zainul Abid Himami</a></p>
          <p className="mt-1">v1.0 · © {new Date().getFullYear()} Zyn</p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Profile;
