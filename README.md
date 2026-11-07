# University Course Selection

University Course Selection is a small full-stack database application for the Database Systems class. It models the course-selection part of a teaching-administration system and enforces the three rules required by the Project 2 specification:

1. Prerequisite courses must be passed before an advanced course can be selected.
2. A student may select no more than 21 credits in one semester.
3. Courses with overlapping meeting times cannot be selected together.

## Included Features

- Register and sign in from the first screen as a student.
- Browse all open courses, including courses from other majors and general electives.
- Search and filter by department, meeting day, and credit value, including 0.5- and 1-credit courses.
- View courses recommended for the student's major and current semester.
- View a major curriculum with degree progress, year sections, completed courses, selected courses, and later requirements.
- Select and drop courses while keeping each student's selection separate.
- View the current semester timetable.
- See the current semester, study year, selected credits, and remaining credits in one compact bar.
- Show clear reasons when a course cannot be selected.
- Use a floating workspace navigation for Courses, My Selection, Timetable, and Rules.
- Run the database locally with an embedded SQLite database.
- Keep a MySQL-compatible schema and seed script in `src/database/`.

## Project Structure

```text
CST_DBS_P2_MahmoudAhmed/
├── doc/
│   ├── README.md
│   └── USAGE_GUIDE.md
├── run/
│   ├── run-backend.bat
│   ├── run-frontend.bat
│   ├── start-all.bat
│   └── start-all.ps1
└── src/
    ├── backend/
    │   ├── lib/                 # Bundled JDBC and JSON libraries
    │   ├── src/main/java/       # Java REST API and database layer
    │   └── pom.xml
    ├── database/
    │   ├── schema_mysql.sql
    │   └── seed_data.sql
    └── frontend/
        ├── src/                 # React interface
        ├── package.json
        ├── package-lock.json
        └── vite.config.js
```

Generated files are intentionally excluded: `courseforge.db`, Java `bin/` and `target/`, frontend `node_modules/` and `dist/`, and submission archives.

## Requirements

- Java JDK 17 or newer.
- Node.js and npm.
- Windows.

The default setup uses SQLite, so a separate database server is not required for the demonstration. The backend can also use MySQL through the `DB_URL`, `DB_USER`, and `DB_PASSWORD` environment variables.

## Run the Application

From the project folder, use:

```powershell
.\run\start-all.ps1
```

Or double-click:

```text
run\start-all.bat
```

The launcher starts the backend and frontend in separate windows. On the first run, it installs the frontend dependencies automatically if Vite is not available.

Then open:

```text
http://localhost:5173
```

The backend runs at `http://localhost:8080/api` and exposes a health endpoint at `http://localhost:8080/api/health`.

The first run creates and seeds `src/backend/courseforge.db`. The application opens on a sign-in/register page and includes demo students so the prerequisite, credit-limit, and schedule-conflict rules can be demonstrated quickly. The demo accounts represent students at different stages of their degree, while new registrations receive a 2026-cohort student number and start with no previous-course history.

## Manual Run

Backend:

```powershell
cd src/backend
javac -encoding UTF-8 -cp "lib/*" -d bin src/main/java/com/courseforge/Main.java src/main/java/com/courseforge/model/Models.java src/main/java/com/courseforge/server/ApiServer.java src/main/java/com/courseforge/server/AuthService.java src/main/java/com/courseforge/server/Json.java src/main/java/com/courseforge/store/Database.java src/main/java/com/courseforge/store/SeedData.java
java -cp "bin;lib/*" com.courseforge.Main
```

Frontend, in a second terminal:

```powershell
cd src/frontend
npm install
npm run dev
```

## Database Design

The relational model includes users, courses, course schedules, prerequisites, academic history, and enrollments. Course credits use decimal values so half-credit courses are supported. Enrollment and drop operations use JDBC transactions so the enrollment record and course capacity remain synchronized.

## Submission Contents

The assignment specification does not require a separate formal report. The required archive is organized as:

```text
src/   application source code, frontend, backend, and SQL resources
run/   runnable launch scripts
doc/   concise usage and architecture documentation
```

The concise guide in `doc/USAGE_GUIDE.md` records the database model, launch steps, demo accounts, and verification scenarios. No extra report file is needed unless the instructor requests one separately.
