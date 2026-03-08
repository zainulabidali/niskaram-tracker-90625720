import { useState, useEffect } from "react";
import {
  getClasses, addClass, deleteClass,
  getStudents, addStudent, deleteStudent,
  getSubjects, addSubject, deleteSubject,
  getRecordsByDateRange, deleteRecord,
  type ClassData, type StudentData, type SubjectData, type DailyRecord,
} from "@/lib/firestoreService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Users, BookOpen, GraduationCap, ClipboardList, AlertCircle } from "lucide-react";

type Tab = "classes" | "students" | "subjects" | "records";

const AdminPanel = () => {
  const [tab, setTab] = useState<Tab>("classes");
  const { toast } = useToast();

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "classes", label: "ക്ലാസുകൾ", icon: GraduationCap },
    { id: "students", label: "വിദ്യാർത്ഥികൾ", icon: Users },
    { id: "subjects", label: "വിഷയങ്ങൾ", icon: BookOpen },
    { id: "records", label: "റെക്കോർഡുകൾ", icon: ClipboardList },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display font-bold text-foreground text-center pt-2">📊 Admin Panel</h2>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-2xl">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
              tab === t.id ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "classes" && <ClassManager toast={toast} />}
      {tab === "students" && <StudentManager toast={toast} />}
      {tab === "subjects" && <SubjectManager toast={toast} />}
      {tab === "records" && <RecordManager toast={toast} />}
    </div>
  );
};

// ====== SHARED INPUT ROW ======
function AddRow({ value, onChange, onAdd, placeholder, loading }: {
  value: string; onChange: (v: string) => void; onAdd: () => void; placeholder: string; loading?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 px-4 py-3 rounded-2xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
        onKeyDown={e => e.key === "Enter" && onAdd()}
      />
      <button onClick={onAdd} disabled={loading}
        className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
      </button>
    </div>
  );
}

