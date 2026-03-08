import { useState, useEffect, useMemo } from "react";
import { getPrayerData, deletePrayerEntry, PRAYERS, CLASSES, type PrayerEntry } from "@/lib/prayerData";
import { useToast } from "@/hooks/use-toast";

const AdminPanel = () => {
  const [data, setData] = useState<Record<string, Record<string, PrayerEntry>>>({});
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const { toast } = useToast();

  const reload = () => setData(getPrayerData());
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

  const handleDelete = (date: string, name: string) => {
    deletePrayerEntry(date, name);
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
    a.href = url;
    a.download = "prayer-data.csv";
    a.click();
  };

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-display font-bold text-foreground">📊 Admin Panel</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-lg bg-input/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
        />
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-input/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
        >
          <option value="">All Classes</option>
          {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-input/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/70">
              <th className="px-3 py-2 text-left">തിയതി</th>
              <th className="px-3 py-2 text-left">പേര്</th>
              <th className="px-3 py-2">ക്ലാസ്</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">നമസ്‌കാരങ്ങൾ</th>
              <th className="px-3 py-2">🗑️</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={`${e.dateKey}-${e.name}`} className={i % 2 === 0 ? "bg-card/50" : "bg-muted/30"}>
                <td className="px-3 py-2">{e.dateKey}</td>
                <td className="px-3 py-2 font-medium">{e.name}</td>
                <td className="px-3 py-2 text-center">{e.class}</td>
                <td className="px-3 py-2 text-center font-bold text-accent">{e.score}/5</td>
                <td className="px-3 py-2 text-center">
                  {PRAYERS.map(p => (
                    <span key={p.id} className={`inline-block mx-0.5 text-xs ${e[p.id as keyof PrayerEntry] ? "text-primary" : "text-muted-foreground/40"}`}>
                      {e[p.id as keyof PrayerEntry] ? "✅" : "⬜"}
                    </span>
                  ))}
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => handleDelete(e.dateKey, e.name)}
                    className="text-destructive hover:text-destructive/80 text-xs font-bold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">ഡാറ്റ ഇല്ല</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={downloadCSV}
        className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
      >
        Download CSV 📥
      </button>
    </div>
  );
};

export default AdminPanel;
