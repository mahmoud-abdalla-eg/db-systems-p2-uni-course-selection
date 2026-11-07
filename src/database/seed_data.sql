-- =====================================================================
-- CourseForge Seed Data
-- =====================================================================

-- Users
INSERT INTO users (user_id, user_no, name, email, password, major, role) VALUES
(1, '2025101001', 'Alex Chen', 'alex.student@jnu.edu.cn', 'student123', 'Computer Science', 'STUDENT'),
(2, '2024101002', 'Maria Silva', 'maria.silva@jnu.edu.cn', 'student123', 'Software Engineering', 'STUDENT'),
(3, 'ADMIN001', 'Dean of Studies', 'admin@jnu.edu.cn', 'admin123', 'Teaching Affairs Office', 'ADMIN')
ON DUPLICATE KEY UPDATE name=VALUES(name), user_no=VALUES(user_no);

-- Courses
INSERT INTO courses (course_id, course_code, title, department, credits, capacity, instructor, semester, description) VALUES
(1, 'CS101', 'Introduction to Programming', 'Computer Science', 3, 45, 'Prof. Lin', '2026-Fall', 'Fundamental programming principles in Java, variables, flow control, and data abstraction.'),
(2, 'CS102', 'Discrete Mathematics', 'Computer Science', 3, 50, 'Prof. Zhang', '2026-Fall', 'Set theory, propositional logic, graph theory, and mathematical proof structures.'),
(3, 'CS201', 'Data Structures and Algorithms', 'Computer Science', 4, 40, 'Prof. Wang', '2026-Fall', 'Lists, stacks, trees, graphs, sorting, and asymptotic complexity analysis.'),
(4, 'CS202', 'Database Systems', 'Computer Science', 4, 35, 'Prof. Zhao', '2026-Fall', 'Relational data model, relational algebra, SQL DDL/DML, normalization, indexing, and transactions.'),
(5, 'CS301', 'Advanced Database & Cloud DB', 'Computer Science', 3, 30, 'Prof. Zhao', '2026-Fall', 'Distributed transactions, cloud-native storage, query optimization, and NoSQL systems.'),
(6, 'SE201', 'Software Engineering Practice', 'Software Engineering', 3, 40, 'Prof. Chen', '2026-Fall', 'Agile lifecycle, Git workflows, unit testing, requirements engineering, and CI/CD pipelines.'),
(7, 'SE302', 'Web Application Architecture', 'Software Engineering', 3, 35, 'Prof. Huang', '2026-Fall', 'Full-stack client-server paradigms, RESTful APIs, modern frontend frameworks, and security.'),
(8, 'AI301', 'Artificial Intelligence & Machine Learning', 'Computer Science', 4, 30, 'Prof. Sun', '2026-Fall', 'Supervised learning, neural networks, backpropagation, and heuristic search algorithms.'),
(9, 'MATH201', 'Linear Algebra & Matrix Computing', 'Mathematics', 3, 60, 'Prof. Wu', '2026-Fall', 'Matrix operations, eigenvalues, eigenvectors, vector spaces, and linear transformations.'),
(10, 'GEN101', 'Academic English Communication', 'Foreign Languages', 2, 40, 'Prof. Miller', '2026-Fall', 'Scholarly presentation skills, academic writing, and cross-cultural technical discourse.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Course Schedules
-- Days: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
-- Periods: 1-2 (08:00-09:40), 3-4 (10:00-11:40), 5-6 (14:00-15:40), 7-8 (16:00-17:40)
INSERT INTO course_schedules (schedule_id, course_id, day_of_week, start_period, end_period, classroom) VALUES
(1, 1, 1, 1, 2, 'Science Hall S101'),      -- CS101: Mon Period 1-2
(2, 2, 2, 3, 4, 'Science Hall S102'),      -- CS102: Tue Period 3-4
(3, 3, 3, 1, 2, 'Science Hall S201'),      -- CS201: Wed Period 1-2
(4, 4, 3, 3, 4, 'Science Hall S202'),      -- CS202: Wed Period 3-4
(5, 5, 1, 1, 2, 'Research Lab R301'),      -- CS301: Mon Period 1-2 (Conflicts with CS101!)
(6, 6, 4, 5, 6, 'Tech Building B201'),     -- SE201: Thu Period 5-6
(7, 7, 5, 3, 4, 'Tech Building B302'),     -- SE302: Fri Period 3-4
(8, 8, 4, 1, 2, 'AI Innovation Lab A101'), -- AI301: Thu Period 1-2
(9, 9, 2, 1, 2, 'Math Hall M201'),         -- MATH201: Tue Period 1-2
(10, 10, 5, 1, 2, 'Language Center E101')  -- GEN101: Fri Period 1-2
ON DUPLICATE KEY UPDATE classroom=VALUES(classroom);

-- Prerequisites
-- CS201 requires CS101
-- CS202 requires CS201
-- CS301 requires CS202
-- SE201 requires CS101
-- SE302 requires CS201
-- AI301 requires CS201
INSERT INTO course_prerequisites (course_id, prerequisite_course_id) VALUES
(3, 1),
(4, 3),
(5, 4),
(6, 1),
(7, 3),
(8, 3)
ON DUPLICATE KEY UPDATE prerequisite_course_id=VALUES(prerequisite_course_id);

-- Academic History (Past Completed Courses)
-- Alex Chen (2025 cohort) has completed one academic year.
INSERT INTO student_course_history (user_id, course_id, semester, grade, status) VALUES
(1, 1, '2025-Fall', 'A', 'PASSED'),
(1, 2, '2025-Fall', 'B+', 'PASSED'),
(1, 9, '2026-Spring', 'B', 'PASSED'),
(1, 10, '2026-Spring', 'A', 'PASSED'),
(1, 6, '2026-Spring', 'B+', 'PASSED'),
-- Maria Silva (2024 cohort) has completed two academic years.
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
