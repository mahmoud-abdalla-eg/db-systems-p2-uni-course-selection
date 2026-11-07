package com.courseforge.store;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Automatically seeds the relational database with initial data
 * (students, admins, courses, course schedules, prerequisites, and academic history).
 */
public class SeedData {

    public static void seedIfEmpty(Database db) throws SQLException {
        boolean alreadySeeded;
        try (Connection conn = db.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM users")) {
            alreadySeeded = rs.next() && rs.getInt(1) > 0;
        }

        if (alreadySeeded) {
            syncDemoStudents(db);
            ensureAdditionalCourses(db);
            return;
        }

        try (Connection conn = db.getConnection(); Statement stmt = conn.createStatement()) {
            System.out.println("[SEED] Database is empty. Seeding Uni Course Selection data...");

            // 1. Users
            stmt.execute("""
                INSERT INTO users (user_no, name, email, password, major, role) VALUES
                ('2025101001', 'Li Wei', 'li.wei@jnu.edu.cn', 'student123', 'Computer Science', 'STUDENT'),
                ('2024101002', 'Omar Hassan', 'omar.hassan@jnu.edu.cn', 'student123', 'Software Engineering', 'STUDENT'),
                ('ADMIN001', 'Dean of Studies', 'admin@jnu.edu.cn', 'admin123', 'Teaching Affairs Office', 'ADMIN');
            """);

            // 2. Courses
            stmt.execute("""
                INSERT INTO courses (id, course_code, title, department, credits, capacity, enrolled_count, instructor, semester, description) VALUES
                (1, 'CS101', 'Introduction to Programming', 'Computer Science', 3, 45, 0, 'Prof. Lin', '2026-Fall', 'Fundamental programming principles in Java, variables, flow control, and data abstraction.'),
                (2, 'CS102', 'Discrete Mathematics', 'Computer Science', 3, 50, 0, 'Prof. Zhang', '2026-Fall', 'Set theory, propositional logic, graph theory, and mathematical proof structures.'),
                (3, 'CS201', 'Data Structures and Algorithms', 'Computer Science', 4, 40, 0, 'Prof. Wang', '2026-Fall', 'Lists, stacks, trees, graphs, sorting, and asymptotic complexity analysis.'),
                (4, 'CS202', 'Database Systems', 'Computer Science', 4, 35, 0, 'Prof. Zhao', '2026-Fall', 'Relational data model, relational algebra, SQL DDL/DML, normalization, indexing, and transactions.'),
                (5, 'CS301', 'Advanced Database & Cloud DB', 'Computer Science', 3, 30, 0, 'Prof. Zhao', '2026-Fall', 'Distributed transactions, cloud-native storage, query optimization, and NoSQL systems.'),
                (6, 'SE201', 'Software Engineering Practice', 'Software Engineering', 3, 40, 0, 'Prof. Chen', '2026-Fall', 'Agile lifecycle, Git workflows, unit testing, requirements engineering, and CI/CD pipelines.'),
                (7, 'SE302', 'Web Application Architecture', 'Software Engineering', 3, 35, 0, 'Prof. Huang', '2026-Fall', 'Full-stack client-server paradigms, RESTful APIs, modern frontend frameworks, and security.'),
                (8, 'AI301', 'Artificial Intelligence & Machine Learning', 'Computer Science', 4, 30, 0, 'Prof. Sun', '2026-Fall', 'Supervised learning, neural networks, backpropagation, and heuristic search algorithms.'),
                (9, 'MATH201', 'Linear Algebra & Matrix Computing', 'Mathematics', 3, 60, 0, 'Prof. Wu', '2026-Fall', 'Matrix operations, eigenvalues, eigenvectors, vector spaces, and linear transformations.'),
                (10, 'GEN101', 'Academic English Communication', 'Foreign Languages', 2, 40, 0, 'Prof. Miller', '2026-Fall', 'Scholarly presentation skills, academic writing, and cross-cultural technical discourse.');
            """);

            // 3. Course Schedules
            // Days: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
            stmt.execute("""
                INSERT INTO course_schedules (course_id, day_of_week, start_period, end_period, classroom) VALUES
                (1, 1, 1, 2, 'Science Hall S101'),      -- CS101: Mon Period 1-2
                (2, 2, 3, 4, 'Science Hall S102'),      -- CS102: Tue Period 3-4
                (3, 3, 1, 2, 'Science Hall S201'),      -- CS201: Wed Period 1-2
                (4, 3, 3, 4, 'Science Hall S202'),      -- CS202: Wed Period 3-4
                (5, 1, 1, 2, 'Research Lab R301'),      -- CS301: Mon Period 1-2 (Conflicts with CS101!)
                (6, 4, 5, 6, 'Tech Building B201'),     -- SE201: Thu Period 5-6
                (7, 5, 3, 4, 'Tech Building B302'),     -- SE302: Fri Period 3-4
                (8, 4, 1, 2, 'AI Innovation Lab A101'), -- AI301: Thu Period 1-2
                (9, 2, 1, 2, 'Math Hall M201'),         -- MATH201: Tue Period 1-2
                (10, 5, 1, 2, 'Language Center E101');  -- GEN101: Fri Period 1-2
            """);

            // 4. Prerequisites
            stmt.execute("""
                INSERT INTO course_prerequisites (course_id, prerequisite_course_id) VALUES
                (3, 1), -- CS201 requires CS101
                (4, 3), -- CS202 requires CS201
                (5, 4), -- CS301 requires CS202
                (6, 1), -- SE201 requires CS101
                (7, 3), -- SE302 requires CS201
                (8, 3); -- AI301 requires CS201
            """);

            // 5. Academic History
            // Li Wei is a 2025 cohort student: one completed academic year.
            // Omar Hassan is a 2024 cohort student: two completed academic years.
            stmt.execute("""
                INSERT INTO student_course_history (user_id, course_id, semester, grade, status) VALUES
                (1, 1, '2025-Fall', 'A', 'PASSED'),
                (1, 2, '2025-Fall', 'B+', 'PASSED'),
                (1, 9, '2026-Spring', 'B', 'PASSED'),
                (1, 10, '2026-Spring', 'A', 'PASSED'),
                (1, 6, '2026-Spring', 'B+', 'PASSED'),
                (2, 1, '2024-Fall', 'A', 'PASSED'),
                (2, 2, '2024-Fall', 'A-', 'PASSED'),
                (2, 9, '2024-Fall', 'B+', 'PASSED'),
                (2, 10, '2024-Fall', 'A', 'PASSED'),
                (2, 3, '2025-Spring', 'A', 'PASSED'),
                (2, 6, '2025-Spring', 'A-', 'PASSED'),
                (2, 4, '2025-Fall', 'A', 'PASSED'),
                (2, 7, '2025-Fall', 'B+', 'PASSED'),
                (2, 5, '2026-Spring', 'A', 'PASSED'),
                (2, 8, '2026-Spring', 'A-', 'PASSED');
            """);

            System.out.println("[SEED] Course data, schedules, and prerequisites loaded successfully.");
        }

        syncDemoStudents(db);
        ensureAdditionalCourses(db);
    }

