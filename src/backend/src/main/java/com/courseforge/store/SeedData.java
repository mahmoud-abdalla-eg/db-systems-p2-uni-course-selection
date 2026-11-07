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
        try (Connection conn = db.getConnection(); Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM users");
            if (rs.next() && rs.getInt(1) > 0) {
                return; // Already seeded
            }

            System.out.println("[SEED] Database is empty. Seeding Uni Course Selection data...");

            // 1. Users
            stmt.execute("""
                INSERT INTO users (user_no, name, email, password, major, role) VALUES
                ('2024101001', 'Alex Chen', 'alex.student@jnu.edu.cn', 'student123', 'Computer Science', 'STUDENT'),
                ('2024101002', 'Maria Silva', 'maria.silva@jnu.edu.cn', 'student123', 'Software Engineering', 'STUDENT'),
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
            // Alex Chen (id=1) has passed CS101 and CS102
            // Maria Silva (id=2) has passed CS101, CS102, CS201, CS202
            stmt.execute("""
                INSERT INTO student_course_history (user_id, course_id, semester, grade, status) VALUES
                (1, 1, '2025-Fall', 'A', 'PASSED'),
                (1, 2, '2026-Spring', 'B+', 'PASSED'),
                (2, 1, '2025-Fall', 'A', 'PASSED'),
                (2, 2, '2025-Fall', 'A-', 'PASSED'),
                (2, 3, '2026-Spring', 'A', 'PASSED'),
                (2, 4, '2026-Spring', 'A', 'PASSED');
            """);

            System.out.println("[SEED] Course data, schedules, and prerequisites loaded successfully.");
        }
    }
}
