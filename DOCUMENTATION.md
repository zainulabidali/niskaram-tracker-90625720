# 📖 നിസ്കാരം ട്രാക്കർ (Niskaram Tracker) — Complete Project Documentation

> A comprehensive guide to understanding the entire system, written for beginners.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Full Feature List](#2-full-feature-list)
3. [User Roles](#3-user-roles)
4. [Website Pages](#4-website-pages)
5. [Workflow](#5-workflow)
6. [Database Structure](#6-database-structure)
7. [Technologies Used](#7-technologies-used)
8. [Code Structure](#8-code-structure)
9. [Deployment](#9-deployment)
10. [Future Improvements](#10-future-improvements)

---

## 1. Project Overview

### Purpose

**നിസ്കാരം ട്രാക്കർ** (Niskaram Tracker) is a web application designed for **Madrasa** (Islamic educational institution) to track daily prayers (നമസ്കാരം) and study progress of students. The UI is primarily in **Malayalam** (മലയാളം).

### The Problem It Solves

In a Madrasa, Ustads (teachers) need to monitor whether students are performing their five daily prayers and completing their study subjects. Traditionally this is done on paper registers which are:
- Easy to lose
- Hard to analyze over time
- Difficult to create leaderboards or rankings from

This app digitizes the entire process, providing:
- **Real-time tracking** of each student's daily prayers
- **Automatic scoring** with points for congregational (Jamaat) vs. individual prayer
- **Leaderboards** (daily, weekly, monthly) to motivate students
- **Historical records** for review and accountability
- **Admin management** of classes, students, and subjects

### Who Uses It

| User | Description |
|------|-------------|
| **Students** | Can select their name, record their own prayer status and study completion for today/yesterday |
| **Ustads (Teachers)** | Can view history, check student records, and monitor progress via leaderboards |
| **Admin** | An authenticated user who can manage classes, students, subjects, and delete records. Has access to an admin panel. |

---

## 2. Full Feature List

### 2.1 Student Registration / Adding Students

- **How it works**: The Admin logs in and navigates to the Admin Panel → "വിദ്യാർത്ഥികൾ" (Students) tab.
- First, the admin selects a class from the dropdown.
- Then types the student's name and clicks the `+` button.
- The system checks for **duplicate names** within the same class. If a duplicate is found, it shows an error toast.
- Internally, the `addStudent()` function in `firestoreService.ts` calls `studentExistsInClass()` before writing to Firestore.

### 2.2 Recording Daily Prayers

- **5 prayers tracked**: Fajr (സുബഹ്), Dhuhr (ളുഹ്ർ), Asr (അസർ), Maghrib (മഗരിബ്), Isha (ഇഷാ)
- **3 statuses per prayer**:
  - 🟢 **Jamaat** (ജമാഅത്ത്) — Prayed in congregation → **1 point**
  - 🟡 **Individual** (തനിച്ച്) — Prayed alone → **0.5 points**
  - 🔴 **Not Prayed** (നിസ്കരിച്ചില്ല) → **0 points**
- Users tap a prayer button to open a bottom-sheet modal where they select the status.
- Maximum prayer score per day = **5 points** (all 5 prayers in Jamaat).

### 2.3 Tracking Study Subjects (Good Deeds)

- Each class can have its own set of **subjects** (e.g., Quran, Hadith, Fiqh).
- On the tracker page, after selecting prayers, students can toggle each subject as completed (✅) or not (📖).
- Each completed subject = **1 point**.
- Subject score is added to prayer score for the **total daily score**.

### 2.4 Viewing Progress — Leaderboards

- The **Home page** shows three leaderboard cards:
  - 🏆 **Today's Topper** (ഇന്നത്തെ ടോപ്പർ) — Top 6 students by today's score
  - 📅 **Weekly** (ആഴ്ചയിലെ) — Top 6 students over last 7 days
  - 📆 **Monthly** (മാസത്തിലെ) — Top 8 students over last 30 days
- Leaderboards can be **filtered by class**.
- Internally, `getLeaderboard()` aggregates scores from all `DailyRecord` documents within a date range.

### 2.5 History / Progress Review

- The **History page** lets anyone browse past records.
- Filters available: **Class**, **Date**, **Student**.
- Shows each student's record card with colored prayer status indicators and total points.
- When filtering by student, it shows all their records sorted by date (newest first).

### 2.6 Admin Features

The Admin Panel has 4 tabs:

| Tab | What it does |
|-----|-------------|
| **ക്ലാസുകൾ (Classes)** | Add/delete classes. Deleting a class also deletes all its students and subjects (batch delete). |
| **വിദ്യാർത്ഥികൾ (Students)** | Select a class, then add/delete students in that class. |
| **വിഷയങ്ങൾ (Subjects)** | Select a class, then add/delete subjects for that class. |
| **റെക്കോർഡുകൾ (Records)** | Browse and delete daily records filtered by date and class. |

### 2.7 Data Storage

- All data is stored in **Firebase Firestore** (a NoSQL cloud database).
- Data is organized into 3 main collections: `classes`, `students`, `subjects`, and `records`.
- Scores are calculated client-side and stored with each record for fast leaderboard queries.

### 2.8 Date Restrictions

- **Regular users** can only record data for **today** or **yesterday**.
- **Admin** (logged-in user) can record data for **any date**.
- This prevents students from going back and changing old records.

---

## 3. User Roles

### 3.1 Student / General User (No login required)

| Action | Allowed? |
|--------|----------|
| View leaderboards on Home page | ✅ |
| Record prayers for today/yesterday | ✅ |
| View history records | ✅ |
| Manage classes/students/subjects | ❌ |
| Delete records | ❌ |
| Edit records for dates older than yesterday | ❌ |

### 3.2 Ustad / Teacher (No login required)

Teachers use the same interface as students. They can:
- Monitor student progress via the **History** page
- View **leaderboards** filtered by class
- Help students record their prayers

> Note: There is no separate "teacher" login. Teachers simply use the public-facing pages to monitor.

### 3.3 Admin (Firebase Auth login required)

| Action | Allowed? |
|--------|----------|
| Everything a student/teacher can do | ✅ |
| Add/delete classes | ✅ |
| Add/delete students | ✅ |
| Add/delete subjects per class | ✅ |
| View and delete records | ✅ |
| Edit records for any date | ✅ |
| Access Admin Panel | ✅ |

**How admin logs in:**
1. Go to the **Profile** page (👤 പ്രൊഫൈൽ)
2. Click "🔐 Admin Sign In"
3. Enter email and password (Firebase Auth credentials)
4. On success, redirected to Admin Panel

---

## 4. Website Pages

### 4.1 Home Page (`/` → `Index.tsx`)

**Purpose**: Dashboard showing leaderboards and today's date.

**Components used**:
- `MobileLayout` — Wrapper with bottom navigation
- `RankingCard` — Reusable leaderboard component (used 3 times: daily, weekly, monthly)

**Key elements**:
- Malayalam date display with gradient card
- Class filter dropdown to filter leaderboards
- Three `RankingCard` components fetching data from Firestore
- Footer with credits

**Data flow**:
```
Page loads → getClasses() → populate filter dropdown
RankingCard mounts → getDateRangeForPeriod() → getLeaderboard() → display results
```

### 4.2 Tracker Page (`/tracker` → `Tracker.tsx` + `PrayerTracker.tsx`)

**Purpose**: The main data entry page where prayers and subjects are recorded.

**This is a 3-step wizard**:

**Step 1 — Select Class**: Shows all classes as cards. User taps one.
```
getClasses() → display class cards → user taps → setSelectedClass()
```

**Step 2 — Select Student**: Shows all students in the chosen class.
```
getStudents(classId) → display student cards → user taps → setSelectedStudent()
```

**Step 3 — Record Data**: The main tracking interface showing:
- Student header with cumulative score and trophy icon
- Circular progress indicator for today's score
- Date selector (Today / Yesterday / custom for admin)
- 5 prayer buttons with color-coded statuses
- Subject checkboxes (class-specific)
- Submit button

**Components & functions**:
- `PrayerTracker` — Main component (400 lines)
- `useAuth()` — Checks if user is admin (logged in)
- `getRecord()` — Loads existing record if student already submitted for that date
- `saveRecord()` — Saves/updates the daily record
- `getCumulativeScore()` — Fetches all-time total points for the student
- `calcTotalPrayerScore()` — Calculates prayer points
- `calcSubjectScore()` — Calculates subject completion points

### 4.3 History Page (`/history` → `History.tsx`)

**Purpose**: Browse and review past prayer records.

**Features**:
- 3 filter cards in a grid: Class, Date, Student
- Bottom-sheet picker modals for class and student selection
- Records displayed as cards with colored prayer status indicators
- Student filter only available after selecting a class

**Data flow**:
```
If student filter active → getRecordsByStudent(studentId)
Else → getRecordsByDateRange(date, date, classId?)
```

### 4.4 Profile Page (`/profile` → `Profile.tsx`)

**Purpose**: App info and admin authentication.

**Features**:
- App branding card with mosque icon
- Admin login form (email + password via Firebase Auth)
- If logged in: buttons to open Admin Panel and Logout
- Designer credits

**Components**:
- `useAuth()` — Provides `user`, `login()`, `logout()`, `loading`
- `useNavigate()` — Redirects to `/admin` after login

### 4.5 Admin Page (`/admin` → `Admin.tsx` + `AdminPanel.tsx`)

**Purpose**: Manage all system data (classes, students, subjects, records).

**Protected route**: Wrapped in `AdminRoute` component that checks `useAuth().user`. Redirects to `/profile` if not authenticated.

**Structure**: 4-tab interface (see Section 2.6 for details).

**Sub-components within `AdminPanel.tsx`**:
- `ClassManager` — CRUD for classes
- `StudentManager` — CRUD for students (class-scoped)
- `SubjectManager` — CRUD for subjects (class-scoped)
- `RecordManager` — Browse/delete records by date and class
- `AddRow` — Reusable input + add button
- `ItemCard` — Reusable card with delete button
- `EmptyState` — Shown when no data exists
- `SectionCount` — Shows count badge

### 4.6 Not Found Page (`/404` → `NotFound.tsx`)

**Purpose**: Catch-all for invalid routes. Shows a 404 message with a "Return to Home" button.

---

## 5. Workflow

### 5.1 How a Student is Added

```
Admin logs in → Profile page → Admin Panel
→ Clicks "വിദ്യാർത്ഥികൾ" tab
→ Selects a class from dropdown
→ Types student name → Clicks +
→ addStudent(name, classId) called
  → studentExistsInClass() checks for duplicates
  → If unique: addDoc() to Firestore "students" collection
  → Success toast shown
  → Student list refreshed
```

### 5.2 How Daily Prayer is Recorded

```
User opens Tracker page (/#/tracker)
→ Step 1: Selects their class
→ Step 2: Selects their name
→ Step 3: Tracking interface loads
  → getRecord(studentId, today) checks for existing record
  → If exists: pre-fills prayer statuses and subject statuses
  → User taps each prayer button → bottom sheet opens → selects status
  → User toggles subject completion checkboxes
  → Score auto-calculated: prayerScore + subjectScore = totalScore
  → User taps "സേവ് ചെയ്യുക ✨" (Save)
  → saveRecord() called
    → Calculates scores
    → setDoc() writes to Firestore "records" collection
    → Document ID format: "{studentId}_{date}" (e.g., "abc123_2026-03-10")
  → Cumulative score refreshed
  → Success toast shown
```

### 5.3 How Teachers Monitor Progress

```
Option A: Home page leaderboards
  → View daily/weekly/monthly top performers
  → Filter by class

Option B: History page
  → Select class → select date → see all records for that day
  → Or select class → select student → see all records for that student
  → Each record shows prayer status (color-coded) and total points
```

### 5.4 How Data is Stored and Retrieved

```
WRITE: saveRecord() → setDoc(doc(db, "records", "{studentId}_{date}"), recordData)
READ:  getRecord() → getDoc(doc(db, "records", "{studentId}_{date}"))
LIST:  getRecordsByDate() → query where date == targetDate
RANGE: getRecordsByDateRange() → query where date >= start AND date <= end
       → client-side filter by classId if needed (avoids composite index)
```

---

## 6. Database Structure

The database is **Firebase Firestore**, a NoSQL document database organized into **collections** containing **documents**.

### 6.1 Collections Overview

```
Firestore Database
├── classes/          (each doc = one class)
├── students/         (each doc = one student)
├── subjects/         (each doc = one subject)
└── records/          (each doc = one student's record for one day)
```

### 6.2 `classes` Collection

Each document represents a Madrasa class.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Class name | "Class 5A" |

Document ID: Auto-generated by Firestore.

**Example document**:
```json
{
  "name": "ക്ലാസ് 5"
}
```

### 6.3 `students` Collection

Each document represents a student.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Student's name | "Muhammad Ali" |
| `classId` | string | Reference to the class document ID | "abc123def456" |

**Example document**:
```json
{
  "name": "മുഹമ്മദ് അലി",
  "classId": "xYz789AbC"
}
```

### 6.4 `subjects` Collection

Each document represents a study subject assigned to a specific class.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Subject name | "Quran" |
| `classId` | string | Reference to the class document ID | "abc123def456" |

**Example document**:
```json
{
  "name": "ഖുർആൻ",
  "classId": "xYz789AbC"
}
```

### 6.5 `records` Collection

Each document represents **one student's data for one day**. The document ID is `{studentId}_{date}` (e.g., `"stu123_2026-03-10"`).

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `studentId` | string | Reference to student doc | "stu123" |
| `studentName` | string | Student's name (denormalized) | "Muhammad Ali" |
| `classId` | string | Reference to class doc | "xYz789" |
| `date` | string | Date in YYYY-MM-DD format | "2026-03-10" |
| `fajr` | string | Prayer status: "jamaat" / "individual" / "not_prayed" | "jamaat" |
| `dhuhr` | string | Same as above | "individual" |
| `asr` | string | Same as above | "not_prayed" |
| `maghrib` | string | Same as above | "jamaat" |
| `isha` | string | Same as above | "jamaat" |
| `subjects` | map | Subject ID → boolean (completed) | `{"sub1": true, "sub2": false}` |
| `prayerScore` | number | Calculated prayer points | 3.5 |
| `subjectScore` | number | Count of completed subjects | 1 |
| `totalScore` | number | prayerScore + subjectScore | 4.5 |

**Example document** (ID: `"stu123_2026-03-10"`):
```json
{
  "studentId": "stu123",
  "studentName": "മുഹമ്മദ് അലി",
  "classId": "xYz789",
  "date": "2026-03-10",
  "fajr": "jamaat",
  "dhuhr": "individual",
  "asr": "not_prayed",
  "maghrib": "jamaat",
  "isha": "jamaat",
  "subjects": {
    "subA": true,
    "subB": false
  },
  "prayerScore": 3.5,
  "subjectScore": 1,
  "totalScore": 4.5
}
```

### 6.6 Scoring Formula

```
Prayer Score:
  Jamaat     = 1.0 point
  Individual = 0.5 point
  Not prayed = 0.0 point
  Max per day = 5.0 (5 prayers × 1.0)

Subject Score:
  Each completed subject = 1 point
  Max depends on number of subjects in the class

Total Score = Prayer Score + Subject Score
```

---

## 7. Technologies Used

### 7.1 Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3 | UI library for building interactive components |
| **TypeScript** | 5.8 | Type-safe JavaScript for fewer bugs |
| **Vite** | 5.4 | Fast build tool and development server |
| **Tailwind CSS** | 3.4 | Utility-first CSS framework for rapid styling |
| **shadcn/ui** | — | Pre-built UI component library (buttons, dialogs, toasts, etc.) |
| **React Router** | 6.30 | Client-side routing (using HashRouter for GitHub Pages compatibility) |
| **TanStack React Query** | 5.83 | Data fetching and caching (available but currently using direct Firestore calls) |
| **Lucide React** | 0.462 | Icon library |
| **date-fns** | 3.6 | Date formatting utilities |
| **Recharts** | 2.15 | Charting library (available for future analytics features) |

### 7.2 Backend / Database

| Technology | Purpose |
|-----------|---------|
| **Firebase Firestore** | NoSQL cloud database for storing all app data |
| **Firebase Auth** | Email/password authentication for admin access |

**Why Firebase?**
- **No server needed**: Firestore is accessed directly from the browser
- **Real-time capable**: Can add real-time listeners in the future
- **Free tier**: Generous free quota for small Madrasa usage
- **Simple setup**: No SQL, no schemas, just write JSON documents

### 7.3 Fonts

| Font | Usage |
|------|-------|
| **Noto Sans Malayalam** | Body text (Malayalam language support) |
| **Amiri** | Display/heading font (Arabic/Islamic aesthetic) |

### 7.4 Hosting

| Platform | Purpose |
|---------|---------|
| **GitHub Pages** | Free static site hosting |
| **GitHub Actions** | Automated build and deploy pipeline |

---

## 8. Code Structure

### 8.1 Folder Structure

```
project-root/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD pipeline
├── public/
│   ├── 404.html                # SPA fallback for GitHub Pages
│   ├── favicon.ico             # Browser tab icon
│   ├── placeholder.svg         # Placeholder image
│   └── robots.txt              # SEO crawling rules
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components (button, card, toast, etc.)
│   │   ├── AdminPanel.tsx      # Admin management interface (380 lines)
│   │   ├── BottomNav.tsx       # Bottom navigation bar
│   │   ├── MobileLayout.tsx    # Mobile-first page wrapper
│   │   ├── NavLink.tsx         # Navigation link component
│   │   ├── PrayerTracker.tsx   # Main prayer tracking form (400 lines)
│   │   └── RankingCard.tsx     # Leaderboard card component
│   ├── contexts/
│   │   └── AuthContext.tsx     # Firebase Auth state management
│   ├── hooks/
│   │   ├── use-mobile.tsx      # Mobile detection hook
│   │   └── use-toast.ts        # Toast notification hook
│   ├── lib/
│   │   ├── firebase.ts         # Firebase initialization
│   │   ├── firestoreService.ts # All database operations (278 lines)
│   │   └── utils.ts            # Utility functions (cn() for classnames)
│   ├── pages/
│   │   ├── Admin.tsx           # Admin page wrapper
│   │   ├── History.tsx         # History/records browser page
│   │   ├── Index.tsx           # Home page with leaderboards
│   │   ├── NotFound.tsx        # 404 page
│   │   ├── Profile.tsx         # Profile and admin login page
│   │   └── Tracker.tsx         # Prayer tracker page wrapper
│   ├── App.tsx                 # Root component with routing
│   ├── App.css                 # Additional styles
│   ├── index.css               # Tailwind + design tokens + fonts
│   └── main.tsx                # React entry point
├── index.html                  # HTML shell
├── package.json                # Dependencies
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript config
└── vite.config.ts              # Vite build config
```

### 8.2 Important Files Explained

#### `src/lib/firebase.ts` — Firebase Setup
```typescript
// Initializes Firebase app with project config
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);   // Database instance
export const auth = getAuth(app);      // Auth instance
```

#### `src/lib/firestoreService.ts` — All Database Operations
This is the **data layer** of the application. Key functions:

| Function | Purpose |
|----------|---------|
| `getClasses()` | Fetch all classes |
| `addClass(name)` | Add a new class (with duplicate check) |
| `deleteClass(id)` | Delete class + its students + subjects (batch) |
| `getStudents(classId)` | Fetch students, optionally filtered by class |
| `addStudent(name, classId)` | Add student (with duplicate check) |
| `getSubjects(classId)` | Fetch subjects for a class |
| `saveRecord(record)` | Save/update a daily record (auto-calculates scores) |
| `getRecord(studentId, date)` | Get one student's record for a specific date |
| `getRecordsByDateRange()` | Query records within a date range |
| `getLeaderboard()` | Aggregate scores and return top N students |
| `getCumulativeScore()` | Sum all-time total score for a student |
| `calcPrayerScore(status)` | Convert status to points (1, 0.5, or 0) |
| `isEditableDate(date, isAdmin)` | Check if a date can be edited |

#### `src/contexts/AuthContext.tsx` — Authentication
Provides a React Context with:
- `user` — Current Firebase user (null if not logged in)
- `loading` — Auth state loading indicator
- `login(email, password)` — Sign in with Firebase Auth
- `logout()` — Sign out

#### `src/App.tsx` — Routing
Uses `HashRouter` (URLs like `/#/tracker`) for GitHub Pages compatibility.

```
/          → Index (Home)
/tracker   → Tracker (Prayer recording)
/history   → History (Records browser)
/profile   → Profile (Login/info)
/admin     → Admin (Protected, requires auth)
*          → NotFound (404)
```

### 8.3 How Frontend Connects to Database

```
React Component
    ↓ calls
firestoreService.ts function (e.g., saveRecord())
    ↓ uses
Firebase SDK (setDoc, getDocs, query, where...)
    ↓ communicates with
Firebase Firestore Cloud Database
    ↓ returns
Data (documents/snapshots)
    ↓ mapped to
TypeScript types (ClassData, StudentData, DailyRecord, etc.)
    ↓ rendered by
React Component (via useState)
```

### 8.4 Design System

The app uses a **green + gold** Islamic-themed color palette defined in `src/index.css`:

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--primary` | `160 45% 30%` | Deep green — buttons, active states |
| `--secondary` | `38 50% 52%` | Gold — student icons, study tracking |
| `--accent` | `38 55% 48%` | Gold accent — leaderboard scores |
| `--background` | `150 20% 97%` | Light cream background |
| `--destructive` | `0 72% 51%` | Red — delete buttons, errors |

Dark mode is also supported via the `.dark` class.

---

## 9. Deployment

### 9.1 Hosting Platform

The app is hosted on **GitHub Pages** — a free static hosting service provided by GitHub.

### 9.2 Build Process

The build is automated via **GitHub Actions** (`.github/workflows/deploy.yml`):

```
1. Developer pushes code to `main` branch
2. GitHub Actions triggers automatically
3. Pipeline steps:
   a. Checkout code
   b. Setup Node.js 20
   c. Run `npm install --legacy-peer-deps`
   d. Run `npm run build` (Vite compiles React → static files in `dist/`)
   e. Upload `dist/` folder as GitHub Pages artifact
4. Deploy job publishes the artifact to GitHub Pages
```

### 9.3 Build Output

```
npm run build
→ Vite compiles TypeScript + React + Tailwind CSS
→ Output: dist/
   ├── index.html          (main HTML file)
   ├── assets/
   │   ├── index-XXXX.js   (bundled JavaScript)
   │   └── index-XXXX.css  (bundled CSS)
   └── 404.html            (SPA fallback)
```

### 9.4 SPA Routing on GitHub Pages

GitHub Pages only serves static files. For client-side routing:
- The app uses `HashRouter` so all routes are after `#` (e.g., `site.com/#/tracker`)
- `public/404.html` provides a fallback redirect for direct URL access
- `index.html` includes a script to decode redirected URLs

### 9.5 Vite Configuration

```typescript
// vite.config.ts
base: './'  // Relative paths so assets load correctly on any subdomain
```

### 9.6 GitHub Pages Setup

1. Go to GitHub repo → **Settings** → **Pages**
2. Set Source to **"GitHub Actions"** (not "Deploy from a branch")
3. Push to `main` branch to trigger deployment

---

## 10. Future Improvements

### High Priority

1. **Real-time updates** — Use Firestore `onSnapshot()` listeners instead of one-time `getDocs()` so leaderboards update live without page refresh.

2. **Individual student login** — Allow each student to have their own login so they can only edit their own records. Currently any user can record for any student.

3. **Push notifications** — Remind students to record their prayers before the day ends.

4. **Offline support** — Use Firebase offline persistence so the app works without internet and syncs when connected.

### Medium Priority

5. **Analytics dashboard** — Use Recharts (already installed) to show:
   - Prayer completion trends over time
   - Class-wise comparison charts
   - Individual student progress graphs

6. **Export to PDF/Excel** — Allow admins to download reports for meetings with parents.

7. **Multiple admin roles** — Separate "Ustad" role with limited admin access (can record for their class only, can't delete other classes).

8. **Attendance tracking** — Add a simple present/absent feature alongside prayer tracking.

### Low Priority

9. **Gamification** — Badges, streaks, achievement unlocks to motivate students.

10. **Parent portal** — Allow parents to view their child's progress with a unique link.

11. **Multi-language support** — Add English/Arabic UI toggle alongside Malayalam.

12. **PWA (Progressive Web App)** — Add a service worker and manifest so the app can be installed on phones like a native app.

13. **Dark mode toggle** — The CSS already supports dark mode. Add a toggle button in the profile page.

---

## Summary

The Niskaram Tracker is a focused, mobile-first web app that solves a real problem for Madrasa institutions. It uses a modern frontend stack (React + Vite + Tailwind) with Firebase as a serverless backend, making it simple to develop and free to host. The codebase is organized into clear pages, components, and a centralized data service layer, making it easy to maintain and extend.

---

*Documentation generated for Niskaram Tracker v2.0*
*Designed by [Zainul Abid Himami](https://instagram.com/zainul_abid_himami)*