    /** Adds more local catalog choices without requiring an external API at runtime. */
    private static void ensureAdditionalCourses(Database db) throws SQLException {
        try (Connection conn = db.getConnection()) {
            String courseSql = """
                INSERT INTO courses (id, course_code, title, department, credits, capacity, enrolled_count, instructor, semester, description)
                SELECT ?, ?, ?, ?, ?, ?, 0, ?, ?, ?
                WHERE NOT EXISTS (SELECT 1 FROM courses WHERE course_code = ?)
            """;
            try (PreparedStatement ps = conn.prepareStatement(courseSql)) {
                String[][] courses = {
                        {"11", "CS105", "Object-Oriented Programming", "Computer Science", "3", "45", "Prof. Qian", "2026-Fall", "Classes, inheritance, interfaces, exceptions, and reusable object-oriented design."},
                        {"12", "CS203", "Operating Systems", "Computer Science", "4", "40", "Prof. Li", "2026-Fall", "Processes, threads, memory management, file systems, and operating-system design."},
                        {"13", "CS305", "Computer Networks", "Computer Science", "3", "40", "Prof. Gao", "2026-Fall", "Network layers, routing, reliable transport, wireless networks, and internet protocols."},
                        {"14", "SE202", "Requirements Engineering", "Software Engineering", "3", "40", "Prof. Ibrahim", "2026-Fall", "Requirements discovery, modeling, validation, user stories, and traceability."},
                        {"15", "SE303", "Software Testing and Quality", "Software Engineering", "3", "35", "Prof. Noor", "2026-Fall", "Test planning, unit testing, integration testing, automation, and quality assurance."},
                        {"16", "SE304", "DevOps and Cloud Delivery", "Software Engineering", "3", "35", "Prof. Farid", "2026-Fall", "Continuous integration, deployment pipelines, containers, monitoring, and cloud delivery."},
                        {"17", "IS201", "Business Information Systems", "Information Systems", "3", "45", "Prof. Hassan", "2026-Fall", "How organizations use information systems for operations, decisions, and digital transformation."},
                        {"18", "DS201", "Data Analytics", "Data Science", "3", "40", "Prof. Mei", "2026-Fall", "Data preparation, exploratory analysis, visualization, and introductory predictive methods."},
                        {"19", "MATH202", "Probability and Statistics", "Mathematics", "3", "60", "Prof. Xu", "2026-Fall", "Probability models, distributions, estimation, hypothesis testing, and regression."},
                        {"20", "GEN102", "Chinese Language and Culture", "Foreign Languages", "2", "40", "Prof. Liu", "2026-Fall", "Practical Chinese communication and an introduction to Chinese culture and society."},
                        {"21", "GEN103", "Academic Presentation", "General Education", "2", "40", "Prof. Park", "2026-Fall", "Research presentation, public speaking, visual storytelling, and academic communication."},
                        {"22", "HUM101", "Ethics in Technology", "Humanities", "2", "45", "Prof. Ahmed", "2026-Fall", "Ethical reasoning about software, data, artificial intelligence, privacy, and society."},
                        {"23", "BUS101", "Technology Entrepreneurship", "Business", "3", "45", "Prof. Karim", "2026-Fall", "Opportunity discovery, business models, product validation, and technology ventures."},
                        {"24", "AI302", "Data Mining", "Computer Science", "3", "30", "Prof. Sun", "2026-Fall", "Data mining workflows, classification, clustering, association rules, and model evaluation."},
                        {"25", "SE305", "Software Project Management", "Software Engineering", "3", "35", "Prof. Youssef", "2026-Fall", "Planning, estimation, risk management, teamwork, and delivery tracking for software projects."},
                        {"26", "SE306", "Human-Computer Interaction", "Software Engineering", "3", "40", "Prof. Sara", "2026-Fall", "User research, interaction design, prototyping, usability testing, and accessible interfaces."},
                        {"27", "SE307", "Secure Software Development", "Software Engineering", "3", "35", "Prof. Adel", "2026-Fall", "Threat modeling, secure coding, authentication, authorization, and application security."},
                        {"28", "SE308", "Software Architecture", "Software Engineering", "3", "35", "Prof. Mona", "2026-Fall", "Architectural styles, component design, scalability, maintainability, and system trade-offs."}
                };
                for (String[] course : courses) {
                    ps.setInt(1, Integer.parseInt(course[0]));
                    ps.setString(2, course[1]);
                    ps.setString(3, course[2]);
                    ps.setString(4, course[3]);
                    ps.setInt(5, Integer.parseInt(course[4]));
                    ps.setInt(6, Integer.parseInt(course[5]));
                    ps.setString(7, course[6]);
                    ps.setString(8, course[7]);
                    ps.setString(9, course[8]);
                    ps.setString(10, course[1]);
                    ps.executeUpdate();
                }
            }

            String scheduleSql = """
                INSERT INTO course_schedules (course_id, day_of_week, start_period, end_period, classroom)
                SELECT c.id, ?, ?, ?, ? FROM courses c
                WHERE c.course_code = ?
                  AND NOT EXISTS (SELECT 1 FROM course_schedules s WHERE s.course_id = c.id)
            """;
            try (PreparedStatement ps = conn.prepareStatement(scheduleSql)) {
                String[][] schedules = {
                        {"CS105", "2", "5", "6", "Science Hall S105"},
                        {"CS203", "3", "5", "6", "Science Hall S203"},
                        {"CS305", "4", "3", "4", "Network Lab N301"},
                        {"SE202", "1", "3", "4", "Tech Building B202"},
                        {"SE303", "4", "1", "2", "Tech Building B303"},
                        {"SE304", "5", "5", "6", "Tech Building B304"},
                        {"IS201", "2", "1", "2", "Business Hall H201"},
                        {"DS201", "3", "1", "2", "Data Lab D201"},
                        {"MATH202", "2", "1", "2", "Math Hall M202"},
                        {"GEN102", "5", "3", "4", "Language Center E102"},
                        {"GEN103", "1", "5", "6", "Learning Center L103"},
                        {"HUM101", "4", "5", "6", "Humanities Hall H101"},
                        {"BUS101", "5", "1", "2", "Business Hall H101"},
                        {"AI302", "3", "5", "6", "AI Innovation Lab A302"},
                        {"SE305", "1", "7", "8", "Tech Building B305"},
                        {"SE306", "2", "7", "8", "Tech Building B306"},
                        {"SE307", "3", "7", "8", "Tech Building B307"},
                        {"SE308", "4", "7", "8", "Tech Building B308"}
                };
                for (String[] schedule : schedules) {
                    ps.setInt(1, Integer.parseInt(schedule[1]));
                    ps.setInt(2, Integer.parseInt(schedule[2]));
                    ps.setInt(3, Integer.parseInt(schedule[3]));
                    ps.setString(4, schedule[4]);
                    ps.setString(5, schedule[0]);
                    ps.executeUpdate();
                }
            }

            String prerequisiteSql = """
                INSERT INTO course_prerequisites (course_id, prerequisite_course_id)
                SELECT c.id, p.id FROM courses c CROSS JOIN courses p
                WHERE c.course_code = ? AND p.course_code = ?
                  AND NOT EXISTS (
                      SELECT 1 FROM course_prerequisites cp
                      WHERE cp.course_id = c.id AND cp.prerequisite_course_id = p.id
                  )
            """;
            try (PreparedStatement ps = conn.prepareStatement(prerequisiteSql)) {
                String[][] prerequisites = {
                        {"CS105", "CS101"}, {"CS203", "CS201"}, {"CS305", "CS201"},
                        {"SE202", "CS101"}, {"SE303", "SE201"}, {"SE304", "SE201"},
                        {"DS201", "MATH201"}, {"AI302", "CS201"},
                        {"SE305", "SE201"}, {"SE306", "SE202"}, {"SE307", "SE201"}, {"SE308", "SE202"}
                };
                for (String[] prerequisite : prerequisites) {
                    ps.setString(1, prerequisite[0]);
                    ps.setString(2, prerequisite[1]);
                    ps.executeUpdate();
                }
            }
        }
    }

