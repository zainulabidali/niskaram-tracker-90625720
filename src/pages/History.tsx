import { useState, useEffect, useMemo } from "react";
import MobileLayout from "@/components/MobileLayout";
import { getPrayerData, PRAYERS, CLASSES, type PrayerEntry } from "@/lib/prayerData";
import { Sunrise, Sun, CloudSun, Sunset, Moon, Filter } from "lucide-react";

const PRAYER_ICONS = [Sunrise, Sun, CloudSun, Sunset, Moon];

const History = () => {
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
    return result.sort((a, b) => b.dateKey.localeCompare(a.dateKey) || a.name.localeCompare(b.name));
  }, [data, classFilter]);

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, typeof entries> = {};
    entries.forEach(e => {
      if (!map[e.dateKey]) map[e.dateKey] = [];
      map[e.dateKey].push(e);
    });
    return map;
  }, [entries]);

  return (
    <MobileLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-foreground text-center pt-2">
          📜 ഹിസ്റ്ററി
        </h2>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-xs focus:ring-2 focus:ring-primary/30 focus:outline-none"
          >
            <option value="">എല്ലാ ക്ലാസുകളും</option>
            {CLASSES.map(c => <option key={c} value={c}>ക്ലാസ് {c}</option>)}
          </select>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">ഡാറ്റ ഇല്ല</div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">{date}</h3>
              {items.map(e => (
                <div key={`${e.dateKey}-${e.name}`} className="rounded-2xl border border-border bg-card/80 p-3.5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{e.name}</p>
                      <p className="text-[10px] text-muted-foreground">ക്ലാസ് {e.class}</p>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      {e.score}/5
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {PRAYERS.map((p, i) => {
                      const Icon = PRAYER_ICONS[i];
                      const done = !!e[p.id as keyof PrayerEntry];
                      return (
                        <div key={p.id} className={`flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl text-[9px] ${
                          done ? "text-primary bg-primary/10" : "text-muted-foreground/40"
                        }`}>
                          <Icon size={14} />
                          <span>{p.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </MobileLayout>
  );
};

export default History;
