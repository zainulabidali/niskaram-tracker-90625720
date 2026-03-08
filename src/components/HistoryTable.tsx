import { useState, useEffect, useMemo } from "react";
import { getPrayerData, PRAYERS, CLASSES, type PrayerEntry } from "@/lib/prayerData";

const HistoryTable = () => {
  const [data, setData] = useState<Record<string, Record<string, PrayerEntry>>>({});
  const [classFilter, setClassFilter] = useState("");

  useEffect(() => setData(getPrayerData()), []);

  const entries = useMemo(() => {
    const result: (PrayerEntry & { dateKey: string })[] = [];
    for (const date in data) {
      for (const name in data[date]) {
        const entry = data[date][name];
        if (classFilter && entry.class !== classFilter) continue;
        result.push({ ...entry, dateKey: date });
      }
    }
    return result.sort((a, b) => {
      const dateComp = b.dateKey.localeCompare(a.dateKey);
      return dateComp !== 0 ? dateComp : a.name.localeCompare(b.name);
    });
  }, [data, classFilter]);

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-display font-bold text-foreground">
        📜 പ്രാർഥനാ ഹിസ്റ്ററി
      </h2>

      <div>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-input/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
        >
          <option value="">എല്ലാ ക്ലാസുകളും</option>
          {CLASSES.map(c => <option key={c} value={c}>ക്ലാസ് {c}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-muted/70">
              <th className="px-3 py-2 text-left">തിയതി</th>
              <th className="px-3 py-2 text-left">പേര്</th>
              <th className="px-3 py-2">ക്ലാസ്</th>
              {PRAYERS.map(p => (
                <th key={p.id} className="px-3 py-2">{p.label}</th>
              ))}
              <th className="px-3 py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={`${e.dateKey}-${e.name}`} className={i % 2 === 0 ? "bg-card/50" : "bg-muted/30"}>
                <td className="px-3 py-2">{e.dateKey}</td>
                <td className="px-3 py-2 font-medium">{e.name}</td>
                <td className="px-3 py-2 text-center">{e.class}</td>
                {PRAYERS.map(p => (
                  <td key={p.id} className="px-3 py-2 text-center">
                    {e[p.id as keyof PrayerEntry] ? "✅" : "⬜"}
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-bold text-accent">{e.score}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">ഡാറ്റ ഇല്ല</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
