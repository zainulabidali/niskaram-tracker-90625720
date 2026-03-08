import { useState, useEffect } from "react";
import {
  PRAYERS, getClasses, getStudents as getStudentsList, getSubjects,
  getRecord, saveRecord, getTodayStr, getYesterdayStr, isEditableDate,
  calcTotalPrayerScore, calcSubjectScore,
  type ClassData, type StudentData, type SubjectData, type PrayerStatus, type DailyRecord,
} from "@/lib/firestoreService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Sunrise, Sun, CloudSun, Sunset, Moon, Loader2, BookOpen } from "lucide-react";

const PRAYER_ICONS = [Sunrise, Sun, CloudSun, Sunset, Moon];

const STATUS_COLORS: Record<PrayerStatus, string> = {
  jamaat: "bg-green-500 text-white border-green-500 shadow-lg scale-105",
  individual: "bg-yellow-400 text-foreground border-yellow-400 shadow-md",
  not_prayed: "bg-destructive/80 text-destructive-foreground border-destructive",
};

const STATUS_LABELS: Record<PrayerStatus, string> = {
  jamaat: "ജമാഅത്ത്",
  individual: "തനിച്ച്",
  not_prayed: "നിസ്കരിച്ചില്ല",
};

const nextStatus = (current: PrayerStatus): PrayerStatus => {
  if (current === "not_prayed") return "jamaat";
  if (current === "jamaat") return "individual";
  return "not_prayed";
};

