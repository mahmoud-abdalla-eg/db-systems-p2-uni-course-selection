import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import CreditProgressBar from "./components/CreditProgressBar";
import CourseCard from "./components/CourseCard";
import TimetableGrid from "./components/TimetableGrid";
import AuthModal from "./components/AuthModal";
import AcademicHistoryModal from "./components/AcademicHistoryModal";
import { api } from "./api";

export default function App() {
  const [user, setUser] = useState(api.getCurrentUser());
  const [dashboard, setDashboard] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("available"); // 'available', 'enrolled', 'timetable', 'rules'
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboard();
    } else {
      loadPublicCourses();
    }
  }, [user]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const data = await api.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPublicCourses() {
    setLoading(true);
    try {
      const courses = await api.getAllCourses();
      setAllCourses(courses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(email, password) {
    const loggedIn = await api.login(email, password);
    setUser(loggedIn);
    setError(null);
    setSuccess(`Welcome back, ${loggedIn.name}.`);
  }

  async function handleRegister(payload) {
    const registered = await api.register(payload);
    setUser(registered);
    setError(null);
    setSuccess(`Account registered successfully. Welcome, ${registered.name}.`);
  }

  function handleLogout() {
    api.logout();
    setUser(null);
    setDashboard(null);
    setSuccess("You have been signed out.");
  }

  async function handleEnroll(courseId) {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await api.enroll(courseId);
      setDashboard(res.dashboard);
      setSuccess(res.message || "Course enrolled successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDrop(courseId) {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await api.drop(courseId);
      setDashboard(res.dashboard);
      setSuccess(res.message || "Course dropped successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const coursesToDisplay = user && dashboard ? dashboard.selectableCourses : allCourses;

  const filteredCourses = coursesToDisplay.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "ALL" || c.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const enrolledCourses = dashboard?.enrolledCourses || [];

  return (
    <div>
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenHistory={() => setHistoryModalOpen(true)}
      />

      <main className="container">
        {/* Banner Alert Messages */}
        {error && (
          <div className="alert-box alert-error">
            <span><strong>Constraint / Error:</strong> {error}</span>
            <button className="btn btn-outline" style={{ padding: "0.2rem 0.5rem" }} onClick={() => setError(null)}>
              &times;
            </button>
          </div>
        )}

        {success && (
          <div className="alert-box alert-success">
            <span>&#10003; {success}</span>
            <button className="btn btn-outline" style={{ padding: "0.2rem 0.5rem" }} onClick={() => setSuccess(null)}>
              &times;
            </button>
          </div>
        )}

        <section className="hero-panel" aria-labelledby="page-title">
          <div className="hero-copy">
            <span className="eyebrow">2026 fall · course selection</span>
            <h1 id="page-title">Build a semester that fits.</h1>
            <p>
              Browse open sections, check the rules before you register, and keep your timetable conflict-free.
            </p>
          </div>
          <div className="hero-status">
            <span className="status-dot" aria-hidden="true" />
            <span>{user ? "Student workspace" : "Catalog preview"}</span>
            {!user && (
              <button className="text-link" type="button" onClick={() => setAuthModalOpen(true)}>
                Sign in to select
              </button>
            )}
          </div>
        </section>

        {/* Credit Meter (Top Banner) */}
        {user && dashboard && (
          <CreditProgressBar
            currentCredits={dashboard.currentCredits}
            maxCredits={dashboard.maxCredits}
            enrolledCount={enrolledCourses.length}
          />
        )}

        {loading && coursesToDisplay.length === 0 && (
          <div className="loading-state" role="status">Loading course catalog...</div>
        )}

        {/* Navigation Tabs */}
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === "available" ? "active" : ""}`}
            onClick={() => setActiveTab("available")}
          >
            Selectable Courses Catalog ({coursesToDisplay.length})
          </button>
          {user && (
            <button
              className={`tab-btn ${activeTab === "enrolled" ? "active" : ""}`}
              onClick={() => setActiveTab("enrolled")}
            >
              My Selected Courses ({enrolledCourses.length})
            </button>
          )}
          {user && (
            <button
              className={`tab-btn ${activeTab === "timetable" ? "active" : ""}`}
              onClick={() => setActiveTab("timetable")}
            >
              Weekly Schedule Matrix
            </button>
          )}
          <button
            className={`tab-btn ${activeTab === "rules" ? "active" : ""}`}
            onClick={() => setActiveTab("rules")}
          >
            Project 2 Constraints Guide
          </button>
        </div>

        {/* TAB 1: AVAILABLE COURSES */}
        {activeTab === "available" && (
          <div>
            {/* Search & Filter Bar */}
            <div className="catalog-toolbar">
              <input
                type="text"
                className="form-input"
                aria-label="Search courses"
                style={{ flex: 1, minWidth: "240px" }}
                placeholder="Search by code, title, or instructor"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <select
                className="form-input"
                aria-label="Filter courses by department"
                style={{ width: "220px" }}
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Foreign Languages">Foreign Languages</option>
              </select>
            </div>

            {!user && (
              <div style={{ padding: "1rem", background: "var(--primary-soft)", borderRadius: "8px", marginBottom: "1.25rem", color: "var(--primary)" }}>
                &#8505; <strong>Guest mode:</strong> <button className="text-link" type="button" onClick={() => setAuthModalOpen(true)}>Sign in</button> to select courses, test prerequisite validation, and view your timetable.
              </div>
            )}

            <div className="catalog-summary">
              <span>{filteredCourses.length} section{filteredCourses.length === 1 ? "" : "s"} shown</span>
              {searchTerm || selectedDept !== "ALL" ? (
                <button className="text-link" type="button" onClick={() => { setSearchTerm(""); setSelectedDept("ALL"); }}>
                  Clear filters
                </button>
              ) : null}
            </div>

            {filteredCourses.length === 0 ? (
              <div className="empty-state">
                <h2>No matching courses</h2>
                <p>Try a different search term or clear the department filter.</p>
              </div>
            ) : (
              <div className="course-grid">
                {filteredCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    loading={loading}
                    onEnroll={user ? handleEnroll : () => setAuthModalOpen(true)}
                    onDrop={handleDrop}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY ENROLLED COURSES */}
        {activeTab === "enrolled" && (
          <div>
            <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Currently Selected Courses</h2>
              <span style={{ fontWeight: "600", color: "var(--primary)" }}>
                Total: {dashboard?.currentCredits || 0} Credits
              </span>
            </div>

            {enrolledCourses.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius)" }}>
                <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
                  You have not selected any courses for the current semester.
                </p>
                <button className="btn btn-primary" onClick={() => setActiveTab("available")}>
                  Browse Selectable Courses
                </button>
              </div>
            ) : (
              <div className="course-grid">
                {enrolledCourses.map(en => {
                  const courseData = dashboard?.selectableCourses.find(c => c.id === en.courseId) || en;
                  return (
                    <CourseCard
                      key={en.id}
                      course={{ ...courseData, isEnrolled: true, isSelectable: false }}
                      loading={loading}
                      onEnroll={handleEnroll}
                      onDrop={handleDrop}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WEEKLY SCHEDULE MATRIX */}
        {activeTab === "timetable" && (
          <TimetableGrid enrolledCourses={enrolledCourses} />
        )}

        {/* TAB 4: PROJECT 2 SPECIFICATION & CONSTRAINTS */}
        {activeTab === "rules" && (
          <div style={{ background: "var(--surface)", padding: "1.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.75rem" }}>
              Database Systems Project 2 &mdash; Mandatory Constraint Rules
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              CourseForge strictly implements the business rules specified in <code>DBS2026-Project2.pdf</code>:
            </p>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ borderLeft: "4px solid var(--primary)", paddingLeft: "1rem" }}>
                <h4 style={{ fontWeight: "700" }}>1. Prerequisite Verification</h4>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  A student cannot select an advanced course unless its prerequisite course has already been passed in academic history. For example, <strong>CS202 Database Systems</strong> requires <strong>CS201 Data Structures</strong>.
                </p>
              </div>

              <div style={{ borderLeft: "4px solid var(--warning)", paddingLeft: "1rem" }}>
                <h4 style={{ fontWeight: "700" }}>2. Credit Ceiling (Max 21 Credits)</h4>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  In accordance with JNU regulations, a student cannot register for more than 21 total credits in one semester. Any enrollment attempt pushing the sum over 21 is atomically rejected.
                </p>
              </div>

              <div style={{ borderLeft: "4px solid var(--danger)", paddingLeft: "1rem" }}>
                <h4 style={{ fontWeight: "700" }}>3. Schedule Conflict / Collision Detection</h4>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  If a candidate course shares the same day of the week and overlapping class period times with any course the student has already selected, the system detects the clash and blocks the selection.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <AcademicHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        history={dashboard?.academicHistory || []}
        studentName={user?.name || ""}
      />
    </div>
  );
}
