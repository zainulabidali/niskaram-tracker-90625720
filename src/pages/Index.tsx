import { useState } from "react";
import PrayerForm from "@/components/PrayerForm";
import RankingCard from "@/components/RankingCard";
import { CLASSES } from "@/lib/prayerData";
import { Link } from "react-router-dom";

const Index = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [classFilter, setClassFilter] = useState("");

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-green-deep/20 via-background to-background" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23926f1a' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">
            🕌 Daily Prayer Tracker
          </h1>
          <p className="text-muted-foreground text-sm">നിസ്കാരം ട്രാക്കർ</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-3">
          <Link
            to="/history"
            className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            ഹിസ്റ്ററി 📊
          </Link>
          <Link
            to="/admin"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Admin 🔐
          </Link>
        </div>

        {/* Prayer Form Card */}
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg">
          <PrayerForm onSubmit={() => setRefreshKey(k => k + 1)} />
        </div>

        {/* Class filter for rankings */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground">ക്ലാസ് ഫിൽറ്റർ:</label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-input/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
          >
            <option value="">എല്ലാം</option>
            {CLASSES.map(c => <option key={c} value={c}>ക്ലാസ് {c}</option>)}
          </select>
        </div>

        {/* Rankings */}
        <RankingCard title="ഇന്നത്തെ ടോപ്പർ 🏆" days={1} topN={10} classFilter={classFilter || undefined} refreshKey={refreshKey} />
        <RankingCard title="കഴിഞ്ഞ ആഴ്ചയിലെ 📅" days={7} topN={5} classFilter={classFilter || undefined} refreshKey={refreshKey} />
        <RankingCard title="കഴിഞ്ഞ മാസം 📆" days={30} topN={7} classFilter={classFilter || undefined} refreshKey={refreshKey} />

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} <strong>Zyn</strong>. All Rights Reserved.
          <br />
          Designed by{" "}
          <a href="https://instagram.com/zainul_abid_himami" target="_blank" rel="noreferrer" className="text-accent hover:underline">
            Zainul Abid Himami
          </a>
        </footer>
      </div>
    </div>
  );
};

export default Index;
