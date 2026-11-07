import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import CreditProgressBar from "./components/CreditProgressBar";
import CourseCard from "./components/CourseCard";
import TimetableGrid from "./components/TimetableGrid";
import AuthModal from "./components/AuthModal";
import AcademicHistoryModal from "./components/AcademicHistoryModal";
import { api } from "./api";

const tabs = [
  { id: "available", label: "Course catalog" },
  { id: "enrolled", label: "My selection" },
  { id: "timetable", label: "Timetable" },
  { id: "rules", label: "Selection rules" }
];

export default function App() {
  const [user, setUser] = useState(api.getCurrentUser());
  const [authReady, setAuthReady] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = api.getCurrentUser();
    if (!storedUser) {
      setAuthReady(true);
      return;
    }

    api.getMe()
      .then(verifiedUser => setUser(verifiedUser))
      .catch(() => {
        api.logout();
        setUser(null);
      })
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (user) {
      loadDashboard();
    } else {
      loadPublicCourses();
    }
  }, [user, authReady]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const data = await api.getDashboard();
      setDashboard(data);
      setError(null);
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
      setError(null);
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
    setActiveTab("available");
  }

  async function handleRegister(payload) {
    const registered = await api.register(payload);
    setUser(registered);
    setError(null);
    setSuccess(`Account created. Welcome, ${registered.name}.`);
    setActiveTab("available");
  }

  function handleLogout() {
    api.logout();
    setUser(null);
    setDashboard(null);
    setSuccess("You have been signed out.");
    setError(null);
    setActiveTab("available");
  }

  async function handleEnroll(courseId) {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await api.enroll(courseId);
      setDashboard(res.dashboard);
      setSuccess(res.message || "Course added to your selection.");
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
      setSuccess(res.message || "Course removed from your selection.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const coursesToDisplay = user && dashboard ? dashboard.selectableCourses : allCourses;
  const filteredCourses = coursesToDisplay.filter(course => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = course.title.toLowerCase().includes(term) ||
      course.courseCode.toLowerCase().includes(term) ||
      course.instructor.toLowerCase().includes(term);
    const matchesDept = selectedDept === "ALL" || course.department === selectedDept;
    return matchesSearch && matchesDept;
  });
  const enrolledCourses = dashboard?.enrolledCourses || [];

  return (
    <div className="app-shell">
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenHistory={() => setHistoryModalOpen(true)}
      />

      <main className="container" id="top">
        {error && (
          <div className="alert-box alert-error" role="alert">
            <span><strong>Could not complete that action:</strong> {error}</span>
            <button className="alert-dismiss" type="button" onClick={() => setError(null)} aria-label="Dismiss error">&times;</button>
          </div>
        )}

        {success && (
          <div className="alert-box alert-success" role="status">
            <span><strong>Done.</strong> {success}</span>
            <button className="alert-dismiss" type="button" onClick={() => setSuccess(null)} aria-label="Dismiss message">&times;</button>
          </div>
        )}

        <section className="hero-panel" aria-labelledby="page-title">
          <div className="hero-copy">
            <span className="eyebrow">Uni Course Selection · 2026 fall</span>
            <h1 id="page-title">Build a semester that works.</h1>
            <p>Browse open sections, check the rules before you register, and keep your timetable conflict-free.</p>
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

        <div className="workspace-layout">
          <section className="panel catalog-panel" aria-labelledby="catalog-title">
            <div className="panel-heading">
              <div>
                <p className="kicker">Course catalog</p>
                <h2 id="catalog-title">Choose your courses</h2>
              </div>
              <span className="count-label">{filteredCourses.length} section{filteredCourses.length === 1 ? "" : "s"} shown</span>
            </div>

            <nav className="tabs-nav" aria-label="Course selection views">
              {tabs.map(tab => {
                const hidden = (tab.id === "enrolled" || tab.id === "timetable") && !user;
                if (hidden) return null;
                return (
                  <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                    type="button"
                    aria-pressed={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                    {tab.id === "enrolled" ? ` (${enrolledCourses.length})` : ""}
                  </button>
                );
              })}
            </nav>

            {loading && coursesToDisplay.length === 0 && (
              <div className="loading-state" role="status">Loading course catalog...</div>
            )}

            {activeTab === "available" && (
              <div>
                <div className="catalog-toolbar">
                  <label className="search-field">
                    <span aria-hidden="true">⌕</span>
                    <input
                      type="search"
                      className="form-input"
                      aria-label="Search courses"
                      placeholder="Search by code, title, or instructor"
                      value={searchTerm}
                      onChange={event => setSearchTerm(event.target.value)}
                    />
                  </label>
                  <select
                    className="form-input department-select"
                    aria-label="Filter courses by department"
                    value={selectedDept}
                    onChange={event => setSelectedDept(event.target.value)}
                  >
                    <option value="ALL">All departments</option>
                    <option value="Computer Science">Computer science</option>
                    <option value="Software Engineering">Software engineering</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Foreign Languages">Foreign languages</option>
                  </select>
                </div>

                <div className="rule-strip" aria-label="Selection rules summary">
                  <span><b>✓</b> Prerequisites checked</span>
                  <span><b>21</b> Credit ceiling</span>
                  <span><b>◷</b> Time conflicts blocked</span>
                </div>

                {!user && (
                  <div className="guest-banner">
                    <span><strong>Catalog preview.</strong> Sign in to select courses, test the rules, and view your timetable.</span>
                    <button className="text-link" type="button" onClick={() => setAuthModalOpen(true)}>Sign in</button>
                  </div>
                )}

                <div className="catalog-summary">
                  <span>{user ? "Eligibility is checked before each enrollment." : "Open sections for the current semester."}</span>
                  {(searchTerm || selectedDept !== "ALL") && (
                    <button className="text-link" type="button" onClick={() => { setSearchTerm(""); setSelectedDept("ALL"); }}>
                      Clear filters
                    </button>
                  )}
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

            {activeTab === "enrolled" && user && (
              <section className="selection-view" aria-labelledby="selection-title">
                <div className="selection-heading">
                  <div>
                    <p className="kicker">Current semester</p>
                    <h2 id="selection-title">My selected courses</h2>
                  </div>
                  <strong>{dashboard?.currentCredits || 0} / {dashboard?.maxCredits || 21} credits</strong>
                </div>
                {enrolledCourses.length === 0 ? (
                  <div className="empty-state compact-empty">
                    <h2>Your selection is empty</h2>
                    <p>Choose a course from the catalog to start planning your semester.</p>
                    <button className="btn btn-primary" type="button" onClick={() => setActiveTab("available")}>Browse courses</button>
                  </div>
                ) : (
                  <div className="course-grid">
                    {enrolledCourses.map(enrollment => {
                      const courseData = dashboard?.selectableCourses.find(course => course.id === enrollment.courseId) || enrollment;
                      return (
                        <CourseCard
                          key={enrollment.id}
                          course={{ ...courseData, isEnrolled: true, isSelectable: false }}
                          loading={loading}
                          onEnroll={handleEnroll}
                          onDrop={handleDrop}
                        />
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {activeTab === "timetable" && user && <TimetableGrid enrolledCourses={enrolledCourses} />}

            {activeTab === "rules" && (
              <section className="rules-view" aria-labelledby="rules-title">
                <p className="kicker">Database Systems · Project 2</p>
                <h2 id="rules-title">Selection rules</h2>
                <p className="rules-intro">Each enrollment is checked before it is written to the database.</p>
                <div className="rules-list">
                  <div className="rule-row"><span>01</span><div><strong>Prerequisites</strong><p>An advanced course requires its prerequisite to be passed in the student history.</p></div></div>
                  <div className="rule-row"><span>02</span><div><strong>Credit ceiling</strong><p>The total selected credits cannot exceed 21 in one semester.</p></div></div>
                  <div className="rule-row"><span>03</span><div><strong>Schedule conflicts</strong><p>Overlapping day and period ranges are rejected before enrollment.</p></div></div>
                </div>
              </section>
            )}
          </section>

          <aside className="selection-rail" aria-label="Current semester plan">
            {user && dashboard ? (
              <section className="panel plan-panel">
                <div className="plan-heading">
                  <div><p className="rail-kicker">Current semester</p><h2>Your plan</h2></div>
                  <span className="term-badge">2026 fall</span>
                </div>

                <CreditProgressBar
                  currentCredits={dashboard.currentCredits}
                  maxCredits={dashboard.maxCredits}
                  enrolledCount={enrolledCourses.length}
                />

                <div className="selected-heading">
                  <h3>Selected courses</h3>
                  <span>{enrolledCourses.length} course{enrolledCourses.length === 1 ? "" : "s"}</span>
                </div>
                {enrolledCourses.length === 0 ? (
                  <div className="rail-empty">No courses selected yet.</div>
                ) : (
                  <div className="selected-course-list">
                    {enrolledCourses.map(course => (
                      <div className="selected-course-item" key={course.id}>
                        <div><strong>{course.courseCode}</strong><span>{course.title}</span><small>{course.credits} credits</small></div>
                        <button className="remove-course" type="button" onClick={() => handleDrop(course.courseId)}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="plan-note"><span>i</span> Every add is checked against prerequisites, the 21-credit ceiling, and timetable conflicts.</div>
                <button className="btn btn-primary plan-action" type="button" onClick={() => setActiveTab("timetable")}>View timetable <span aria-hidden="true">→</span></button>
              </section>
            ) : (
              <section className="panel signin-panel">
                <span className="signin-mark">UC</span>
                <p className="kicker">Ready to plan?</p>
                <h2>Sign in to build your semester.</h2>
                <p>Save your selection, see your academic history, and test every course rule with a student account.</p>
                <button className="btn btn-primary" type="button" onClick={() => setAuthModalOpen(true)}>Sign in or register</button>
              </section>
            )}

            <section className="panel rules-mini">
              <h2>What the system protects</h2>
              <div className="mini-rule"><span>01</span><p><strong>Prerequisites</strong> are checked from academic history.</p></div>
              <div className="mini-rule"><span>02</span><p>The semester stays under <strong>21 credits</strong>.</p></div>
              <div className="mini-rule"><span>03</span><p>Overlapping class times are <strong>blocked</strong>.</p></div>
            </section>
          </aside>
        </div>
      </main>

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
