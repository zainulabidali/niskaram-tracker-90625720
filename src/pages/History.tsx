import { useState, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import { getRecordsByDateRange, getClasses, PRAYERS, getTodayStr, type DailyRecord, type ClassData } from "@/lib/firestoreService";
import { Sunrise, Sun, CloudSun, Sunset, Moon, Filter, Loader2 } from "lucide-react";

const PRAYER_ICONS = [Sunrise, Sun, CloudSun, Sunset, Moon];

const History = () => {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [classFilter, setClassFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { getClasses().then(setClasses); }, []);

  useEffect(() => {
    setLoading(true);
    const end = getTodayStr();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const startStr = start.toISOString().slice(0, 10);
    getRecordsByDateRange(startStr, end, classFilter || undefined).then(r => {
      setRecords(r.sort((a, b) => b.date.localeCompare(a.date) || a.studentName.localeCompare(b.studentName)));
      setLoading(false);
    });
  }, [classFilter]);

  const grouped: Record<string, DailyRecord[]> = {};
  records.forEach(r => {
    if (!grouped[r.date]) grouped[r.date] = [];
    grouped[r.date].push(r);
  });

  const statusColor = (s: string) => s === "jamaat" ? "text-green-500 bg-green-500/10" : s === "individual" ? "text-yellow-500 bg-yellow-400/10" : "text-muted-foreground/40";

  return (
    <MobileLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-foreground text-center pt-2">📜 ഹിസ്റ്ററി</h2>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-xs focus:ring-2 focus:ring-primary/30 focus:outline-none"
          >
            <option value="">എല്ലാ ക്ലാസുകളും</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">ഡാറ്റ ഇല്ല</div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">{date}</h3>
              {items.map(e => (
                <div key={`${e.studentId}-${e.date}`} className="rounded-2xl border border-border bg-card/80 p-3.5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{e.studentName}</p>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{e.totalScore} pt</span>
                  </div>
                  <div className="flex gap-2">
                    {PRAYERS.map((p, i) => {
                      const Icon = PRAYER_ICONS[i];
                      const status = (e as any)[p.id] as string;
                      return (
                        <div key={p.id} className={`flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl text-[9px] ${statusColor(status)}`}>
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
