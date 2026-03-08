import { db } from "@/lib/firebase";
import {
  collection, doc, getDocs, getDoc, setDoc, deleteDoc, updateDoc,
  query, where, orderBy, addDoc, writeBatch
} from "firebase/firestore";

// ====== TYPES ======

export type ClassData = {
  id: string;
  name: string;
};

export type StudentData = {
  id: string;
  name: string;
  classId: string;
};

export type SubjectData = {
  id: string;
  name: string;
};

// Prayer status: 'jamaat' | 'individual' | 'not_prayed'
export type PrayerStatus = "jamaat" | "individual" | "not_prayed";

export type DailyRecord = {
  studentId: string;
  studentName: string;
  classId: string;
  date: string; // YYYY-MM-DD
  fajr: PrayerStatus;
  dhuhr: PrayerStatus;
  asr: PrayerStatus;
  maghrib: PrayerStatus;
  isha: PrayerStatus;
  subjects: Record<string, boolean>; // subjectId -> completed
  prayerScore: number;
  subjectScore: number;
  totalScore: number;
};

export const PRAYERS = [
  { id: "fajr", label: "സുബഹ്", labelEn: "Fajr" },
  { id: "dhuhr", label: "ളുഹ്ർ", labelEn: "Dhuhr" },
  { id: "asr", label: "അസർ", labelEn: "Asr" },
  { id: "maghrib", label: "മഗരിബ്", labelEn: "Maghrib" },
  { id: "isha", label: "ഇഷാ", labelEn: "Isha" },
] as const;

// ====== SCORING ======

export function calcPrayerScore(status: PrayerStatus): number {
  if (status === "jamaat") return 1;
  if (status === "individual") return 0.5;
  return 0;
}

export function calcTotalPrayerScore(record: Pick<DailyRecord, "fajr" | "dhuhr" | "asr" | "maghrib" | "isha">): number {
  return (
    calcPrayerScore(record.fajr) +
    calcPrayerScore(record.dhuhr) +
    calcPrayerScore(record.asr) +
    calcPrayerScore(record.maghrib) +
    calcPrayerScore(record.isha)
  );
}

export function calcSubjectScore(subjects: Record<string, boolean>): number {
  return Object.values(subjects).filter(Boolean).length;
}

// ====== DATE HELPERS ======

export function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function isEditableDate(dateStr: string, isAdmin: boolean): boolean {
  if (isAdmin) return true;
  const today = getTodayStr();
  const yesterday = getYesterdayStr();
  return dateStr === today || dateStr === yesterday;
}

// ====== CLASSES CRUD ======

export async function getClasses(): Promise<ClassData[]> {
  const snap = await getDocs(collection(db, "classes"));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<ClassData, 'id'>) }));
}

export async function addClass(name: string): Promise<string> {
  const docRef = await addDoc(collection(db, "classes"), { name });
  return docRef.id;
}

export async function deleteClass(id: string): Promise<void> {
  // Also delete students in this class
  const studentsSnap = await getDocs(query(collection(db, "students"), where("classId", "==", id)));
  const batch = writeBatch(db);
  studentsSnap.docs.forEach(d => batch.delete(d.ref));
  batch.delete(doc(db, "classes", id));
  await batch.commit();
}

// ====== STUDENTS CRUD ======

export async function getStudents(classId?: string): Promise<StudentData[]> {
  let q;
  if (classId) {
    q = query(collection(db, "students"), where("classId", "==", classId));
  } else {
    q = collection(db, "students");
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<StudentData, 'id'>) }));
}

export async function addStudent(name: string, classId: string): Promise<string> {
  const docRef = await addDoc(collection(db, "students"), { name, classId });
  return docRef.id;
}

export async function deleteStudent(id: string): Promise<void> {
  await deleteDoc(doc(db, "students", id));
}

// ====== SUBJECTS CRUD ======

export async function getSubjects(): Promise<SubjectData[]> {
  const snap = await getDocs(collection(db, "subjects"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SubjectData));
}

export async function addSubject(name: string): Promise<string> {
  const docRef = await addDoc(collection(db, "subjects"), { name });
  return docRef.id;
}

export async function deleteSubject(id: string): Promise<void> {
  await deleteDoc(doc(db, "subjects", id));
}

// ====== DAILY RECORDS ======

function recordDocId(studentId: string, date: string) {
  return `${studentId}_${date}`;
}

export async function saveRecord(record: DailyRecord): Promise<void> {
  const id = recordDocId(record.studentId, record.date);
  record.prayerScore = calcTotalPrayerScore(record);
  record.subjectScore = calcSubjectScore(record.subjects);
  record.totalScore = record.prayerScore + record.subjectScore;
  await setDoc(doc(db, "records", id), record);
}

export async function getRecord(studentId: string, date: string): Promise<DailyRecord | null> {
  const snap = await getDoc(doc(db, "records", recordDocId(studentId, date)));
  return snap.exists() ? (snap.data() as DailyRecord) : null;
}

export async function getRecordsByDate(date: string): Promise<DailyRecord[]> {
  const q = query(collection(db, "records"), where("date", "==", date));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as DailyRecord);
}

export async function getRecordsByStudent(studentId: string): Promise<DailyRecord[]> {
  const q = query(collection(db, "records"), where("studentId", "==", studentId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as DailyRecord);
}

export async function getRecordsByDateRange(startDate: string, endDate: string, classId?: string): Promise<DailyRecord[]> {
  let q;
  if (classId) {
    q = query(
      collection(db, "records"),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      where("classId", "==", classId)
    );
  } else {
    q = query(
      collection(db, "records"),
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as DailyRecord);
}

export async function deleteRecord(studentId: string, date: string): Promise<void> {
  await deleteDoc(doc(db, "records", recordDocId(studentId, date)));
}

// ====== LEADERBOARD ======

export type LeaderEntry = { studentName: string; studentId: string; classId: string; totalScore: number };

export async function getLeaderboard(
  startDate: string,
  endDate: string,
  topN: number,
  classId?: string
): Promise<LeaderEntry[]> {
  const records = await getRecordsByDateRange(startDate, endDate, classId);
  const scores: Record<string, LeaderEntry> = {};

  for (const r of records) {
    if (!scores[r.studentId]) {
      scores[r.studentId] = { studentName: r.studentName, studentId: r.studentId, classId: r.classId, totalScore: 0 };
    }
    scores[r.studentId].totalScore += r.totalScore;
  }

  return Object.values(scores)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, topN);
}

export function getDateRangeForPeriod(period: "daily" | "weekly" | "monthly"): { start: string; end: string } {
  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  let start: string;

  if (period === "daily") {
    start = end;
  } else if (period === "weekly") {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    start = d.toISOString().slice(0, 10);
  } else {
    const d = new Date(today);
    d.setDate(d.getDate() - 29);
    start = d.toISOString().slice(0, 10);
  }

  return { start, end };
}
