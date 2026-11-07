package com.courseforge.store;

import com.courseforge.model.Models.*;

import java.sql.*;
import java.util.*;

/**
 * Relational JDBC Database Manager for CourseForge.
 * Enforces the 3 Core Business Constraints:
 * 1. Prerequisite verification
 * 2. Credit ceiling (<= 21 credits)
 * 3. Schedule collision / time conflict prevention
 */
public class Database {

    private final String dbUrl;
    private final String dbUser;
    private final String dbPassword;
    private final boolean isMySQL;

    public Database() {
        String envUrl = System.getenv("DB_URL");
        if (envUrl != null && !envUrl.isEmpty()) {
            this.dbUrl = envUrl;
            this.dbUser = System.getenv("DB_USER") != null ? System.getenv("DB_USER") : "root";
            this.dbPassword = System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : "";
            this.isMySQL = envUrl.toLowerCase().contains("mysql");
        } else {
            // Default to zero-config relational SQLite file database
            this.dbUrl = "jdbc:sqlite:courseforge.db";
            this.dbUser = "";
            this.dbPassword = "";
            this.isMySQL = false;
        }

        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException ignored) {}
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException ignored) {}
    }

    public Connection getConnection() throws SQLException {
        if (isMySQL) {
            return DriverManager.getConnection(dbUrl, dbUser, dbPassword);
        } else {
            return DriverManager.getConnection(dbUrl);
        }
    }

    public void initialize() throws SQLException {
        try (Connection conn = getConnection(); Statement stmt = conn.createStatement()) {
            if (isMySQL) {
                // Ensure foreign key constraints are on in MySQL
                stmt.execute("SET foreign_key_checks = 1;");
            } else {
                // Enable foreign keys for SQLite
                stmt.execute("PRAGMA foreign_keys = ON;");
            }

            // Create tables with standard relational SQL
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_no VARCHAR(20) NOT NULL UNIQUE,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(100) NOT NULL,
                    major VARCHAR(100) NOT NULL,
                    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """);

            stmt.execute("""
                CREATE TABLE IF NOT EXISTS courses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    course_code VARCHAR(20) NOT NULL UNIQUE,
                    title VARCHAR(150) NOT NULL,
                    department VARCHAR(100) NOT NULL,
                    credits INTEGER NOT NULL,
                    capacity INTEGER NOT NULL DEFAULT 40,
                    enrolled_count INTEGER NOT NULL DEFAULT 0,
                    instructor VARCHAR(100) NOT NULL,
                    semester VARCHAR(20) NOT NULL DEFAULT '2026-Fall',
                    description TEXT
                );
            """);

            stmt.execute("""
                CREATE TABLE IF NOT EXISTS course_schedules (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    course_id INTEGER NOT NULL,
                    day_of_week INTEGER NOT NULL,
                    start_period INTEGER NOT NULL,
                    end_period INTEGER NOT NULL,
                    classroom VARCHAR(50) NOT NULL,
                    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
                );
            """);

            stmt.execute("""
                CREATE TABLE IF NOT EXISTS course_prerequisites (
                    course_id INTEGER NOT NULL,
                    prerequisite_course_id INTEGER NOT NULL,
                    PRIMARY KEY (course_id, prerequisite_course_id),
                    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                    FOREIGN KEY (prerequisite_course_id) REFERENCES courses(id) ON DELETE CASCADE
                );
            """);

            stmt.execute("""
                CREATE TABLE IF NOT EXISTS student_course_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    course_id INTEGER NOT NULL,
                    semester VARCHAR(20) NOT NULL,
                    grade VARCHAR(5) NOT NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'PASSED',
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
                );
            """);

            stmt.execute("""
                CREATE TABLE IF NOT EXISTS enrollments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    course_id INTEGER NOT NULL,
                    semester VARCHAR(20) NOT NULL DEFAULT '2026-Fall',
                    status VARCHAR(20) NOT NULL DEFAULT 'ENROLLED',
                    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE (user_id, course_id, semester),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
                );
            """);
        }

        SeedData.seedIfEmpty(this);
    }

    // -------------------------------------------------------------
    // Authentication & Users
    // -------------------------------------------------------------

    public Optional<User> findUserByEmailAndPassword(String email, String password) throws SQLException {
        String sql = "SELECT id, user_no, name, email, major, role FROM users WHERE LOWER(email) = LOWER(?) AND password = ?";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email.trim());
            ps.setString(2, password);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new User(
                            rs.getInt("id"),
                            rs.getString("user_no"),
                            rs.getString("name"),
                            rs.getString("email"),
                            rs.getString("major"),
                            rs.getString("role")
                    ));
                }
            }
        }
        return Optional.empty();
    }

    public Optional<User> findUserById(int userId) throws SQLException {
        String sql = "SELECT id, user_no, name, email, major, role FROM users WHERE id = ?";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new User(
                            rs.getInt("id"),
                            rs.getString("user_no"),
                            rs.getString("name"),
                            rs.getString("email"),
                            rs.getString("major"),
                            rs.getString("role")
                    ));
                }
            }
        }
        return Optional.empty();
    }

    public User createUser(String userNo, String name, String email, String password, String major, String role) throws SQLException {
        String sql = "INSERT INTO users (user_no, name, email, password, major, role) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, userNo.trim());
            ps.setString(2, name.trim());
            ps.setString(3, email.trim().toLowerCase());
            ps.setString(4, password);
            ps.setString(5, major.trim());
            ps.setString(6, role);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    return new User(keys.getInt(1), userNo, name, email, major, role);
                }
            }
        }
        throw new SQLException("Failed to create user.");
    }

    /** Generates an unused student number for the current 2026 intake. */
    public String generateStudentNumber(String cohortPrefix) throws SQLException {
        long start = Math.abs(System.currentTimeMillis()) % 1_000_000L;
        String sql = "SELECT 1 FROM users WHERE user_no = ?";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int attempt = 0; attempt < 1000; attempt++) {
                String candidate = cohortPrefix + String.format("%06d", (start + attempt) % 1_000_000L);
                ps.setString(1, candidate);
                try (ResultSet rs = ps.executeQuery()) {
                    if (!rs.next()) return candidate;
                }
            }
        }
        throw new SQLException("Could not generate a unique student number.");
    }

    // -------------------------------------------------------------
    // Courses, Schedules, Prerequisites
    // -------------------------------------------------------------

    public List<Course> getAllCourses() throws SQLException {
        Map<Integer, Course> map = new LinkedHashMap<>();
        String sql = "SELECT id, course_code, title, department, credits, capacity, enrolled_count, instructor, semester, description FROM courses ORDER BY course_code";
        try (Connection conn = getConnection(); Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Course c = new Course();
                c.id = rs.getInt("id");
                c.courseCode = rs.getString("course_code");
                c.title = rs.getString("title");
                c.department = rs.getString("department");
                c.credits = rs.getInt("credits");
                c.capacity = rs.getInt("capacity");
                c.enrolledCount = rs.getInt("enrolled_count");
                c.instructor = rs.getString("instructor");
                c.semester = rs.getString("semester");
                c.description = rs.getString("description");
                map.put(c.id, c);
            }
        }

        // Attach schedules
        String schedSql = "SELECT id, course_id, day_of_week, start_period, end_period, classroom FROM course_schedules ORDER BY day_of_week, start_period";
        try (Connection conn = getConnection(); Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(schedSql)) {
            while (rs.next()) {
                int cid = rs.getInt("course_id");
                if (map.containsKey(cid)) {
                    map.get(cid).schedules.add(new Schedule(
                            rs.getInt("id"),
                            cid,
                            rs.getInt("day_of_week"),
                            rs.getInt("start_period"),
                            rs.getInt("end_period"),
                            rs.getString("classroom")
                    ));
                }
            }
        }

        // Attach prerequisites
        String prereqSql = """
            SELECT cp.course_id, cp.prerequisite_course_id, c.course_code, c.title
            FROM course_prerequisites cp
            JOIN courses c ON cp.prerequisite_course_id = c.id
            ORDER BY c.course_code
        """;
        try (Connection conn = getConnection(); Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(prereqSql)) {
            while (rs.next()) {
                int cid = rs.getInt("course_id");
                if (map.containsKey(cid)) {
                    map.get(cid).prerequisites.add(new Prerequisite(
                            cid,
                            rs.getInt("prerequisite_course_id"),
                            rs.getString("course_code"),
                            rs.getString("title")
                    ));
                }
            }
        }

        return new ArrayList<>(map.values());
    }

    public Course getCourseById(int courseId) throws SQLException {
        return getAllCourses().stream()
                .filter(c -> c.id == courseId)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Course not found with ID: " + courseId));
    }

    // -------------------------------------------------------------
    // Academic History & Current Enrollments
    // -------------------------------------------------------------

    public List<HistoryRecord> getAcademicHistory(int userId) throws SQLException {
        List<HistoryRecord> list = new ArrayList<>();
        String sql = """
            SELECT h.id, h.user_id, h.course_id, c.course_code, c.title, c.credits, h.semester, h.grade, h.status
            FROM student_course_history h
            JOIN courses c ON h.course_id = c.id
            WHERE h.user_id = ?
            ORDER BY h.semester DESC, c.course_code
        """;
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    HistoryRecord r = new HistoryRecord();
                    r.id = rs.getInt("id");
                    r.userId = rs.getInt("user_id");
                    r.courseId = rs.getInt("course_id");
                    r.courseCode = rs.getString("course_code");
                    r.title = rs.getString("title");
                    r.credits = rs.getInt("credits");
                    r.semester = rs.getString("semester");
                    r.grade = rs.getString("grade");
                    r.status = rs.getString("status");
                    list.add(r);
                }
            }
        }
        return list;
    }

    public List<Enrollment> getEnrolledCourses(int userId) throws SQLException {
        List<Enrollment> list = new ArrayList<>();
        String sql = """
            SELECT e.id, e.user_id, e.course_id, c.course_code, c.title, c.credits, c.instructor, e.semester, e.status, e.enrolled_at
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE e.user_id = ? AND e.status = 'ENROLLED'
            ORDER BY c.course_code
        """;
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Enrollment e = new Enrollment();
                    e.id = rs.getInt("id");
                    e.userId = rs.getInt("user_id");
                    e.courseId = rs.getInt("course_id");
                    e.courseCode = rs.getString("course_code");
                    e.title = rs.getString("title");
                    e.credits = rs.getInt("credits");
                    e.instructor = rs.getString("instructor");
                    e.semester = rs.getString("semester");
                    e.status = rs.getString("status");
                    e.enrolledAt = rs.getString("enrolled_at");
                    list.add(e);
                }
            }
        }

        // Attach schedules to each enrolled course
        for (Enrollment en : list) {
            String sSql = "SELECT id, course_id, day_of_week, start_period, end_period, classroom FROM course_schedules WHERE course_id = ? ORDER BY day_of_week, start_period";
            try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sSql)) {
                ps.setInt(1, en.courseId);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        en.schedules.add(new Schedule(
                                rs.getInt("id"),
                                en.courseId,
                                rs.getInt("day_of_week"),
                                rs.getInt("start_period"),
                                rs.getInt("end_period"),
                                rs.getString("classroom")
                        ));
                    }
                }
            }
        }
        return list;
    }

    public int getCurrentCredits(int userId) throws SQLException {
        String sql = """
            SELECT IFNULL(SUM(c.credits), 0) AS total_credits
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE e.user_id = ? AND e.status = 'ENROLLED'
        """;
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("total_credits");
                }
            }
        }
        return 0;
    }

    // -------------------------------------------------------------
    // Core Course Selection & Constraint Enforcement Logic
    // -------------------------------------------------------------

    /**
     * Enrolls a student into a course while strictly validating:
     * 1. Prerequisite completion
     * 2. Credit limit <= 21
     * 3. No timetable collision
     */
    public synchronized void enrollCourse(int userId, int courseId) throws SQLException {
        Course target = getCourseById(courseId);

        // 1. Capacity Check
        if (target.enrolledCount >= target.capacity) {
            throw new IllegalArgumentException(String.format("Course [%s %s] is full (Capacity: %d/%d).",
                    target.courseCode, target.title, target.enrolledCount, target.capacity));
        }

        // 2. Already Enrolled Check
        List<Enrollment> currentEnrolled = getEnrolledCourses(userId);
        for (Enrollment en : currentEnrolled) {
            if (en.courseId == courseId) {
                throw new IllegalArgumentException(String.format("You are already enrolled in [%s %s].",
                        target.courseCode, target.title));
            }
        }

        // 3. [CONSTRAINT 1] Prerequisite Verification
        List<HistoryRecord> history = getAcademicHistory(userId);
        Set<Integer> passedCourseIds = new HashSet<>();
        for (HistoryRecord h : history) {
            if ("PASSED".equalsIgnoreCase(h.status)) {
                passedCourseIds.add(h.courseId);
            }
        }

        for (Prerequisite prereq : target.prerequisites) {
            if (!passedCourseIds.contains(prereq.prerequisiteCourseId)) {
                throw new IllegalArgumentException(String.format(
                        "Prerequisite constraint violation: You must first pass prerequisite course [%s %s] before selecting [%s %s].",
                        prereq.prerequisiteCode, prereq.prerequisiteTitle, target.courseCode, target.title
                ));
            }
        }

        // 4. [CONSTRAINT 2] Credit Limit Check (<= 21 credits)
        int currentCredits = getCurrentCredits(userId);
        if (currentCredits + target.credits > 21) {
            throw new IllegalArgumentException(String.format(
                    "Credit ceiling exceeded: Your current enrolled credits (%d) + course credits (%d) = %d credits, which exceeds the mandatory maximum limit of 21 credits per semester.",
                    currentCredits, target.credits, (currentCredits + target.credits)
            ));
        }

        // 5. [CONSTRAINT 3] Time Conflict Detection
        for (Schedule newSched : target.schedules) {
            for (Enrollment en : currentEnrolled) {
                for (Schedule existingSched : en.schedules) {
                    if (newSched.overlaps(existingSched)) {
                        throw new IllegalArgumentException(String.format(
                                "Schedule conflict detected: Course [%s %s] (%s) clashes with already selected course [%s %s] (%s).",
                                target.courseCode, target.title, newSched.formatted(),
                                en.courseCode, en.title, existingSched.formatted()
                        ));
                    }
                }
            }
        }

        // 6. Atomic Transaction: Insert enrollment and increment capacity
        try (Connection conn = getConnection()) {
            conn.setAutoCommit(false);
            try {
                String enrollSql = "INSERT INTO enrollments (user_id, course_id, semester, status) VALUES (?, ?, ?, 'ENROLLED')";
                try (PreparedStatement ps = conn.prepareStatement(enrollSql)) {
                    ps.setInt(1, userId);
                    ps.setInt(2, courseId);
                    ps.setString(3, target.semester);
                    ps.executeUpdate();
                }

                String updateCountSql = "UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?";
                try (PreparedStatement ps = conn.prepareStatement(updateCountSql)) {
                    ps.setInt(1, courseId);
                    ps.executeUpdate();
                }

                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    /**
     * Drops an enrolled course and decrements course counter.
     */
    public synchronized void dropCourse(int userId, int courseId) throws SQLException {
        try (Connection conn = getConnection()) {
            conn.setAutoCommit(false);
            try {
                String deleteSql = "DELETE FROM enrollments WHERE user_id = ? AND course_id = ? AND status = 'ENROLLED'";
                int affected;
                try (PreparedStatement ps = conn.prepareStatement(deleteSql)) {
                    ps.setInt(1, userId);
                    ps.setInt(2, courseId);
                    affected = ps.executeUpdate();
                }

                if (affected == 0) {
                    throw new IllegalArgumentException("Course is not in your enrolled list.");
                }

                String updateCountSql = "UPDATE courses SET enrolled_count = CASE WHEN enrolled_count > 0 THEN enrolled_count - 1 ELSE 0 END WHERE id = ?";
                try (PreparedStatement ps = conn.prepareStatement(updateCountSql)) {
                    ps.setInt(1, courseId);
                    ps.executeUpdate();
                }

                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    /**
     * Assembles the complete dashboard view for a student, dynamically evaluating
     * whether each course in the catalog is selectable and appending reasons if not.
     */
    public StudentDashboard getStudentDashboard(int userId) throws SQLException {
        StudentDashboard dashboard = new StudentDashboard();
        dashboard.user = findUserById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        dashboard.currentCredits = getCurrentCredits(userId);
        dashboard.enrolledCourses = getEnrolledCourses(userId);
        dashboard.academicHistory = getAcademicHistory(userId);

        Set<Integer> enrolledIds = new HashSet<>();
        for (Enrollment en : dashboard.enrolledCourses) {
            enrolledIds.add(en.courseId);
        }

        Set<Integer> passedCourseIds = new HashSet<>();
        for (HistoryRecord h : dashboard.academicHistory) {
            if ("PASSED".equalsIgnoreCase(h.status)) {
                passedCourseIds.add(h.courseId);
            }
        }

        List<Course> allCourses = getAllCourses();
        for (Course c : allCourses) {
            if (enrolledIds.contains(c.id)) {
                c.isEnrolled = true;
                c.isSelectable = false;
                c.unselectableReason = "Already selected";
            } else if (c.enrolledCount >= c.capacity) {
                c.isSelectable = false;
                c.unselectableReason = "Course section is full";
            } else if (dashboard.currentCredits + c.credits > 21) {
                c.isSelectable = false;
                c.unselectableReason = String.format("Exceeds 21 credit limit (%d + %d = %d)",
                        dashboard.currentCredits, c.credits, dashboard.currentCredits + c.credits);
            } else {
                // Check prerequisites
                boolean missingPrereq = false;
                for (Prerequisite p : c.prerequisites) {
                    if (!passedCourseIds.contains(p.prerequisiteCourseId)) {
                        c.isSelectable = false;
                        c.unselectableReason = "Requires prerequisite: " + p.prerequisiteCode + " " + p.prerequisiteTitle;
                        missingPrereq = true;
                        break;
                    }
                }

                // Check schedule conflicts
                if (!missingPrereq) {
                    for (Schedule newSched : c.schedules) {
                        for (Enrollment en : dashboard.enrolledCourses) {
                            for (Schedule exSched : en.schedules) {
                                if (newSched.overlaps(exSched)) {
                                    c.isSelectable = false;
                                    c.unselectableReason = "Time conflict with " + en.courseCode + " (" + newSched.dayName() + " Period " + newSched.startPeriod + "-" + newSched.endPeriod + ")";
                                    break;
                                }
                            }
                            if (!c.isSelectable) break;
                        }
                        if (!c.isSelectable) break;
                    }
                }
            }
            dashboard.selectableCourses.add(c);
        }

        return dashboard;
    }
}
