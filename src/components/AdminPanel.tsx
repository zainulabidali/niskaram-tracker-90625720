import { useState, useEffect } from "react";
import {
  getClasses, addClass, deleteClass,
  getStudents, addStudent, deleteStudent,
  getSubjects, addSubject, deleteSubject,
  getRecordsByDateRange, deleteRecord,
  type ClassData, type StudentData, type SubjectData, type DailyRecord,
} from "@/lib/firestoreService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Users, BookOpen, GraduationCap, ClipboardList } from "lucide-react";

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

      {/* Tab Bar */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-2xl">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center gap-0.5 ${
              tab === t.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <t.icon size={14} />
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

// ====== CLASS MANAGER ======
function ClassManager({ toast }: { toast: any }) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = () => { setLoading(true); getClasses().then(c => { setClasses(c); setLoading(false); }); };
  useEffect(reload, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addClass(name.trim());
    setName("");
    reload();
    toast({ title: "✅ ക്ലാസ് ചേർത്തു" });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="ക്ലാസ് പേര്..."
          className="flex-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
          onKeyDown={e => e.key === "Enter" && handleAdd()}
        />
        <button onClick={handleAdd} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm">
          <Plus size={16} />
        </button>
      </div>
      {loading ? <Loader2 className="animate-spin mx-auto text-muted-foreground" /> : (
        <div className="space-y-2">
          {classes.map(c => (
            <div key={c.id} className="flex items-center justify-between rounded-2xl border border-border bg-card/80 p-3 shadow-sm">
              <span className="text-sm font-semibold">{c.name}</span>
              <button onClick={async () => { await deleteClass(c.id); reload(); toast({ title: "🗑 ഡിലീറ്റ് ചെയ്തു" }); }}
                className="text-destructive p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 size={14} /></button>
            </div>
          ))}
          {classes.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">ക്ലാസുകൾ ഇല്ല</p>}
        </div>
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

  useEffect(() => { getClasses().then(c => { setClasses(c); setLoading(false); }); }, []);
  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      getStudents(selectedClass).then(s => { setStudents(s); setLoading(false); });
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  const handleAdd = async () => {
    if (!name.trim() || !selectedClass) return;
    await addStudent(name.trim(), selectedClass);
    setName("");
    getStudents(selectedClass).then(setStudents);
    toast({ title: "✅ വിദ്യാർത്ഥി ചേർത്തു" });
  };

  return (
    <div className="space-y-3">
      <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
      >
        <option value="">ക്ലാസ് തിരഞ്ഞെടുക്കുക</option>
        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {selectedClass && (
        <div className="flex gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="വിദ്യാർത്ഥി പേര്..."
            className="flex-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
            onKeyDown={e => e.key === "Enter" && handleAdd()}
          />
          <button onClick={handleAdd} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm">
            <Plus size={16} />
          </button>
        </div>
      )}

      {loading ? <Loader2 className="animate-spin mx-auto text-muted-foreground" /> : (
        <div className="space-y-2">
          {students.map(s => (
            <div key={s.id} className="flex items-center justify-between rounded-2xl border border-border bg-card/80 p-3 shadow-sm">
              <span className="text-sm">{s.name}</span>
              <button onClick={async () => { await deleteStudent(s.id); getStudents(selectedClass).then(setStudents); toast({ title: "🗑 ഡിലീറ്റ്" }); }}
                className="text-destructive p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 size={14} /></button>
            </div>
          ))}
          {students.length === 0 && selectedClass && <p className="text-center text-xs text-muted-foreground py-4">വിദ്യാർത്ഥികൾ ഇല്ല</p>}
        </div>
      )}
    </div>
  );
}

// ====== SUBJECT MANAGER ======
function SubjectManager({ toast }: { toast: any }) {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = () => { setLoading(true); getSubjects().then(s => { setSubjects(s); setLoading(false); }); };
  useEffect(reload, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addSubject(name.trim());
    setName("");
    reload();
    toast({ title: "✅ വിഷയം ചേർത്തു" });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="വിഷയം പേര്..."
          className="flex-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
          onKeyDown={e => e.key === "Enter" && handleAdd()}
        />
        <button onClick={handleAdd} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm">
          <Plus size={16} />
        </button>
      </div>
      {loading ? <Loader2 className="animate-spin mx-auto text-muted-foreground" /> : (
        <div className="space-y-2">
          {subjects.map(s => (
            <div key={s.id} className="flex items-center justify-between rounded-2xl border border-border bg-card/80 p-3 shadow-sm">
              <span className="text-sm font-semibold">{s.name}</span>
              <button onClick={async () => { await deleteSubject(s.id); reload(); toast({ title: "🗑 ഡിലീറ്റ്" }); }}
                className="text-destructive p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 size={14} /></button>
            </div>
          ))}
          {subjects.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">വിഷയങ്ങൾ ഇല്ല</p>}
        </div>
      )}
    </div>
  );
}

// ====== RECORD MANAGER ======
function RecordManager({ toast }: { toast: any }) {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    getRecordsByDateRange(dateFilter, dateFilter).then(r => {
      setRecords(r.sort((a, b) => a.studentName.localeCompare(b.studentName)));
      setLoading(false);
    });
  };
  useEffect(reload, [dateFilter]);

  const statusEmoji = (s: string) => s === "jamaat" ? "🟢" : s === "individual" ? "🟡" : "🔴";

  return (
    <div className="space-y-3">
      <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
      />
      {loading ? <Loader2 className="animate-spin mx-auto text-muted-foreground" /> : (
        <div className="space-y-2">
          {records.map(r => (
            <div key={`${r.studentId}-${r.date}`} className="rounded-2xl border border-border bg-card/80 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">{r.studentName}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{r.totalScore}pt</span>
                  <button onClick={async () => { await deleteRecord(r.studentId, r.date); reload(); toast({ title: "🗑 ഡിലീറ്റ്" }); }}
                    className="text-destructive p-1 rounded-lg hover:bg-destructive/10"><Trash2 size={12} /></button>
                </div>
              </div>
              <div className="flex gap-1 text-[10px]">
                {["fajr", "dhuhr", "asr", "maghrib", "isha"].map(p => (
                  <span key={p}>{statusEmoji((r as any)[p])}</span>
                ))}
              </div>
            </div>
          ))}
          {records.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">റെക്കോർഡുകൾ ഇല്ല</p>}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
