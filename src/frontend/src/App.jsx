import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import CourseCard from "./components/CourseCard";
import MajorCurriculum from "./components/MajorCurriculum";
import TimetableGrid from "./components/TimetableGrid";
import AuthModal from "./components/AuthModal";
import { api } from "./api";

const categoryTitles = {
  all: "All courses",
  major: "Recommended this semester",
  curriculum: "Major curriculum"
};

const requiredCourseCodesByMajor = {
  "Computer Science": ["CS101", "CS102", "CS105", "CS201", "CS202", "CS203", "CS305", "CS301"],
  "Software Engineering": ["SE201", "SE202", "SE302", "SE303", "SE304", "SE305", "SE306", "SE307", "SE308"]
};

const curriculumPlanByMajor = {
  "Computer Science": [
    { year: 1, codes: ["CS101", "CS102", "CS105", "MATH201", "GEN101", "GEN104", "LANG101"] },
    { year: 2, codes: ["CS201", "CS202", "MATH202", "SE201", "GEN102", "GEN103"] },
    { year: 3, codes: ["CS203", "CS301", "CS305", "AI301", "AI302", "DS201", "IS201"] }
  ],
  "Software Engineering": [
    { year: 1, codes: ["CS101", "CS102", "MATH201", "GEN101", "GEN104", "LANG101"] },
    { year: 2, codes: ["CS201", "SE201", "SE202", "MATH202", "GEN102", "GEN103"] },
    { year: 3, codes: ["SE302", "SE303", "SE304", "SE305", "SE306", "SE307", "IS201"] },
    { year: 4, codes: ["SE308"] }
  ]
};

const majorCurriculumExtrasByMajor = {
  "Computer Science": [
    { code: "CS390", title: "Industrial training / internship", credits: 2, requirement: "Professional requirement", term: "Later in degree" },
    { code: "CS401", title: "Graduation thesis", credits: 10, requirement: "Final-year requirement", term: "Final year" },
    { code: "CS402", title: "Graduation seminar", credits: 2, requirement: "Final-year requirement", term: "Final year" }
  ],
  "Software Engineering": [
    { code: "SE390", title: "Industrial training / internship", credits: 2, requirement: "Professional requirement", term: "Later in degree" },
    { code: "SE401", title: "Graduation thesis", credits: 10, requirement: "Final-year requirement", term: "Final year" },
    { code: "SE402", title: "Software capstone project", credits: 4, requirement: "Final-year requirement", term: "Final year" }
  ]
};

