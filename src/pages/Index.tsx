import { useState, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import RankingCard from "@/components/RankingCard";
import { getClasses, type ClassData } from "@/lib/firestoreService";
import { GraduationCap, ChevronDown } from "lucide-react";

const Index = () => {
  const [classFilter, setClassFilter] = useState("");
  const [classes, setClasses] = useState<ClassData[]>([]);

  useEffect(() => { getClasses().then(setClasses); }, []);

  return (
    <MobileLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="text-center space-y-1 pt-2">
          <h1 className="text-2xl font-display font-bold text-foreground">🕌 നിസ്കാരം ട്രാക്കർ</h1>
          <p className="text-xs text-muted-foreground">Daily Prayer & Study Tracker</p>
        </div>

        {/* Date Card */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] opacity-70">ഇന്നത്തെ തിയതി</p>
              <p className="text-sm font-bold mt-1">
                {new Date().toLocaleDateString("ml-IN", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
            <div className="text-4xl opacity-80"></div>
          </div>
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-2 px-1">
          <GraduationCap size={14} className="text-muted-foreground" />
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:ring-2 focus:ring-primary/30 focus:outline-none"
          >
            <option value="">എല്ലാ ക്ലാസുകളും</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Rankings */}
        <div className="space-y-4">
          <RankingCard title="ഇന്നത്തെ ടോപ്പർ 🏆" period="daily" topN={6} classFilter={classFilter || undefined} refreshKey={0} />
          <RankingCard title="ആഴ്ചയിലെ 📅" period="weekly" topN={6} classFilter={classFilter || undefined} refreshKey={0} />
          <RankingCard title="മാസത്തിലെ 📆" period="monthly" topN={8} classFilter={classFilter || undefined} refreshKey={0} />
        </div>

        <footer className="text-center py-4 text-[10px] text-muted-foreground">
          © {new Date().getFullYear()} <strong>Zyn</strong> · Designed by{" "}
          <a href="https://instagram.com/zainul_abid_himami" target="_blank" rel="noreferrer" className="text-accent hover:underline">
            Zainul Abid Himami
          </a>
        </footer>
      </div>
    </MobileLayout>
  );
};

export default Index;
