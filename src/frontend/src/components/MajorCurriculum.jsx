import React from "react";

function statusFor(course) {
  if (course.isCompleted) return "Completed";
  if (course.isEnrolled) return "Selected";
  if (course.isSelectable) return "Open this semester";
  return "Planned later";
}

export default function MajorCurriculum({ major, courses, extras, requiredCodes, loading, onEnroll }) {
  const required = new Set(requiredCodes);
  const orderedCourses = [...courses].sort((a, b) => {
    const aPriority = required.has(a.courseCode) ? 0 : 1;
    const bPriority = required.has(b.courseCode) ? 0 : 1;
    return aPriority - bPriority || a.courseCode.localeCompare(b.courseCode);
  });
  const requiredCredits = orderedCourses
    .filter(course => required.has(course.courseCode))
    .reduce((total, course) => total + course.credits, 0);

  return (
    <section className="curriculum-view" aria-labelledby="curriculum-title">
      <div className="curriculum-intro">
        <p className="kicker">Degree plan</p>
        <h2 id="curriculum-title">{major} curriculum</h2>
        <p>Required courses are part of the degree plan. Professional electives and final-year requirements are shown for planning, but they do not have to be taken this semester.</p>
        <div className="curriculum-summary">
          <span><strong>{requiredCredits}</strong> required course credits listed</span>
          <span><strong>{extras.length}</strong> later degree requirements</span>
        </div>
      </div>

      <div className="curriculum-list">
        {orderedCourses.map(course => {
          const isRequired = required.has(course.courseCode);
          const status = statusFor(course);
          return (
            <article className="curriculum-row" key={course.id}>
              <div className="curriculum-code">{course.courseCode}</div>
              <div className="curriculum-copy">
                <strong>{course.title}</strong>
                <span>{course.credits} credits · {isRequired ? "Required course" : "Professional elective"}</span>
              </div>
              <span className={`curriculum-status ${course.isCompleted ? "complete" : course.isEnrolled ? "selected" : ""}`}>
                {status}
              </span>
              {course.isSelectable && (
                <button className="btn btn-primary curriculum-action" type="button" disabled={loading} onClick={() => onEnroll(course.id)}>
                  Select
                </button>
              )}
            </article>
          );
        })}

        {extras.map(item => (
          <article className="curriculum-row curriculum-milestone" key={item.code}>
            <div className="curriculum-code">{item.code}</div>
            <div className="curriculum-copy">
              <strong>{item.title}</strong>
              <span>{item.credits} credits · {item.requirement}</span>
            </div>
            <span className="curriculum-status planned">{item.term}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
