import { useState, useEffect } from "react";
import {
  PRAYERS, getClasses, getStudents as getStudentsList, getSubjects,
  getRecord, saveRecord, getTodayStr, getYesterdayStr, isEditableDate,
  calcTotalPrayerScore, calcSubjectScore, getCumulativeScore,
  type ClassData, type StudentData, type SubjectData, type PrayerStatus, type DailyRecord,
} from "@/lib/firestoreService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Sunrise, Sun, CloudSun, Sunset, Moon, Loader2, BookOpen, ChevronRight, Star, Trophy, Sparkles, GraduationCap, User } from "lucide-react";

const PRAYER_ICONS = [Sunrise, Sun, CloudSun, Sunset, Moon];

const STATUS_LABELS: Record<PrayerStatus, string> = {
  jamaat: "ജമാഅത്ത്",
  individual: "തനിച്ച്",
  not_prayed: "നിസ്കരിച്ചില്ല",
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
  const [salawatCount, setSalawatCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showPrayerModal, setShowPrayerModal] = useState<string | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [cumulativeScore, setCumulativeScore] = useState(0);
  const [loadingScore, setLoadingScore] = useState(false);
  const { toast } = useToast();

  const editable = isEditableDate(date, isAdmin);

  // Load classes on mount
  useEffect(() => {
    getClasses().then(c => {
      setClasses(c);
      setLoadingData(false);
    });
  }, []);

  // Load students when class changes
  useEffect(() => {
    if (selectedClass) {
      getStudentsList(selectedClass).then(setStudents);
      // Load class-specific subjects
      getSubjects(selectedClass).then(subs => {
        setSubjects(subs);
        const subInit: Record<string, boolean> = {};
        subs.forEach(sub => { subInit[sub.id] = false; });
        setSubjectStatus(subInit);
      });
    } else {
      setStudents([]);
      setSubjects([]);
      setSubjectStatus({});
    }
    setSelectedStudent("");
  }, [selectedClass]);

  // Load cumulative score when student changes
  useEffect(() => {
    if (selectedStudent) {
      setLoadingScore(true);
      getCumulativeScore(selectedStudent).then(score => {
        setCumulativeScore(score);
        setLoadingScore(false);
      });
    } else {
      setCumulativeScore(0);
    }
  }, [selectedStudent]);

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
  }, [selectedStudent, date]);

  const prayerScore = calcTotalPrayerScore(prayers as any);
  const subScore = calcSubjectScore(subjectStatus);
  const totalScore = prayerScore + subScore;

  const student = students.find(s => s.id === selectedStudent);
  const selectedClassName = classes.find(c => c.id === selectedClass)?.name;

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
      // Refresh cumulative score
      getCumulativeScore(selectedStudent).then(setCumulativeScore);
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

  // Step 1: Class selection
  if (!selectedClass) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="text-center space-y-2 py-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap size={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground">ക്ലാസ് തിരഞ്ഞെടുക്കുക</h3>
          <p className="text-xs text-muted-foreground">നിങ്ങളുടെ ക്ലാസ് താഴെ നിന്ന് തിരഞ്ഞെടുക്കുക</p>
        </div>
        <div className="space-y-2.5">
          {classes.map((c, i) => (
            <button key={c.id} onClick={() => setSelectedClass(c.id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-primary/5 hover:border-primary/30 transition-all active:scale-[0.98] shadow-sm"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap size={22} className="text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground flex-1 text-left">{c.name}</span>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          ))}
          {classes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-xs">ക്ലാസുകൾ ഇല്ല</div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Student selection
  if (!selectedStudent) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="text-center space-y-2 py-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center">
            <User size={32} className="text-secondary" />
          </div>
          <h3 className="text-lg font-bold text-foreground">വിദ്യാർത്ഥി തിരഞ്ഞെടുക്കുക</h3>
          <p className="text-xs text-muted-foreground">{selectedClassName}</p>
        </div>
        <button onClick={() => { setSelectedClass(""); }}
          className="text-xs text-primary font-semibold flex items-center gap-1 mx-auto hover:underline"
        >← ക്ലാസ് മാറ്റുക</button>
        <div className="space-y-2.5">
          {students.map((s, i) => (
            <button key={s.id} onClick={() => setSelectedStudent(s.id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-secondary/5 hover:border-secondary/30 transition-all active:scale-[0.98] shadow-sm"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <User size={22} className="text-secondary" />
              </div>
              <span className="text-sm font-semibold text-foreground flex-1 text-left">{s.name}</span>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          ))}
          {students.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-xs">വിദ്യാർത്ഥികൾ ഇല്ല</div>
          )}
        </div>
      </div>
    );
  }

  // Step 3: Tracking interface
  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      {/* Student Header with Cumulative Score */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-green-light p-5 text-primary-foreground shadow-lg">
        <div className="absolute top-2 right-2 opacity-10">
          <Sparkles size={80} />
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
            <User size={28} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-base">{student?.name}</p>
            <p className="text-xs opacity-80">{selectedClassName}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Trophy size={16} />
              {loadingScore ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <span className="text-2xl font-bold">{cumulativeScore}</span>
              )}
            </div>
            <p className="text-[10px] opacity-80">ആകെ പോയിന്റ്</p>
          </div>
        </div>
        <button type="button" onClick={() => { setSelectedStudent(""); }}
          className="mt-3 text-[10px] opacity-70 hover:opacity-100 underline transition-opacity"
        >വിദ്യാർത്ഥിയെ മാറ്റുക</button>
      </div>

      {/* Today's Score */}
      <div className="flex items-center justify-center gap-6">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-muted" />
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round"
              className="stroke-secondary transition-all duration-700"
              strokeDasharray={`${(prayerScore / 5) * 264} 264`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-foreground">{totalScore}</span>
            <span className="text-[8px] text-muted-foreground">ഇന്ന്</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <Moon size={12} className="text-primary" />
            <span className="text-muted-foreground">നമസ്കാരം:</span>
            <span className="font-bold text-foreground">{prayerScore}/5</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <BookOpen size={12} className="text-secondary" />
            <span className="text-muted-foreground">പഠനം:</span>
            <span className="font-bold text-foreground">{subScore}/{subjects.length}</span>
          </div>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">📅 തിയതി</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setDate(getTodayStr())}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${date === getTodayStr() ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-card border-border text-foreground hover:border-primary/30"}`}
          >ഇന്ന്</button>
          <button type="button" onClick={() => setDate(getYesterdayStr())}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${date === getYesterdayStr() ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-card border-border text-foreground hover:border-primary/30"}`}
          >ഇന്നലെ</button>
          {isAdmin && (
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="flex-1 px-2 py-2 rounded-xl bg-card border-2 border-border text-xs focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
          )}
        </div>
        {!editable && <p className="text-[10px] text-destructive mt-1">🔒 ഈ തിയതി ലോക്ക് ചെയ്തിരിക്കുന്നു</p>}
      </div>

      {/* Prayer Buttons */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-muted-foreground">🕌 നമസ്‌കാരങ്ങൾ</label>
        <div className="grid grid-cols-5 gap-2">
          {PRAYERS.map((p, i) => {
            const Icon = PRAYER_ICONS[i];
            const status = (prayers[p.id] || "not_prayed") as PrayerStatus;
            const colorClass = status === "jamaat"
              ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20"
              : status === "individual"
              ? "bg-yellow-400 text-foreground border-yellow-400 shadow-md shadow-yellow-400/20"
              : "bg-card border-border text-muted-foreground";
            return (
              <button key={p.id} type="button"
                onClick={() => handlePrayerClick(p.id)}
                disabled={!editable}
                className={`flex flex-col items-center gap-1.5 py-3.5 rounded-2xl transition-all border-2 ${colorClass} disabled:opacity-50 active:scale-95`}
              >
                <Icon size={20} />
                <span className="text-[9px] font-bold leading-tight">{p.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> ജമാഅത്ത്</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> തനിച്ച്</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> ✗</span>
        </div>
      </div>

      {/* Prayer Status Modal */}
      {showPrayerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center animate-fade-in" onClick={() => setShowPrayerModal(null)}>
          <div className="bg-card w-full max-w-lg rounded-t-3xl p-6 space-y-3 animate-slide-in-bottom" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 1.5rem)' }} onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-2" />
            <h3 className="text-sm font-bold text-center text-foreground">
              {PRAYERS.find(p => p.id === showPrayerModal)?.label} - സ്റ്റാറ്റസ്
            </h3>
            <button type="button" onClick={() => selectPrayerStatus(showPrayerModal, "jamaat")}
              className="w-full py-4 rounded-2xl bg-green-500 text-white font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 active:scale-[0.97] transition-transform"
            >🕌 ജമാഅത്തിൽ നിസ്കരിച്ചു</button>
            <button type="button" onClick={() => selectPrayerStatus(showPrayerModal, "individual")}
              className="w-full py-4 rounded-2xl bg-yellow-400 text-foreground font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-yellow-400/20 active:scale-[0.97] transition-transform"
            >🧍 തനിച്ച് നിസ്കരിച്ചു</button>
            <button type="button" onClick={() => selectPrayerStatus(showPrayerModal, "not_prayed")}
              className="w-full py-4 rounded-2xl bg-destructive text-destructive-foreground font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-destructive/20 active:scale-[0.97] transition-transform"
            >❌ നിസ്കരിച്ചില്ല</button>
          </div>
        </div>
      )}

      {/* Study Subjects (class-specific) */}
      {subjects.length > 0 && (
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <BookOpen size={14} /> പഠന വിഷയങ്ങൾ
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {subjects.map(sub => {
              const done = !!subjectStatus[sub.id];
              return (
                <button key={sub.id} type="button"
                  onClick={() => {
                    if (!editable) return;
                    setSubjectStatus(prev => ({ ...prev, [sub.id]: !prev[sub.id] }));
                  }}
                  disabled={!editable}
                  className={`py-3.5 rounded-2xl text-xs font-bold border-2 transition-all active:scale-95 ${
                    done
                      ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-500/20"
                      : "bg-card text-muted-foreground border-border hover:border-destructive/30"
                  } disabled:opacity-50`}
                >
                  {done ? "✅" : "📖"} {sub.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit */}
      <button type="submit" disabled={submitting || !editable}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-green-light text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Star size={18} />}
        സേവ് ചെയ്യുക ✨
      </button>
    </form>
  );
};

export default PrayerTracker;
