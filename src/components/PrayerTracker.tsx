import { useState } from "react";
import { PRAYERS, getStudents, savePrayerEntry, getPrayerData, CLASSES } from "@/lib/prayerData";
import { useToast } from "@/hooks/use-toast";
import { Sunrise, Sun, CloudSun, Sunset, Moon } from "lucide-react";

const PRAYER_ICONS = [Sunrise, Sun, CloudSun, Sunset, Moon];

const PrayerTracker = ({ onSubmit }: { onSubmit: () => void }) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [gender, setGender] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [prayers, setPrayers] = useState<Record<string, boolean>>({
    fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false,
  });
  const { toast } = useToast();

  const students = selectedClass && gender ? getStudents(selectedClass, gender) : [];
  const completedCount = Object.values(prayers).filter(Boolean).length;

  const loadExisting = (studentName: string, d: string) => {
    const data = getPrayerData();
    const entry = data[d]?.[studentName];
    if (entry) {
      setPrayers({
        fajr: !!entry.fajr, dhuhr: !!entry.dhuhr, asr: !!entry.asr,
        maghrib: !!entry.maghrib, isha: !!entry.isha,
      });
    } else {
      setPrayers({ fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !gender || !name || !date) return;
    const score = completedCount;
    savePrayerEntry({
      name, class: selectedClass, gender, date, score,
      fajr: prayers.fajr, dhuhr: prayers.dhuhr, asr: prayers.asr,
      maghrib: prayers.maghrib, isha: prayers.isha,
    });
    toast({
      title: "✅ വിജയകരമായി സമർപ്പിച്ചു!",
      description: `${name} - ${score}/5 നമസ്കാരങ്ങൾ`,
    });
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Progress Ring */}
      <div className="flex flex-col items-center py-4">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-muted" />
            <circle
              cx="50" cy="50" r="42" fill="none" strokeWidth="8"
              strokeLinecap="round"
              className="stroke-primary transition-all duration-500"
              strokeDasharray={`${(completedCount / 5) * 264} 264`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{completedCount}/5</span>
            <span className="text-[10px] text-muted-foreground">നമസ്കാരം</span>
          </div>
        </div>
      </div>

      {/* Class & Gender Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">ക്ലാസ്</label>
          <select
            value={selectedClass}
            onChange={(e) => { setSelectedClass(e.target.value); setName(""); }}
            required
            className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
          >
            <option value="">തിരഞ്ഞെടുക്കുക</option>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">ലിംഗം</label>
          <div className="flex gap-2">
            {[{ value: "male", label: "👦" }, { value: "female", label: "👧" }].map(g => (
              <button
                key={g.value}
                type="button"
                onClick={() => { setGender(g.value); setName(""); }}
                className={`flex-1 py-2.5 rounded-xl text-lg transition-all border ${
                  gender === g.value
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-muted/50 border-border hover:bg-muted"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">പേര്</label>
        <select
          value={name}
          onChange={(e) => { setName(e.target.value); loadExisting(e.target.value, date); }}
          required
          className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
        >
          <option value="">പേര് തിരഞ്ഞെടുക്കുക</option>
          {students.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">തിയതി</label>
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); if (name) loadExisting(name, e.target.value); }}
          required
          className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
        />
      </div>

      {/* Prayer Buttons */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-muted-foreground">നമസ്‌കാരങ്ങൾ</label>
        <div className="grid grid-cols-5 gap-2">
          {PRAYERS.map((p, i) => {
            const Icon = PRAYER_ICONS[i];
            const active = prayers[p.id];
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPrayers(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all border ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                    : "bg-card border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium leading-tight">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.97]"
      >
        സമർപ്പിക്കുക ✨
      </button>
    </form>
  );
};

export default PrayerTracker;
