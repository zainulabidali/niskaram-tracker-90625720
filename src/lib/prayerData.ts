// Student data organized by class and gender
export const allStudents: Record<string, string[]> = {
  students3Male: ['Ibrahim Bathisha', 'Muhammed SM', 'Abdulla MA', 'Muhammed Javad MA', 'Nasrul Azman', 'Muhammed Musthafa', 'Kubaib', 'Muhammed Swalih', 'Abdulla Mirshad', 'Muhammed Saeed', 'Zakwan', 'Adham Abdulla'],
  students3Female: ['Ayshath Muneeba', 'Maryam CA', 'Maryam Zahra', 'Maryam Ahmed Naseer', 'Fathimath Shifa', 'Rifa Fathima', 'Ayshath Shaza', 'Shama Fathima', 'Fathimath Shanza Mahzin', 'Maryam Mehk'],

  students4Male: ['Ahmed anas', 'Muhammed shameem', 'Muhammed razik', 'Hisham', 'Muhammed Ihsan', 'Abdull adhil', 'Ibrahim zaman', 'Ahmed kabeer rifayi', 'Muhammed swalih', 'Ahmed nabeel', 'Zaid Abdullah', 'Faz Rahman', 'Ahmed anas s', 'Muhammed fadhal', 'Muhammed faz', 'Abdullah', 'Yusuf', 'Abdull sesan', 'Muhammed Shamil', 'Ahmed misthah', 'Abdullah aflah'],
  students4Female: ['Aysha', 'Aysha lazima', 'Aysha shifana', 'Nafeesath laza', 'Fathimath rizna', 'Zahra Fathima', 'Fathima M'],

  students5Male: ['AHMED SHAMIL BK', 'IBRAHIM SAIS CM', 'MUHAMMED FAYIZ BN', 'MUHAMMED ADIL', 'MUHAMMED SHAMMAS S', 'MOIDEEN SHAZ', 'MUHAMMED JAZEEL', 'ABOOBACKAR SIDDIQUE UM', 'MUHAMMED SHAZIM', 'MUHAMMED SHAMMAS M', 'ZAHID ABBAS AA'],
  students5Female: ['FATHIMA FIDA', 'FATHIMA NOUFEERA KN', 'AYSHA ZAMA MARZIN', 'MARIYAM FABNAZ MA', 'NAFEESATH RIZA KH', 'FATHIMATH ZAKIYYA', 'KADEEJA HADIYA KA', 'AYSHA NOON TK', 'FATHIMA DILNA', 'ASIYA MA', 'AYSHATH RAHEEMA', 'AYSHATH IZHA', 'FATHIMATH FAHEEMA NA', 'FATHIMA CK', 'SHEZA FATHIMA PS', 'FATHIMA FALAQ CA'],

  students6Male: ['MUHAMMED SIBLI', 'ABDUL RAHMAN JAVAD', 'RAMEEM ABOOBAKAR', 'LUKMANUL HAKEEM', 'ABDUL KADER ZIDAN', 'MUHAMMED MISBAH', 'ABDUL KADAR MIDLAJ', 'MUHAMMED AJAS', 'SAMMAS ABDULLA', 'AHMAD AJLAL', 'ABDULLA KS', 'ABDUL MAZHAR', 'MUHEENUDEEN SAHAD', 'MUHAMMED SAFI', 'FARHAN ABDULLA', 'ZAYD', 'ZIYAD', 'MUHAMMED ZAYAN', 'NASHITH MUHAMMED', 'ZAHID MUBARAK'],
  students6Female: ['FAHIMA CS', 'FARISA', 'AYSHA S', 'FATHIMA', 'FATHIMATH MUNAZAHA', 'AYSHATH DIYA', 'MARIYAM RUSHDA', 'FATHIMA KA', 'FATHIMATH SAFLA', 'AYISHATH RUSHDA', 'NAFEESATH MISRIYA', 'AYSHATH ZABA', 'RASHA FATHIMA', 'AYSHATH AFREENA', 'SHAMSEERA'],

  students7Male: ['Moideen Muzammil', 'Muhammed Ajmal', 'Muhammed', 'Muhammed Anwer', 'Ahmed razeen', 'Muhammed Ameen', 'Abdull vahidh', 'Abdullah Sa-ad', 'Muhammed lamih', 'Moideen Sayan', 'Abubakar swahah', 'Midlaj Abdullah', 'Muhammed Anas'],
  students7Female: ['Fathima razeena', 'Ayshath hana', 'Fathimath sana', 'Ameena Fathima', 'Ayshath jumana', 'Raza rukiya', 'Fathima mufreena', 'zainaba farhana', 'Maryam farha', 'Hala Fathima', 'Fathima CH'],

  students8Male: ['SWALIH MUHAZ K.M', 'SOOFI NIHAL T.A', 'MUHAMMED NABEEL E.A', 'MUHYUDHEEN MUBASHIR T.M', 'NIDHAL ABDULLA', 'AYMAN C.A', 'HAMID A.A', 'ABDULLA ANSAF M.M', 'ABDUL KHADER MIKFAR K.M', 'MUHAMMED SHINAS'],
  students8Female: ['FATHIMA C.I', 'FATHIMA U.M', 'FATHIMA NAJA C.A', 'FATHIMA E.A', 'AYSHATH FAZNA D.A', 'FATHIMA NOOHA T.H'],

  students9Male: ['SHUHAIM', 'ABDULLA AFEEF', 'ABDULLA FAHZIN', 'MUHAMMED RISHAL', 'AHMED SHAMMAS'],
  students9Female: ['ZAINABATH FAHIMA', 'AYSHATH ASNA', 'FATHIMA FIDHA', 'NADEEMA', 'FATHIMA RUKIYA', 'AYSHATH SAFLA', 'SHAZA MARIYAM', 'AYSHATH AFNA'],

  students10Male: ['ABDULLA ASHIQ', 'ABDULLA', 'MOIDHEEN'],
  students10Female: ['NAFEESATH NASBA', 'FATHIMATH THASLEEMA', 'NAFEESATH AMNA', 'NAFEESATH HAFIZA', 'AYSHA BEEVI', 'FATHIMA', 'SHAHZIYA'],
};

