import { useState, useEffect, useMemo } from "react";
import { getPrayerDataAsync, deletePrayerEntry as deleteEntry, PRAYERS, CLASSES, type PrayerEntry } from "@/lib/prayerData";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AdminPanel = () => {
  const [data, setData] = useState<Record<string, Record<string, PrayerEntry>>>({});
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const reload = () => {
    setLoading(true);
    getPrayerDataAsync().then(d => { setData(d); setLoading(false); });
  };
  useEffect(reload, []);

  const entries = useMemo(() => {
    const result: (PrayerEntry & { dateKey: string })[] = [];
    for (const date in data) {
      if (dateFilter && date !== dateFilter) continue;
      for (const name in data[date]) {
        const entry = data[date][name];
        if (classFilter && entry.class !== classFilter) continue;
        if (search && !name.toLowerCase().includes(search.toLowerCase())) continue;
        result.push({ ...entry, dateKey: date });
      }
    }
    return result.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [data, search, classFilter, dateFilter]);

  const handleDelete = async (date: string, name: string) => {
    await deleteEntry(date, name);
    reload();
    toast({ title: "ഡിലീറ്റ് ചെയ്തു", description: `${name} - ${date}` });
  };

  const downloadCSV = () => {
    const headers = ["Date", "Name", "Class", "Gender", "Score", ...PRAYERS.map(p => p.labelEn)];
    const rows = entries.map(e => [
      e.dateKey, e.name, e.class, e.gender, e.score,
      ...PRAYERS.map(p => e[p.id as keyof PrayerEntry] ? "✓" : "✗"),
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "prayer-data.csv"; a.click();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display font-bold text-foreground text-center pt-2">📊 Admin Panel</h2>

      <div className="flex flex-col gap-2">
        <input type="text" placeholder="Search name..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
        />
        <div className="flex gap-2">
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:ring-2 focus:ring-primary/30 focus:outline-none"
          >
            <option value="">All Classes</option>
            {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:ring-2 focus:ring-primary/30 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <div key={`${e.dateKey}-${e.name}`} className="rounded-2xl border border-border bg-card/80 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{e.name}</p>
                  <p className="text-[10px] text-muted-foreground">{e.dateKey} · ക്ലാസ് {e.class} · {e.score}/5</p>
                </div>
                <button onClick={() => handleDelete(e.dateKey, e.name)}
                  className="text-destructive text-xs font-bold px-2 py-1 rounded-lg hover:bg-destructive/10"
                >Delete</button>
              </div>
            </div>
          ))}
          {entries.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">ഡാറ്റ ഇല്ല</p>}
        </div>
      )}

      <button onClick={downloadCSV}
        className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm"
      >Download CSV 📥</button>
    </div>
  );
};

export default AdminPanel;
