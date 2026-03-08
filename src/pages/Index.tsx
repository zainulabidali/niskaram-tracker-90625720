import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import RankingCard from "@/components/RankingCard";
import { CLASSES } from "@/lib/prayerData";

const Index = () => {
  const [classFilter, setClassFilter] = useState("");

  return (
    <MobileLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="text-center space-y-1 pt-2">
          <h1 className="text-2xl font-display font-bold text-foreground">
            🕌 നിസ്കാരം ട്രാക്കർ
          </h1>
          <p className="text-xs text-muted-foreground">Daily Prayer Tracker</p>
        </div>

        {/* Quick Stats Card */}
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">ഇന്നത്തെ തിയതി</p>
              <p className="text-sm font-bold mt-0.5">
                {new Date().toLocaleDateString('ml-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="text-3xl">☪️</div>
          </div>
        </div>

        {/* Class filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">ഫിൽറ്റർ:</label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-xs focus:ring-2 focus:ring-primary/30 focus:outline-none"
          >
            <option value="">എല്ലാം</option>
            {CLASSES.map(c => <option key={c} value={c}>ക്ലാസ് {c}</option>)}
          </select>
        </div>

        {/* Rankings */}
        <RankingCard title="ഇന്നത്തെ ടോപ്പർ 🏆" days={1} topN={10} classFilter={classFilter || undefined} refreshKey={0} />
        <RankingCard title="ആഴ്ചയിലെ 📅" days={7} topN={5} classFilter={classFilter || undefined} refreshKey={0} />
        <RankingCard title="മാസത്തിലെ 📆" days={30} topN={7} classFilter={classFilter || undefined} refreshKey={0} />

        {/* Footer */}
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
