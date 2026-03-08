import { useState } from "react";
import { CLASSES, PRAYERS, getStudents, savePrayerEntry, getPrayerData } from "@/lib/prayerData";
import { useToast } from "@/hooks/use-toast";

const PrayerForm = ({ onSubmit }: { onSubmit: () => void }) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [gender, setGender] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [prayers, setPrayers] = useState<Record<string, boolean>>({
    fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false,
  });
  const { toast } = useToast();

  const students = selectedClass && gender ? getStudents(selectedClass, gender) : [];

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

    const score = Object.values(prayers).filter(Boolean).length;
    savePrayerEntry({
      name, class: selectedClass, gender, date, score,
      fajr: prayers.fajr, dhuhr: prayers.dhuhr, asr: prayers.asr,
      maghrib: prayers.maghrib, isha: prayers.isha,
    });

    toast({
      title: "🟢 വിജയകരമായി സമർപ്പിച്ചു!",
      description: `${name} - ${score}/5 നമസ്കാരങ്ങൾ`,
    });
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Class Select */}
      <div>
        <label className="block text-sm font-semibold mb-1.5 text-foreground/80">ക്ലാസ്</label>
        <select
          value={selectedClass}
          onChange={(e) => { setSelectedClass(e.target.value); setName(""); }}
          required
          className="w-full px-3 py-2.5 rounded-lg bg-input/50 border border-border text-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none"
        >
          <option value="">-- ക്ലാസ് തിരഞ്ഞെടുക്കുക --</option>
          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-foreground/80">ലിംഗം</label>
        <div className="flex gap-3">
          {[{ value: "male", label: "ആൺ" }, { value: "female", label: "പെൺ" }].map(g => (
            <button
              key={g.value}
              type="button"
              onClick={() => { setGender(g.value); setName(""); }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all border ${
                gender === g.value
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Name Select */}
      <div>
        <label className="block text-sm font-semibold mb-1.5 text-foreground/80">പേര്</label>
        <select
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            loadExisting(e.target.value, date);
          }}
          required
          className="w-full px-3 py-2.5 rounded-lg bg-input/50 border border-border text-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none"
        >
          <option value="">-- പേര് തിരഞ്ഞെടുക്കുക --</option>
          {students.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-semibold mb-1.5 text-foreground/80">തിയതി</label>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            if (name) loadExisting(name, e.target.value);
          }}
          required
          className="w-full px-3 py-2.5 rounded-lg bg-input/50 border border-border text-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none"
        />
      </div>

      {/* Prayers */}
      <fieldset className="rounded-xl border border-border p-4 bg-card/50">
        <legend className="px-2 font-semibold text-sm text-foreground/80">നമസ്‌കാരങ്ങൾ</legend>
        <div className="grid grid-cols-5 gap-2 mt-2">
          {PRAYERS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPrayers(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
              className={`py-3 px-1 rounded-lg text-xs sm:text-sm font-medium transition-all border ${
                prayers[p.id]
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                  : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        സമർപ്പിക്കുക ✨
      </button>
    </form>
  );
};

export default PrayerForm;
