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

  useEffect(() => {
    setPerformers(getTopPerformers(days, topN, classFilter));
  }, [days, topN, classFilter, refreshKey]);

  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-5 shadow-sm">
      <h3 className="font-display text-lg font-bold text-accent mb-3">{title}</h3>
      {performers.length === 0 ? (
        <p className="text-muted-foreground text-sm">ഡാറ്റ ഇല്ല</p>
      ) : (
        <ul className="space-y-2">
          {performers.map((p, i) => (
            <li
              key={p.name}
              className="flex items-center justify-between rounded-lg px-3 py-2 bg-muted/50"
            >
              <span className="text-sm font-medium">
                {ICONS[i] || "🔹"} {p.name}
              </span>
              <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-full">
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
