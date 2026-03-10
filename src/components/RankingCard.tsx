import { useEffect, useState } from "react";
import { getLeaderboard, getDateRangeForPeriod, type LeaderEntry } from "@/lib/firestoreService";
import { Sparkles } from "lucide-react";

type RankingProps = {
  title: string;
  period: "daily" | "weekly" | "monthly";
  topN: number;
  classFilter?: string;
  refreshKey: number;
};

const ICONS = ["🏆", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];

const RankingCard = ({ title, period, topN, classFilter, refreshKey }: RankingProps) => {
  const [performers, setPerformers] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const { start, end } = getDateRangeForPeriod(period);
    getLeaderboard(start, end, topN, classFilter).then(data => {
      setPerformers(data);
      setLoading(false);
    });
  }, [period, topN, classFilter, refreshKey]);

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-4 shadow-sm">
      <h3 className="font-display text-base font-bold text-accent mb-3">{title}</h3>
      {loading ? (
        <p className="text-muted-foreground text-xs animate-pulse">ലോഡ് ചെയ്യുന്നു...</p>
      ) : performers.length === 0 ? (
        <p className="text-muted-foreground text-xs">ഡാറ്റ ഇല്ല</p>
      ) : (
        <ul className="space-y-1.5">
          {performers.map((p, i) => (
            <li key={p.studentId} className="flex items-center justify-between rounded-xl px-3 py-2 bg-muted/50">
              <span className="text-xs font-medium">{ICONS[i] || "🔹"} {p.studentName}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                  {p.totalScore} pt
                </span>
                {p.totalSalawat > 0 && (
                  <span className="text-[10px] font-bold text-salawat bg-salawat/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Sparkles size={8} /> {p.totalSalawat}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RankingCard;
