import { useState, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import {
  getRecordsByDateRange, getRecordsByStudent, getClasses, getStudents,
  PRAYERS, getTodayStr,
  type DailyRecord, type ClassData, type StudentData,
} from "@/lib/firestoreService";
import { Sunrise, Sun, CloudSun, Sunset, Moon, Loader2, GraduationCap, User, CalendarDays, Search, X, ChevronRight, Sparkles } from "lucide-react";
import { format } from "date-fns";

const PRAYER_ICONS = [Sunrise, Sun, CloudSun, Sunset, Moon];

const History = () => {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [classFilter, setClassFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(getTodayStr());
  const [studentFilter, setStudentFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showStudentPicker, setShowStudentPicker] = useState(false);

  useEffect(() => { getClasses().then(setClasses); }, []);

  useEffect(() => {
    if (classFilter) {
      getStudents(classFilter).then(setStudents);
    } else {
      setStudents([]);
    }
    setStudentFilter("");
  }, [classFilter]);

  useEffect(() => {
    setLoading(true);

    if (studentFilter) {
      getRecordsByStudent(studentFilter).then(r => {
        setRecords(r.sort((a, b) => b.date.localeCompare(a.date)));
        setLoading(false);
      }).catch(() => { setRecords([]); setLoading(false); });
    } else if (dateFilter) {
      getRecordsByDateRange(dateFilter, dateFilter, classFilter || undefined).then(r => {
        setRecords(r.sort((a, b) => a.studentName.localeCompare(b.studentName)));
        setLoading(false);
      }).catch(() => { setRecords([]); setLoading(false); });
    } else {
      setRecords([]);
      setLoading(false);
    }
  }, [classFilter, dateFilter, studentFilter]);

  const selectedClassName = classes.find(c => c.id === classFilter)?.name;
  const selectedStudentName = students.find(s => s.id === studentFilter)?.name;

  const statusColor = (s: string) =>
    s === "jamaat" ? "bg-green-500 text-white" :
    s === "individual" ? "bg-yellow-400 text-foreground" :
    "bg-destructive/20 text-destructive";

  return (
    <MobileLayout>
      <div className="space-y-4 animate-fade-in">
        <h2 className="text-xl font-display font-bold text-foreground text-center pt-2">📜 ഹിസ്റ്ററി</h2>

        {/* Filter Cards */}
        <div className="grid grid-cols-3 gap-2">
          {/* Class Filter */}
          <button onClick={() => setShowClassPicker(true)}
            className={`relative p-3 rounded-2xl border-2 transition-all text-left active:scale-95 ${
              classFilter ? "border-primary bg-primary/5" : "border-border bg-card"
            }`}
          >
            <GraduationCap size={16} className={classFilter ? "text-primary" : "text-muted-foreground"} />
            <p className="text-[9px] text-muted-foreground mt-1">ക്ലാസ്</p>
            <p className="text-[10px] font-bold text-foreground truncate">{selectedClassName || "എല്ലാം"}</p>
            {classFilter && (
              <button onClick={e => { e.stopPropagation(); setClassFilter(""); }}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-muted hover:bg-destructive/10"
              ><X size={10} className="text-muted-foreground" /></button>
            )}
          </button>

          {/* Date Filter */}
          <div className="relative p-3 rounded-2xl border-2 border-border bg-card">
            <CalendarDays size={16} className="text-secondary" />
            <p className="text-[9px] text-muted-foreground mt-1">തിയതി</p>
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              className="absolute inset-0 opacity-0 w-full cursor-pointer"
            />
            <p className="text-[10px] font-bold text-foreground">{dateFilter ? format(new Date(dateFilter + 'T00:00:00'), 'dd/MM') : "തിരഞ്ഞെടുക്കുക"}</p>
          </div>

          {/* Student Filter */}
          <button onClick={() => { if (classFilter) setShowStudentPicker(true); }}
            className={`relative p-3 rounded-2xl border-2 transition-all text-left active:scale-95 ${
              studentFilter ? "border-secondary bg-secondary/5" : "border-border bg-card"
            } ${!classFilter ? "opacity-50" : ""}`}
          >
            <User size={16} className={studentFilter ? "text-secondary" : "text-muted-foreground"} />
            <p className="text-[9px] text-muted-foreground mt-1">വിദ്യാർത്ഥി</p>
            <p className="text-[10px] font-bold text-foreground truncate">{selectedStudentName || "എല്ലാം"}</p>
            {studentFilter && (
              <button onClick={e => { e.stopPropagation(); setStudentFilter(""); }}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-muted hover:bg-destructive/10"
              ><X size={10} className="text-muted-foreground" /></button>
            )}
          </button>
        </div>

        {/* Bottom Sheet Modals */}
        <BottomSheetPicker
          show={showClassPicker}
          onClose={() => setShowClassPicker(false)}
          title="ക്ലാസ് തിരഞ്ഞെടുക്കുക"
        >
          <button onClick={() => { setClassFilter(""); setShowClassPicker(false); }}
            className="w-full p-3.5 rounded-2xl border border-border bg-card text-sm font-semibold text-left hover:bg-muted/50 transition-colors"
          >എല്ലാ ക്ലാസുകളും</button>
          {classes.map(c => (
            <button key={c.id} onClick={() => { setClassFilter(c.id); setShowClassPicker(false); }}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                classFilter === c.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              <GraduationCap size={18} className="text-primary" />
              <span className="text-sm font-semibold flex-1">{c.name}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </BottomSheetPicker>

        <BottomSheetPicker
          show={showStudentPicker}
          onClose={() => setShowStudentPicker(false)}
          title="വിദ്യാർത്ഥി തിരഞ്ഞെടുക്കുക"
        >
          <button onClick={() => { setStudentFilter(""); setShowStudentPicker(false); }}
            className="w-full p-3.5 rounded-2xl border border-border bg-card text-sm font-semibold text-left hover:bg-muted/50 transition-colors"
          >എല്ലാ വിദ്യാർത്ഥികളും</button>
          {students.map(s => (
            <button key={s.id} onClick={() => { setStudentFilter(s.id); setShowStudentPicker(false); }}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                studentFilter === s.id ? "border-secondary bg-secondary/5" : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              <User size={18} className="text-secondary" />
              <span className="text-sm font-semibold flex-1">{s.name}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
          {students.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">വിദ്യാർത്ഥികൾ ഇല്ല</p>}
        </BottomSheetPicker>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <Search size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">ഡാറ്റ ഇല്ല</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">ഫിൽട്ടറുകൾ മാറ്റി നോക്കുക</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[10px] text-muted-foreground px-1 font-semibold">{records.length} റെക്കോർഡുകൾ</p>
            {records.map(e => (
              <div key={`${e.studentId}-${e.date}`} className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">{e.studentName}</p>
                    <p className="text-[10px] text-muted-foreground">{e.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">{e.totalScore} pt</span>
                    {(e.salawatCount || 0) > 0 && (
                      <span className="text-[10px] font-bold text-salawat bg-salawat/10 px-2 py-1 rounded-full flex items-center gap-0.5">
                        <Sparkles size={10} /> {e.salawatCount}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {PRAYERS.map((p, i) => {
                    const Icon = PRAYER_ICONS[i];
                    const status = (e as any)[p.id] as string;
                    return (
                      <div key={p.id} className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl text-[9px] font-medium ${statusColor(status)}`}>
                        <Icon size={14} />
                        <span>{p.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

/* Reusable bottom sheet with proper scrolling */
function BottomSheetPicker({ show, onClose, title, children }: {
  show: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center animate-fade-in" onClick={onClose}>
      <div
        className="bg-card w-full max-w-lg rounded-t-3xl animate-slide-in-bottom flex flex-col"
        style={{ maxHeight: '70vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 pb-2 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border mx-auto mb-3" />
          <h3 className="text-sm font-bold text-center text-foreground">{title}</h3>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 2rem)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default History;
