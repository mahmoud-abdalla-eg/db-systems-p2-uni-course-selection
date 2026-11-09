import React from "react";

function formatCredits(value) {
  return Number.isInteger(value) ? String(value) : Number(value).toFixed(1).replace(/\.0$/, "");
}

function yearForCourse(course, courseYears) {
  if (courseYears[course.courseCode]) return courseYears[course.courseCode];
  const match = course.courseCode.match(/\d{3}/);
  const level = Number.parseInt(match?.[0]?.charAt(0) || "4", 10);
  return Math.min(4, Math.max(1, level));
}

function statusFor(course) {
  if (course.isCompleted) return { label: "Completed", className: "complete" };
  if (course.isEnrolled) return { label: "Selected", className: "selected" };
  if (course.isSelectable) return { label: "Open this semester", className: "open" };
  return { label: "Planned later", className: "planned" };
}

export default function MajorCurriculum({ major, courses, extras, requiredCodes, courseYears = {}, studyYear, loading, onEnroll }) {
  const required = new Set(requiredCodes);
  const orderedCourses = [...courses].sort((a, b) => {
    const aPriority = required.has(a.courseCode) ? 0 : 1;
    const bPriority = required.has(b.courseCode) ? 0 : 1;
    return aPriority - bPriority || a.courseCode.localeCompare(b.courseCode);
  });

  const yearGroups = [1, 2, 3, 4].map(year => ({
    year,
    courses: orderedCourses.filter(course => yearForCourse(course, courseYears) === year)
  })).filter(group => group.courses.length > 0);

  const requiredCredits = orderedCourses
    .filter(course => required.has(course.courseCode))
    .reduce((total, course) => total + course.credits, 0);
  const completedCredits = orderedCourses
    .filter(course => course.isCompleted)
    .reduce((total, course) => total + course.credits, 0);
  const selectedCredits = orderedCourses
    .filter(course => course.isEnrolled)
    .reduce((total, course) => total + course.credits, 0);
  const listedCredits = orderedCourses.reduce((total, course) => total + course.credits, 0);
  const trackedCredits = completedCredits + selectedCredits;
  const remainingCredits = Math.max(0, listedCredits - trackedCredits);
  const progressPercent = listedCredits > 0 ? Math.min(100, Math.round((trackedCredits / listedCredits) * 100)) : 0;

  if (orderedCourses.length === 0) {
    return (
      <section className="curriculum-view" aria-labelledby="curriculum-title">
        <div className="curriculum-intro">
          <p className="kicker">Major catalog</p>
          <h2 id="curriculum-title">{major} major plan</h2>
          <p>Track requirements from the current course catalog. This view is not a complete degree audit.</p>
        </div>
        <div className="curriculum-empty" role="status">
          <strong>No {major} courses are listed for the current semester.</strong>
          <p>Browse All courses to review open sections, or choose a supported major with catalog courses.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="curriculum-view" aria-labelledby="curriculum-title">
      <div className="curriculum-hero">
        <div className="curriculum-intro">
          <p className="kicker">Major catalog</p>
          <h2 id="curriculum-title">{major} major plan</h2>
          <p>Track the requirements listed in the current catalog, see what is complete, and choose an available course when you are ready.</p>
        </div>

        <div className="curriculum-progress-card">
          <div className="curriculum-progress-heading">
          <span>Catalog progress</span>
            <strong>{progressPercent}%</strong>
          </div>
          <div className="curriculum-progress-track" aria-label={`${progressPercent}% of listed major-catalog credits tracked`}>
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <small>{formatCredits(trackedCredits)} of {formatCredits(listedCredits)} listed major-catalog credits tracked</small>
        </div>
      </div>

      <div className="curriculum-stats" aria-label="Major catalog summary">
        <div className="curriculum-stat"><span>Completed</span><strong>{formatCredits(completedCredits)}</strong><small>credits</small></div>
        <div className="curriculum-stat"><span>Selected now</span><strong>{formatCredits(selectedCredits)}</strong><small>credits</small></div>
        <div className="curriculum-stat"><span>Remaining</span><strong>{formatCredits(remainingCredits)}</strong><small>listed credits</small></div>
        <div className="curriculum-stat"><span>Required credits listed</span><strong>{formatCredits(requiredCredits)}</strong><small>current catalog</small></div>
      </div>

      <div className="curriculum-sections">
        {yearGroups.map(group => (
          <section className={`curriculum-year ${group.year === studyYear ? "current" : ""}`} key={group.year}>
            <div className="curriculum-year-heading">
              <div>
                <p className="kicker">Year {group.year}</p>
                <h3>Year {group.year} courses</h3>
              </div>
              <span>{group.courses.length} course{group.courses.length === 1 ? "" : "s"} · {formatCredits(group.courses.reduce((total, course) => total + course.credits, 0))} credits</span>
            </div>

            <div className="curriculum-table" role="list">
              {group.courses.map(course => {
                const isRequired = required.has(course.courseCode);
                const status = statusFor(course);
                return (
                  <article className={`curriculum-course-row ${status.className}`} key={course.id} role="listitem">
                    <div className="curriculum-code">{course.courseCode}</div>
                    <div className="curriculum-copy">
                      <strong>{course.title}</strong>
                      <span>{isRequired ? "Required course" : course.department === major ? "Professional elective" : "General requirement"}</span>
                    </div>
                    <div className="curriculum-credits">{formatCredits(course.credits)}<small>cr</small></div>
                    <span className={`curriculum-status ${status.className}`}><span className="curriculum-status-dot" />{status.label}</span>
                    {course.isSelectable && (
                      <button className="btn btn-primary curriculum-action" type="button" disabled={loading} onClick={() => onEnroll(course.id)}>
                        Select
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        {extras.length > 0 && (
          <section className="curriculum-year curriculum-milestones-section">
            <div className="curriculum-year-heading">
              <div>
                <p className="kicker">Later requirements</p>
                <h3>Requirements to plan later</h3>
              </div>
              <span>{extras.length} requirement{extras.length === 1 ? "" : "s"}</span>
            </div>
            <div className="curriculum-table" role="list">
              {extras.map(item => (
                <article className="curriculum-course-row curriculum-milestone" key={item.code} role="listitem">
                  <div className="curriculum-code">{item.code}</div>
                  <div className="curriculum-copy">
                    <strong>{item.title}</strong>
                    <span>{item.requirement}</span>
                  </div>
                  <div className="curriculum-credits">{formatCredits(item.credits)}<small>cr</small></div>
                  <span className="curriculum-status planned"><span className="curriculum-status-dot" />{item.term}</span>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