export default function App() {
  const [user, setUser] = useState(api.getCurrentUser());
  const [authReady, setAuthReady] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState("available");
  const [catalogCategory, setCatalogCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedDay, setSelectedDay] = useState("ALL");
  const [selectedCredits, setSelectedCredits] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!success) return undefined;
    const timeout = window.setTimeout(() => setSuccess(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [success]);

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
    if (authReady && user) loadDashboard(user.id);
  }, [user, authReady]);

  async function loadDashboard(expectedUserId) {
    setLoading(true);
    try {
      const data = await api.getDashboard();
      const currentUser = api.getCurrentUser();
      if (currentUser?.id === expectedUserId) {
        setDashboard(data);
        setError(null);
      }
    } catch (err) {
      if (api.getCurrentUser()?.id === expectedUserId) setError(err.message);
    } finally {
      if (api.getCurrentUser()?.id === expectedUserId) setLoading(false);
    }
  }

  async function handleLogin(email, password) {
    const loggedIn = await api.login(email, password);
    setDashboard(null);
    setUser(loggedIn);
    setError(null);
    setSuccess(`Welcome back, ${loggedIn.name}.`);
    setActiveTab("available");
  }

  async function handleRegister(payload) {
    const registered = await api.register(payload);
    setDashboard(null);
    setUser(registered);
    setError(null);
    setSuccess(`Account created. Welcome, ${registered.name}.`);
    setActiveTab("available");
  }

  function handleLogout() {
    api.logout();
    setUser(null);
    setDashboard(null);
    setSuccess(null);
    setError(null);
    setActiveTab("available");
  }

  function handleCatalogChange(category) {
    setCatalogCategory(category);
    setActiveTab("available");
    setSearchTerm("");
    setSelectedDept("ALL");
    setSelectedDay("ALL");
    setSelectedCredits("ALL");
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

  const courses = dashboard?.selectableCourses || [];
  const currentCredits = dashboard?.currentCredits || 0;
  const maxCredits = dashboard?.maxCredits || 21;
  const requiredCodes = requiredCourseCodesByMajor[user?.major] || [];
  const curriculumPlan = curriculumPlanByMajor[user?.major] || [];
  const curriculumCodes = new Set(curriculumPlan.flatMap(section => section.codes));
  const curriculumYears = Object.fromEntries(curriculumPlan.flatMap(section => section.codes.map(code => [code, section.year])));
  const majorCourses = courses.filter(course => curriculumCodes.has(course.courseCode));
  const selectableCourses = courses.filter(course => course.isSelectable && !course.isCompleted && !course.isEnrolled);
  const categoryCourses = catalogCategory === "curriculum" ? majorCourses : courses;
  let recommendationNotice = null;
  const visibleCategoryCourses = catalogCategory === "major"
    ? (() => {
      const order = new Map(requiredCodes.map((code, index) => [code, index]));
      const requiredPool = selectableCourses.filter(course => requiredCodes.includes(course.courseCode));
      const sameMajorPool = selectableCourses.filter(course =>
        course.department.toLowerCase() === (user?.major || "").toLowerCase() && !requiredCodes.includes(course.courseCode)
      );
      const optionalPool = selectableCourses.filter(course =>
        !requiredCodes.includes(course.courseCode) && !sameMajorPool.includes(course)
      );
      const orderedCourses = [...requiredPool, ...sameMajorPool, ...optionalPool].sort((a, b) => {
        const aPriority = requiredCodes.includes(a.courseCode) ? 0 : sameMajorPool.includes(a) ? 1 : 2;
        const bPriority = requiredCodes.includes(b.courseCode) ? 0 : sameMajorPool.includes(b) ? 1 : 2;
        return aPriority - bPriority ||
          (order.get(a.courseCode) ?? 999) - (order.get(b.courseCode) ?? 999) ||
          a.courseCode.localeCompare(b.courseCode);
      });
      const recommendations = [];
      let recommendationCredits = 0;
      const remainingCredits = Math.max(0, maxCredits - currentCredits);
      for (const course of orderedCourses) {
        const availableBudget = remainingCredits - recommendationCredits;
        if (course.credits <= availableBudget + Number.EPSILON) {
          recommendations.push(course);
          recommendationCredits += course.credits;
        }
      }
      if (remainingCredits === 0) {
        recommendationNotice = "You have reached the 21-credit limit for this semester.";
      } else if (orderedCourses.length === 0) {
        recommendationNotice = "No selectable courses are available for your major this semester.";
      } else if (recommendations.length === 0) {
        recommendationNotice = `No available course fits the ${remainingCredits}-credit space remaining in your semester plan.`;
      }
      return recommendations;
    })()
    : categoryCourses;
  const departmentOptions = [...new Set(courses.map(course => course.department))].sort();
  const creditOptions = [...new Set([0.5, 1, ...courses.map(course => course.credits)])].sort((a, b) => a - b);
  const filteredCourses = visibleCategoryCourses.filter(course => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = course.title.toLowerCase().includes(term) ||
      course.courseCode.toLowerCase().includes(term) ||
      course.instructor.toLowerCase().includes(term);
    const matchesDept = selectedDept === "ALL" || course.department === selectedDept;
    const matchesDay = selectedDay === "ALL" || course.schedules?.some(schedule => String(schedule.dayOfWeek) === selectedDay);
    const matchesCredits = selectedCredits === "ALL" || String(course.credits) === selectedCredits;
    return matchesSearch && matchesDept && matchesDay && matchesCredits;
  });
  const majorCurriculumExtras = majorCurriculumExtrasByMajor[user?.major] || [];
  const shownCount = catalogCategory === "curriculum"
    ? majorCourses.length + majorCurriculumExtras.length
    : filteredCourses.length;
  const workspaceTitle = activeTab === "timetable"
    ? "Timetable"
    : activeTab === "enrolled"
      ? "My selected courses"
      : categoryTitles[catalogCategory];
  const workspaceKicker = activeTab === "available" ? "Course catalog" : "Current semester";
  const enrolledCourses = dashboard?.enrolledCourses || [];
  const cohortYear = Number.parseInt(String(user?.userNo || "").slice(0, 4), 10);
  const studyYear = Number.isFinite(cohortYear) && cohortYear >= 2020
    ? Math.min(4, Math.max(1, 2026 - cohortYear + 1))
    : 1;

  if (!authReady) {
    return (
      <div className="app-shell">
        <Navbar user={null} />
        <main className="auth-page auth-loading-page"><p>Checking your session...</p></main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-shell">
        <Navbar user={null} />
        <main className="auth-page">
          <section className="auth-welcome">
            <p className="eyebrow">Course planning</p>
            <h1>Plan your semester.</h1>
            <p>Sign in to browse your catalog, choose courses, and check your timetable.</p>
          </section>
          <AuthModal embedded isOpen onClose={() => {}} onLogin={handleLogin} onRegister={handleRegister} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar
        user={user}
        activeTab={activeTab}
        catalogCategory={catalogCategory}
        onCatalogChange={handleCatalogChange}
        onWorkspaceChange={setActiveTab}
        onLogout={handleLogout}
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
            <span>{success}</span>
            <button className="alert-dismiss" type="button" onClick={() => setSuccess(null)} aria-label="Dismiss message">&times;</button>
          </div>
        )}

        <section className="semester-bar" aria-label="Semester summary">
          <div className="semester-heading"><span className="kicker">Current registration</span><strong>University Course Selection</strong></div>
          <div className="semester-item"><span>Semester</span><strong>Fall 2026</strong></div>
          <div className="semester-item"><span>Study year</span><strong>Year {studyYear}</strong></div>
          <div className="semester-item"><span>Selected credits</span><strong>{currentCredits} / {maxCredits}</strong></div>
          <div className="semester-item credits-left"><span>Credits left</span><strong>{Math.max(0, maxCredits - currentCredits)}</strong></div>
          <span className="semester-status"><span className="status-dot" aria-hidden="true" /> Registration open</span>
        </section>

        <div className="workspace-layout">
          <section className="panel catalog-panel" aria-labelledby="catalog-title">
            {activeTab !== "timetable" && (
              <div className="panel-heading">
                <div>
                  <p className="kicker">{workspaceKicker}</p>
                  <h2 id="catalog-title">{workspaceTitle}</h2>
                </div>
                {activeTab === "available" && <span className="count-label">{shownCount} item{shownCount === 1 ? "" : "s"} shown</span>}
              </div>
            )}

            {loading && courses.length === 0 && <div className="loading-state" role="status">Loading your course catalog...</div>}

            {activeTab === "available" && (
              <div>
                {catalogCategory === "curriculum" ? (
                  <MajorCurriculum
                    major={user.major}
                    courses={majorCourses}
                    extras={majorCurriculumExtras}
                    requiredCodes={requiredCodes}
                    courseYears={curriculumYears}
                    studyYear={studyYear}
                    loading={loading}
                    onEnroll={handleEnroll}
                  />
                ) : (
                  <>
                <div className="catalog-toolbar">
                  <label className="search-field">
                    <span aria-hidden="true">⌕</span>
                    <input type="search" className="form-input" aria-label="Search courses" placeholder="Search courses" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} />
                  </label>
                  <select className="form-input department-select" aria-label="Filter courses by department" value={selectedDept} onChange={event => setSelectedDept(event.target.value)}>
                    <option value="ALL">All departments</option>
                    {departmentOptions.map(department => <option key={department} value={department}>{department}</option>)}
                  </select>
                  <select className="form-input day-select" aria-label="Filter courses by day" value={selectedDay} onChange={event => setSelectedDay(event.target.value)}>
                    <option value="ALL">All days</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                  </select>
                  <select className="form-input credit-select" aria-label="Filter courses by credit value" value={selectedCredits} onChange={event => setSelectedCredits(event.target.value)}>
                    <option value="ALL">All credits</option>
                    {creditOptions.map(credits => <option key={credits} value={credits}>{credits} credit{credits === 1 ? "" : "s"}</option>)}
                  </select>
                </div>

                <div className="catalog-summary">
                  <span>{catalogCategory === "major" ? (recommendationNotice || `Courses you can select now for ${user.major}. Required courses come first; optional courses can fill the remaining credits.`) : "All open sections for the current semester, including other majors and general electives."}</span>
                  {(searchTerm || selectedDept !== "ALL" || selectedDay !== "ALL" || selectedCredits !== "ALL") && <button className="text-link" type="button" onClick={() => { setSearchTerm(""); setSelectedDept("ALL"); setSelectedDay("ALL"); setSelectedCredits("ALL"); }}>Clear filters</button>}
                </div>

                {filteredCourses.length === 0 ? (
                  <div className="empty-state">
                    <h2>No courses in this category</h2>
                    <p>Try another category or clear the department filter.</p>
                  </div>
                ) : (
                  <div className="course-grid">
                    {filteredCourses.map(course => (
                      <CourseCard key={course.id} course={course} loading={loading} onEnroll={handleEnroll} onDrop={handleDrop} />
                    ))}
                  </div>
                )}
                  </>
                )}
              </div>
            )}

            {activeTab === "enrolled" && (
              <section className="selection-view" aria-labelledby="selection-title">
                <div className="selection-heading">
                  <div><p className="kicker">Current semester</p><h2 id="selection-title">My selected courses</h2></div>
                  <strong>{currentCredits} / {maxCredits} credits</strong>
                </div>
                {enrolledCourses.length === 0 ? (
                  <div className="empty-state compact-empty"><h2>Your selection is empty</h2><p>Choose a course from the catalog to start planning your semester.</p><button className="btn btn-primary" type="button" onClick={() => setActiveTab("available")}>Browse courses</button></div>
                ) : (
                  <div className="course-grid">
                    {enrolledCourses.map(enrollment => {
                      const courseData = courses.find(course => course.id === enrollment.courseId) || enrollment;
                      return <CourseCard key={enrollment.id} course={{ ...courseData, isEnrolled: true, isSelectable: false }} loading={loading} onEnroll={handleEnroll} onDrop={handleDrop} />;
                    })}
                  </div>
                )}
              </section>
            )}

            {activeTab === "timetable" && (
              <section className="standalone-view" aria-labelledby="timetable-title">
                <div className="standalone-heading">
                  <p className="kicker">Current semester</p>
                  <h2 id="timetable-title">Your timetable</h2>
                  <p>See the courses in your selection arranged by day and period.</p>
                </div>
                <TimetableGrid enrolledCourses={enrolledCourses} />
              </section>
            )}

          </section>
        </div>
      </main>

    </div>
  );
}