export const PRAYERS = [
  { id: 'fajr', label: 'സുബഹ്', labelEn: 'Fajr' },
  { id: 'dhuhr', label: 'ളുഹ്ർ', labelEn: 'Dhuhr' },
  { id: 'asr', label: 'അസർ', labelEn: 'Asr' },
  { id: 'maghrib', label: 'മഗരിബ്', labelEn: 'Maghrib' },
  { id: 'isha', label: 'ഇഷാ', labelEn: 'Isha' },
] as const;

export const CLASSES = ['3', '4', '5', '6', '7', '8', '9', '10'];

export type PrayerEntry = {
  name: string;
  class: string;
  gender: string;
  date: string;
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  score: number;
};

export function getStudents(classNum: string, gender: string): string[] {
  const key = `students${classNum}${gender.charAt(0).toUpperCase() + gender.slice(1)}`;
  return allStudents[key] || [];
}

export function getPrayerData(): Record<string, Record<string, PrayerEntry>> {
  const raw = localStorage.getItem('prayerData');
  return raw ? JSON.parse(raw) : {};
}

export function savePrayerEntry(entry: PrayerEntry) {
  const data = getPrayerData();
  if (!data[entry.date]) data[entry.date] = {};
  data[entry.date][entry.name] = entry;
  localStorage.setItem('prayerData', JSON.stringify(data));
}

export function deletePrayerEntry(date: string, name: string) {
  const data = getPrayerData();
  if (data[date]) {
    delete data[date][name];
    if (Object.keys(data[date]).length === 0) delete data[date];
  }
  localStorage.setItem('prayerData', JSON.stringify(data));
}

export function getTopPerformers(
  days: number,
  topN: number,
  classFilter?: string
): { name: string; score: number }[] {
  const data = getPrayerData();
  const scores: Record<string, number> = {};

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayData = data[dateStr];
    if (!dayData) continue;

    for (const name in dayData) {
      const entry = dayData[name];
      if (!classFilter || entry.class === classFilter) {
        scores[name] = (scores[name] || 0) + (entry.score || 0);
      }
    }
  }

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([name, score]) => ({ name, score }));
}