// ====== ITEM CARD ======
function ItemCard({ label, sublabel, onDelete }: { label: string; sublabel?: string; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
      <div>
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {sublabel && <p className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      <button onClick={onDelete}
        className="text-destructive p-2 rounded-xl hover:bg-destructive/10 transition-colors active:scale-90"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

// ====== EMPTY STATE ======
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center py-8 text-muted-foreground">
      <AlertCircle size={24} className="mb-2 opacity-50" />
      <p className="text-xs">{message}</p>
    </div>
  );
}

// ====== SECTION HEADER ======
function SectionCount({ count, label }: { count: number; label: string }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{count}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ====== CLASS MANAGER ======
function ClassManager({ toast }: { toast: any }) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const reload = () => { setLoading(true); getClasses().then(c => { setClasses(c); setLoading(false); }).catch(() => { setLoading(false); toast({ title: "❌ ലോഡ് പിശക്", variant: "destructive" }); }); };
  useEffect(reload, []);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) { toast({ title: "⚠️ പേര് ടൈപ്പ് ചെയ്യുക", variant: "destructive" }); return; }
    setAdding(true);
    try {
      await addClass(trimmed);
      setName("");
      reload();
      toast({ title: "✅ ക്ലാസ് ചേർത്തു" });
    } catch (err: any) {
      if (err.message === "DUPLICATE") {
        toast({ title: "⚠️ ഈ ക്ലാസ് ഇതിനകം ഉണ്ട്", variant: "destructive" });
      } else {
        toast({ title: "❌ ചേർക്കൽ പിശക്", description: err.message, variant: "destructive" });
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-3">
      <AddRow value={name} onChange={setName} onAdd={handleAdd} placeholder="ക്ലാസ് പേര്..." loading={adding} />
      {loading ? <Loader2 className="animate-spin mx-auto text-muted-foreground" /> : (
        <>
          <SectionCount count={classes.length} label="ക്ലാസുകൾ" />
          <div className="space-y-2">
            {classes.map(c => (
              <ItemCard key={c.id} label={c.name}
                onDelete={async () => {
                  try { await deleteClass(c.id); reload(); toast({ title: "🗑 ഡിലീറ്റ് ചെയ്തു" }); }
                  catch { toast({ title: "❌ ഡിലീറ്റ് പിശക്", variant: "destructive" }); }
                }}
              />
            ))}
            {classes.length === 0 && <EmptyState message="ക്ലാസുകൾ ഇല്ല" />}
          </div>
        </>
      )}
    </div>
  );
}

// ====== STUDENT MANAGER ======
function StudentManager({ toast }: { toast: any }) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState<StudentData[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => { getClasses().then(c => { setClasses(c); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const reloadStudents = () => {
    if (!selectedClass) { setStudents([]); return; }
    setLoading(true);
    getStudents(selectedClass).then(s => { setStudents(s); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(reloadStudents, [selectedClass]);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) { toast({ title: "⚠️ പേര് ടൈപ്പ് ചെയ്യുക", variant: "destructive" }); return; }
    if (!selectedClass) { toast({ title: "⚠️ ക്ലാസ് തിരഞ്ഞെടുക്കുക", variant: "destructive" }); return; }
    setAdding(true);
    try {
      await addStudent(trimmed, selectedClass);
      setName("");
      reloadStudents();
      toast({ title: "✅ വിദ്യാർത്ഥി ചേർത്തു" });
    } catch (err: any) {
      if (err.message === "DUPLICATE") {
        toast({ title: "⚠️ ഈ വിദ്യാർത്ഥി ഈ ക്ലാസിൽ ഇതിനകം ഉണ്ട്", variant: "destructive" });
      } else {
        toast({ title: "❌ ചേർക്കൽ പിശക്", description: err.message, variant: "destructive" });
      }
    } finally {
      setAdding(false);
    }
  };

  const className = classes.find(c => c.id === selectedClass)?.name;

  return (
    <div className="space-y-3">
      <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
      >
        <option value="">ക്ലാസ് തിരഞ്ഞെടുക്കുക</option>
        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {selectedClass && (
        <>
          <AddRow value={name} onChange={setName} onAdd={handleAdd} placeholder="വിദ്യാർത്ഥി പേര്..." loading={adding} />
          {loading ? <Loader2 className="animate-spin mx-auto text-muted-foreground" /> : (
            <>
              <SectionCount count={students.length} label={`${className || ""} വിദ്യാർത്ഥികൾ`} />
              <div className="space-y-2">
                {students.map(s => (
                  <ItemCard key={s.id} label={s.name}
                    onDelete={async () => {
                      try { await deleteStudent(s.id); reloadStudents(); toast({ title: "🗑 ഡിലീറ്റ്" }); }
                      catch { toast({ title: "❌ ഡിലീറ്റ് പിശക്", variant: "destructive" }); }
                    }}
                  />
                ))}
                {students.length === 0 && <EmptyState message="വിദ്യാർത്ഥികൾ ഇല്ല" />}
              </div>
            </>
          )}
        </>
      )}
      {!selectedClass && !loading && <EmptyState message="ക്ലാസ് തിരഞ്ഞെടുക്കുക" />}
    </div>
  );
}

// ====== SUBJECT MANAGER (CLASS-BASED) ======
function SubjectManager({ toast }: { toast: any }) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => { getClasses().then(c => { setClasses(c); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const reloadSubjects = () => {
    if (!selectedClass) { setSubjects([]); return; }
    setLoading(true);
    getSubjects(selectedClass).then(s => { setSubjects(s); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(reloadSubjects, [selectedClass]);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) { toast({ title: "⚠️ പേര് ടൈപ്പ് ചെയ്യുക", variant: "destructive" }); return; }
    if (!selectedClass) { toast({ title: "⚠️ ക്ലാസ് തിരഞ്ഞെടുക്കുക", variant: "destructive" }); return; }
    setAdding(true);
    try {
      await addSubject(trimmed, selectedClass);
      setName("");
      reloadSubjects();
      toast({ title: "✅ വിഷയം ചേർത്തു" });
    } catch (err: any) {
      if (err.message === "DUPLICATE") {
        toast({ title: "⚠️ ഈ വിഷയം ഈ ക്ലാസിൽ ഇതിനകം ഉണ്ട്", variant: "destructive" });
      } else {
        toast({ title: "❌ ചേർക്കൽ പിശക്", description: err.message, variant: "destructive" });
      }
    } finally {
      setAdding(false);
    }
  };

  const className = classes.find(c => c.id === selectedClass)?.name;

  return (
    <div className="space-y-3">
      <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
      >
        <option value="">ക്ലാസ് തിരഞ്ഞെടുക്കുക</option>
        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {selectedClass && (
        <>
          <AddRow value={name} onChange={setName} onAdd={handleAdd} placeholder="വിഷയം പേര്..." loading={adding} />
          {loading ? <Loader2 className="animate-spin mx-auto text-muted-foreground" /> : (
            <>
              <SectionCount count={subjects.length} label={`${className || ""} വിഷയങ്ങൾ`} />
              <div className="space-y-2">
                {subjects.map(s => (
                  <ItemCard key={s.id} label={s.name} sublabel={className}
                    onDelete={async () => {
                      try { await deleteSubject(s.id); reloadSubjects(); toast({ title: "🗑 ഡിലീറ്റ്" }); }
                      catch { toast({ title: "❌ ഡിലീറ്റ് പിശക്", variant: "destructive" }); }
                    }}
                  />
                ))}
                {subjects.length === 0 && <EmptyState message="വിഷയങ്ങൾ ഇല്ല" />}
              </div>
            </>
          )}
        </>
      )}
      {!selectedClass && !loading && <EmptyState message="ക്ലാസ് തിരഞ്ഞെടുക്കുക" />}
    </div>
  );
}

// ====== RECORD MANAGER ======
function RecordManager({ toast }: { toast: any }) {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [classFilter, setClassFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  useEffect(() => { getClasses().then(setClasses); }, []);

  const reload = () => {
    setLoading(true);
    getRecordsByDateRange(dateFilter, dateFilter, classFilter || undefined).then(r => {
      setRecords(r.sort((a, b) => a.studentName.localeCompare(b.studentName)));
      setLoading(false);
    }).catch(() => { setLoading(false); toast({ title: "❌ ലോഡ് പിശക്", variant: "destructive" }); });
  };
  useEffect(reload, [dateFilter, classFilter]);

  const statusEmoji = (s: string) => s === "jamaat" ? "🟢" : s === "individual" ? "🟡" : "🔴";

  return (
    <div className="space-y-3">
      <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
      />
      <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
      >
        <option value="">എല്ലാ ക്ലാസുകളും</option>
        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {loading ? <Loader2 className="animate-spin mx-auto text-muted-foreground" /> : (
        <>
          <SectionCount count={records.length} label="റെക്കോർഡുകൾ" />
          <div className="space-y-2">
            {records.map(r => (
              <div key={`${r.studentId}-${r.date}`} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">{r.studentName}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{r.totalScore} pt</span>
                    <button onClick={async () => {
                      try { await deleteRecord(r.studentId, r.date); reload(); toast({ title: "🗑 ഡിലീറ്റ്" }); }
                      catch { toast({ title: "❌ ഡിലീറ്റ് പിശക്", variant: "destructive" }); }
                    }}
                      className="text-destructive p-1.5 rounded-xl hover:bg-destructive/10 transition-colors active:scale-90"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-1.5 text-[11px]">
                  {["fajr", "dhuhr", "asr", "maghrib", "isha"].map(p => (
                    <span key={p} className="flex items-center gap-0.5">
                      {statusEmoji((r as any)[p])}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {records.length === 0 && <EmptyState message="റെക്കോർഡുകൾ ഇല്ല" />}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminPanel;