const PrayerTracker = ({ onSubmit }: { onSubmit: () => void }) => {
  const { user } = useAuth();
  const isAdmin = !!user;

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [date, setDate] = useState(getTodayStr());
  const [prayers, setPrayers] = useState<Record<string, PrayerStatus>>({
    fajr: "not_prayed", dhuhr: "not_prayed", asr: "not_prayed", maghrib: "not_prayed", isha: "not_prayed",
  });
  const [subjectStatus, setSubjectStatus] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showPrayerModal, setShowPrayerModal] = useState<string | null>(null);
  const { toast } = useToast();

  const editable = isEditableDate(date, isAdmin);

  // Load classes and subjects on mount
  useEffect(() => {
    Promise.all([getClasses(), getSubjects()]).then(([c, s]) => {
      setClasses(c);
      setSubjects(s);
      const subInit: Record<string, boolean> = {};
      s.forEach(sub => { subInit[sub.id] = false; });
      setSubjectStatus(subInit);
      setLoadingData(false);
    });
  }, []);

  // Load students when class changes
  useEffect(() => {
    if (selectedClass) {
      getStudentsList(selectedClass).then(setStudents);
    } else {
      setStudents([]);
    }
    setSelectedStudent("");
  }, [selectedClass]);

  // Load existing record when student or date changes
  useEffect(() => {
    if (selectedStudent && date) {
      getRecord(selectedStudent, date).then(rec => {
        if (rec) {
          setPrayers({ fajr: rec.fajr, dhuhr: rec.dhuhr, asr: rec.asr, maghrib: rec.maghrib, isha: rec.isha });
          setSubjectStatus(rec.subjects || {});
        } else {
          setPrayers({ fajr: "not_prayed", dhuhr: "not_prayed", asr: "not_prayed", maghrib: "not_prayed", isha: "not_prayed" });
          const subInit: Record<string, boolean> = {};
          subjects.forEach(sub => { subInit[sub.id] = false; });
          setSubjectStatus(subInit);
        }
      });
    }
  }, [selectedStudent, date, subjects]);

  const prayerScore = calcTotalPrayerScore(prayers as any);
  const subScore = calcSubjectScore(subjectStatus);
  const totalScore = prayerScore + subScore;

  const student = students.find(s => s.id === selectedStudent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedStudent || !date || !student) return;
    if (!editable) {
      toast({ title: "🔒 എഡിറ്റ് ചെയ്യാൻ കഴിയില്ല", description: "ഇന്നും ഇന്നലെയും മാത്രം അപ്‌ഡേറ്റ് ചെയ്യാം", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const record: DailyRecord = {
        studentId: selectedStudent,
        studentName: student.name,
        classId: selectedClass,
        date,
        fajr: prayers.fajr as PrayerStatus,
        dhuhr: prayers.dhuhr as PrayerStatus,
        asr: prayers.asr as PrayerStatus,
        maghrib: prayers.maghrib as PrayerStatus,
        isha: prayers.isha as PrayerStatus,
        subjects: subjectStatus,
        prayerScore,
        subjectScore: subScore,
        totalScore,
      };
      await saveRecord(record);
      toast({ title: "✅ സേവ് ചെയ്തു!", description: `${student.name} - ${totalScore} പോയിന്റ്` });
      onSubmit();
    } catch {
      toast({ title: "❌ പിശക്!", description: "ദയവായി വീണ്ടും ശ്രമിക്കുക", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrayerClick = (prayerId: string) => {
    if (!editable) return;
    setShowPrayerModal(prayerId);
  };

  const selectPrayerStatus = (prayerId: string, status: PrayerStatus) => {
    setPrayers(prev => ({ ...prev, [prayerId]: status }));
    setShowPrayerModal(null);
  };

  if (loadingData) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Score Ring */}
      <div className="flex flex-col items-center py-3">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-muted" />
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round"
              className="stroke-primary transition-all duration-500"
              strokeDasharray={`${(prayerScore / 5) * 264} 264`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-foreground">{totalScore}</span>
            <span className="text-[9px] text-muted-foreground">പോയിന്റ്</span>
          </div>
        </div>
      </div>

      {/* Class Select */}
      <div>
        <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">ക്ലാസ്</label>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} required
          className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
        >
          <option value="">ക്ലാസ് തിരഞ്ഞെടുക്കുക</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Student Select */}
      <div>
        <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">വിദ്യാർത്ഥി</label>
        <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} required
          className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
        >
          <option value="">പേര് തിരഞ്ഞെടുക്കുക</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">തിയതി</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setDate(getTodayStr())}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${date === getTodayStr() ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 border-border"}`}
          >ഇന്ന്</button>
          <button type="button" onClick={() => setDate(getYesterdayStr())}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${date === getYesterdayStr() ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 border-border"}`}
          >ഇന്നലെ</button>
          {isAdmin && (
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="flex-1 px-2 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
          )}
        </div>
        {!editable && <p className="text-[10px] text-destructive mt-1">🔒 ഈ തിയതി ലോക്ക് ചെയ്തിരിക്കുന്നു</p>}
      </div>

      {/* Prayer Buttons */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-muted-foreground">നമസ്‌കാരങ്ങൾ</label>
        <div className="grid grid-cols-5 gap-2">
          {PRAYERS.map((p, i) => {
            const Icon = PRAYER_ICONS[i];
            const status = (prayers[p.id] || "not_prayed") as PrayerStatus;
            const colorClass = status === "jamaat"
              ? "bg-green-500 text-white border-green-500"
              : status === "individual"
              ? "bg-yellow-400 text-foreground border-yellow-400"
              : "bg-card border-border text-muted-foreground";
            return (
              <button key={p.id} type="button"
                onClick={() => handlePrayerClick(p.id)}
                disabled={!editable}
                className={`flex flex-col items-center gap-1 py-3 rounded-2xl transition-all border ${colorClass} disabled:opacity-50`}
              >
                <Icon size={18} />
                <span className="text-[9px] font-medium leading-tight">{p.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-center gap-3 text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> ജമാഅത്ത്</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> തനിച്ച്</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> നിസ്കരിച്ചില്ല</span>
        </div>
      </div>

      {/* Prayer Status Modal */}
      {showPrayerModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={() => setShowPrayerModal(null)}>
          <div className="bg-card w-full max-w-lg rounded-t-3xl p-5 space-y-3 safe-bottom" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-center text-foreground">
              {PRAYERS.find(p => p.id === showPrayerModal)?.label} - സ്റ്റാറ്റസ്
            </h3>
            <button type="button" onClick={() => selectPrayerStatus(showPrayerModal, "jamaat")}
              className="w-full py-3.5 rounded-2xl bg-green-500 text-white font-bold text-sm flex items-center justify-center gap-2"
            >🕌 ജമാഅത്തിൽ നിസ്കരിച്ചു</button>
            <button type="button" onClick={() => selectPrayerStatus(showPrayerModal, "individual")}
              className="w-full py-3.5 rounded-2xl bg-yellow-400 text-foreground font-bold text-sm flex items-center justify-center gap-2"
            >🧍 തനിച്ച് നിസ്കരിച്ചു</button>
            <button type="button" onClick={() => selectPrayerStatus(showPrayerModal, "not_prayed")}
              className="w-full py-3.5 rounded-2xl bg-destructive text-destructive-foreground font-bold text-sm flex items-center justify-center gap-2"
            >❌ നിസ്കരിച്ചില്ല</button>
          </div>
        </div>
      )}

      {/* Study Subjects */}
      {subjects.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <BookOpen size={14} /> പഠന വിഷയങ്ങൾ
          </label>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map(sub => {
              const done = !!subjectStatus[sub.id];
              return (
                <button key={sub.id} type="button"
                  onClick={() => {
                    if (!editable) return;
                    setSubjectStatus(prev => ({ ...prev, [sub.id]: !prev[sub.id] }));
                  }}
                  disabled={!editable}
                  className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                    done
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-destructive/20 text-destructive border-destructive/30"
                  } disabled:opacity-50`}
                >
                  {done ? "✅" : "❌"} {sub.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit */}
      <button type="submit" disabled={submitting || !editable}
        className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        സേവ് ചെയ്യുക ✨
      </button>
    </form>
  );
};

export default PrayerTracker;