    /** Keeps the bundled demo accounts useful even when an older local DB already exists. */
    private static void syncDemoStudents(Database db) throws SQLException {
        try (Connection conn = db.getConnection()) {
            try (PreparedStatement ps = conn.prepareStatement("UPDATE users SET user_no = ?, name = ?, password = ?, major = ?, role = 'STUDENT' WHERE email = ?")) {
                ps.setString(1, "2025101001");
                ps.setString(2, "Li Wei");
                ps.setString(3, "student123");
                ps.setString(4, "Computer Science");
                ps.setString(5, "li.wei@jnu.edu.cn");
                ps.executeUpdate();
                ps.setString(1, "2024101002");
                ps.setString(2, "Omar Hassan");
                ps.setString(3, "student123");
                ps.setString(4, "Software Engineering");
                ps.setString(5, "omar.hassan@jnu.edu.cn");
                ps.executeUpdate();
            }

            ensureDemoUser(conn, "2025101001", "Li Wei", "li.wei@jnu.edu.cn", "Computer Science");
            ensureDemoUser(conn, "2024101002", "Omar Hassan", "omar.hassan@jnu.edu.cn", "Software Engineering");

            try (Statement stmt = conn.createStatement()) {
                stmt.executeUpdate("DELETE FROM student_course_history WHERE user_id IN (SELECT id FROM users WHERE email IN ('li.wei@jnu.edu.cn', 'omar.hassan@jnu.edu.cn'))");
            }

            String historySql = """
                INSERT INTO student_course_history (user_id, course_id, semester, grade, status)
                SELECT id, ?, ?, ?, ? FROM users WHERE email = ?
            """;
            try (PreparedStatement ps = conn.prepareStatement(historySql)) {
                String[][] liWei = {
                        {"1", "2025-Fall", "A"}, {"2", "2025-Fall", "B+"},
                        {"9", "2026-Spring", "B"}, {"10", "2026-Spring", "A"},
                        {"6", "2026-Spring", "B+"}
                };
                String[][] omarHassan = {
                        {"1", "2024-Fall", "A"}, {"2", "2024-Fall", "A-"},
                        {"9", "2024-Fall", "B+"}, {"10", "2024-Fall", "A"},
                        {"3", "2025-Spring", "A"}, {"6", "2025-Spring", "A-"},
                        {"4", "2025-Fall", "A"}, {"7", "2025-Fall", "B+"},
                        {"5", "2026-Spring", "A"}, {"8", "2026-Spring", "A-"}
                };
                insertHistory(ps, "li.wei@jnu.edu.cn", liWei);
                insertHistory(ps, "omar.hassan@jnu.edu.cn", omarHassan);
            }

            // Remove old demo selections that were invalid because the course was already passed.
            try (Statement stmt = conn.createStatement()) {
                stmt.executeUpdate("""
                    DELETE FROM enrollments
                    WHERE user_id IN (SELECT id FROM users WHERE email IN ('li.wei@jnu.edu.cn', 'omar.hassan@jnu.edu.cn'))
                      AND EXISTS (
                          SELECT 1 FROM student_course_history h
                          WHERE h.user_id = enrollments.user_id
                            AND h.course_id = enrollments.course_id
                            AND h.status = 'PASSED'
                      )
                """);
                stmt.executeUpdate("""
                    UPDATE courses
                    SET enrolled_count = (
                        SELECT COUNT(*) FROM enrollments e
                        WHERE e.course_id = courses.id AND e.status = 'ENROLLED'
                    )
                """);
            }
        }
    }

    private static void insertHistory(PreparedStatement ps, String email, String[][] records) throws SQLException {
        for (String[] record : records) {
            ps.setInt(1, Integer.parseInt(record[0]));
            ps.setString(2, record[1]);
            ps.setString(3, record[2]);
            ps.setString(4, "PASSED");
            ps.setString(5, email);
            ps.addBatch();
        }
        ps.executeBatch();
        ps.clearBatch();
    }

    private static void ensureDemoUser(Connection conn, String userNo, String name, String email, String major) throws SQLException {
        try (PreparedStatement check = conn.prepareStatement("SELECT 1 FROM users WHERE email = ?")) {
            check.setString(1, email);
            try (ResultSet rs = check.executeQuery()) {
                if (rs.next()) return;
            }
        }
        try (PreparedStatement insert = conn.prepareStatement("INSERT INTO users (user_no, name, email, password, major, role) VALUES (?, ?, ?, ?, ?, 'STUDENT')")) {
            insert.setString(1, userNo);
            insert.setString(2, name);
            insert.setString(3, email);
            insert.setString(4, "student123");
            insert.setString(5, major);
            insert.executeUpdate();
        }
    }
}
