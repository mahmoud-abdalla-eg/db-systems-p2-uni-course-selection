# Database Systems - Project 2: Uni Course Selection

Uni Course Selection is a small full-stack database application for the Database Systems class. It models course selection for a teaching-administration system and enforces the three required rules:

1. Prerequisite courses must be passed before an advanced course can be selected.
2. A student may select no more than 21 credits in one semester.
3. Courses with overlapping meeting times cannot be selected together.

## Included Features

- Browse and search the course catalog.
- Filter courses by department.
- Register and sign in as a student.
- Select and drop courses.
- View the current semester schedule.
- View academic history used for prerequisite checks.
- Show clear reasons when a course cannot be selected.
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

Then open:

```text
http://localhost:5173
```

The backend runs at `http://localhost:8080/api` and exposes a health endpoint at `http://localhost:8080/api/health`.

The first run creates and seeds `src/backend/courseforge.db`. The application includes demo students in the sign-in dialog so the prerequisite, credit-limit, and schedule-conflict rules can be demonstrated quickly.

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

The relational model includes users, courses, course schedules, prerequisites, academic history, and enrollments. Enrollment and drop operations use JDBC transactions so the enrollment record and course capacity remain synchronized.
