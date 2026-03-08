import { useEffect, useState } from "react";
import { getTopPerformers } from "@/lib/prayerData";

type RankingProps = {
  title: string;
  days: number;
  topN: number;
  classFilter?: string;
  refreshKey: number;
};

const ICONS = ["🏆", "🥈", "🥉"];

const RankingCard = ({ title, days, topN, classFilter, refreshKey }: RankingProps) => {
  const [performers, setPerformers] = useState<{ name: string; score: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTopPerformers(days, topN, classFilter).then(data => {
      setPerformers(data);
      setLoading(false);
    });
  }, [days, topN, classFilter, refreshKey]);

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
            <li
              key={p.name}
              className="flex items-center justify-between rounded-xl px-3 py-2 bg-muted/50"
            >
              <span className="text-xs font-medium">
                {ICONS[i] || "🔹"} {p.name}
              </span>
              <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                {p.score} മാർക്ക്
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RankingCard;
