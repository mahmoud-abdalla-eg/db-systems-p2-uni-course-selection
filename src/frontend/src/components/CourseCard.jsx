import React from "react";

export default function CourseCard({ course, onEnroll, onDrop, loading }) {
  const isEnrolled = course.isEnrolled;
  const isSelectable = course.isSelectable;
  const reason = course.unselectableReason;

  return (
    <div className={`course-card ${isEnrolled ? "enrolled" : ""} ${!isSelectable && !isEnrolled ? "conflict" : ""}`}>
      <div>
        <div className="card-top">
          <span className="course-code">{course.courseCode}</span>
          <span className="credits-badge">{course.credits} Credits</span>
        </div>

        <h3 className="course-title">{course.title}</h3>
        <p className="course-dept">{course.department} &bull; {course.instructor}</p>

        <div className="course-meta-row">
          <div className="meta-item">
            <strong>Schedule:</strong>
            <span>
              {course.schedules && course.schedules.length > 0
                ? course.schedules.map((s, idx) => (
                    <span key={idx}>
                      {s.dayOfWeek === 1 ? "Mon" : s.dayOfWeek === 2 ? "Tue" : s.dayOfWeek === 3 ? "Wed" : s.dayOfWeek === 4 ? "Thu" : "Fri"} {s.startPeriod}-{s.endPeriod} ({s.classroom})
                      {idx < course.schedules.length - 1 ? "; " : ""}
                    </span>
                  ))
                : "TBA"}
            </span>
          </div>

          <div className="meta-item">
            <strong>Capacity:</strong>
            <span>{course.enrolledCount} / {course.capacity} seats filled</span>
          </div>

          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="meta-item" style={{ alignItems: "flex-start" }}>
              <strong style={{ minWidth: "90px" }}>Prerequisites:</strong>
              <div>
                {course.prerequisites.map((p, idx) => (
                  <span key={idx} className="prereq-tag">
                    {p.prerequisiteCode} {p.prerequisiteTitle}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Unselectable reason alert */}
        {!isSelectable && !isEnrolled && reason && (
          <div className="constraint-warning">
            <span>&#9888; {reason}</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: "1rem" }}>
        {isEnrolled ? (
          <button
            className="btn btn-danger"
            style={{ width: "100%" }}
            disabled={loading}
            onClick={() => onDrop(course.id)}
          >
            Drop Course
          </button>
        ) : (
          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={!isSelectable || loading}
            onClick={() => onEnroll(course.id)}
          >
            {isSelectable ? "Select Course" : "Cannot Select"}
          </button>
        )}
      </div>
    </div>
  );
}
