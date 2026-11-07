-- =====================================================================
-- CourseForge Seed Data
-- =====================================================================

-- Users
INSERT INTO users (user_id, user_no, name, email, password, major, role) VALUES
(1, '2025101001', 'Li Wei', 'li.wei@jnu.edu.cn', 'student123', 'Computer Science', 'STUDENT'),
(2, '2024101002', 'Omar Hassan', 'omar.hassan@jnu.edu.cn', 'student123', 'Software Engineering', 'STUDENT'),
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
(10, 'GEN101', 'Academic English Communication', 'Foreign Languages', 2, 40, 'Prof. Miller', '2026-Fall', 'Scholarly presentation skills, academic writing, and cross-cultural technical discourse.'),
(11, 'CS105', 'Object-Oriented Programming', 'Computer Science', 3, 45, 'Prof. Qian', '2026-Fall', 'Classes, inheritance, interfaces, exceptions, and reusable object-oriented design.'),
(12, 'CS203', 'Operating Systems', 'Computer Science', 4, 40, 'Prof. Li', '2026-Fall', 'Processes, threads, memory management, file systems, and operating-system design.'),
(13, 'CS305', 'Computer Networks', 'Computer Science', 3, 40, 'Prof. Gao', '2026-Fall', 'Network layers, routing, reliable transport, wireless networks, and internet protocols.'),
(14, 'SE202', 'Requirements Engineering', 'Software Engineering', 3, 40, 'Prof. Ibrahim', '2026-Fall', 'Requirements discovery, modeling, validation, user stories, and traceability.'),
(15, 'SE303', 'Software Testing and Quality', 'Software Engineering', 3, 35, 'Prof. Noor', '2026-Fall', 'Test planning, unit testing, integration testing, automation, and quality assurance.'),
(16, 'SE304', 'DevOps and Cloud Delivery', 'Software Engineering', 3, 35, 'Prof. Farid', '2026-Fall', 'Continuous integration, deployment pipelines, containers, monitoring, and cloud delivery.'),
(17, 'IS201', 'Business Information Systems', 'Information Systems', 3, 45, 'Prof. Hassan', '2026-Fall', 'How organizations use information systems for operations, decisions, and digital transformation.'),
(18, 'DS201', 'Data Analytics', 'Data Science', 3, 40, 'Prof. Mei', '2026-Fall', 'Data preparation, exploratory analysis, visualization, and introductory predictive methods.'),
(19, 'MATH202', 'Probability and Statistics', 'Mathematics', 3, 60, 'Prof. Xu', '2026-Fall', 'Probability models, distributions, estimation, hypothesis testing, and regression.'),
(20, 'GEN102', 'Chinese Language and Culture', 'Foreign Languages', 2, 40, 'Prof. Liu', '2026-Fall', 'Practical Chinese communication and an introduction to Chinese culture and society.'),
(21, 'GEN103', 'Academic Presentation', 'General Education', 2, 40, 'Prof. Park', '2026-Fall', 'Research presentation, public speaking, visual storytelling, and academic communication.'),
(22, 'HUM101', 'Ethics in Technology', 'Humanities', 2, 45, 'Prof. Ahmed', '2026-Fall', 'Ethical reasoning about software, data, artificial intelligence, privacy, and society.'),
(23, 'BUS101', 'Technology Entrepreneurship', 'Business', 3, 45, 'Prof. Karim', '2026-Fall', 'Opportunity discovery, business models, product validation, and technology ventures.'),
(24, 'AI302', 'Data Mining', 'Computer Science', 3, 30, 'Prof. Sun', '2026-Fall', 'Data mining workflows, classification, clustering, association rules, and model evaluation.')
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
(10, 10, 5, 1, 2, 'Language Center E101'),  -- GEN101: Fri Period 1-2
(11, 11, 2, 5, 6, 'Science Hall S105'),
(12, 12, 3, 5, 6, 'Science Hall S203'),
(13, 13, 4, 3, 4, 'Network Lab N301'),
(14, 14, 1, 3, 4, 'Tech Building B202'),
(15, 15, 4, 1, 2, 'Tech Building B303'),
(16, 16, 5, 5, 6, 'Tech Building B304'),
(17, 17, 2, 1, 2, 'Business Hall H201'),
(18, 18, 3, 1, 2, 'Data Lab D201'),
(19, 19, 2, 1, 2, 'Math Hall M202'),
(20, 20, 5, 3, 4, 'Language Center E102'),
(21, 21, 1, 5, 6, 'Learning Center L103'),
(22, 22, 4, 5, 6, 'Humanities Hall H101'),
(23, 23, 5, 1, 2, 'Business Hall H101'),
(24, 24, 3, 5, 6, 'AI Innovation Lab A302')
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
(8, 3),
(11, 1),
(12, 3),
(13, 3),
(14, 1),
(15, 6),
(16, 6),
(18, 9),
(24, 3)
ON DUPLICATE KEY UPDATE prerequisite_course_id=VALUES(prerequisite_course_id);

-- Academic History (Past Completed Courses)
-- Li Wei (2025 cohort) has completed one academic year.
INSERT INTO student_course_history (user_id, course_id, semester, grade, status) VALUES
(1, 1, '2025-Fall', 'A', 'PASSED'),
(1, 2, '2025-Fall', 'B+', 'PASSED'),
(1, 9, '2026-Spring', 'B', 'PASSED'),
(1, 10, '2026-Spring', 'A', 'PASSED'),
(1, 6, '2026-Spring', 'B+', 'PASSED'),
-- Omar Hassan (2024 cohort) has completed two academic years.
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
