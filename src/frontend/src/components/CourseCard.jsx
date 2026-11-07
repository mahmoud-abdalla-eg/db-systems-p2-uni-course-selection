import React from "react";

const dayNames = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatSchedule(schedules = []) {
  if (schedules.length === 0) return "Schedule to be announced";
  return schedules.map(schedule => (
    `${dayNames[schedule.dayOfWeek] || `Day ${schedule.dayOfWeek}`} · Period ${schedule.startPeriod}-${schedule.endPeriod} · ${schedule.classroom}`
  )).join("; ");
}

export default function CourseCard({ course, onEnroll, onDrop, loading }) {
  const isEnrolled = Boolean(course.isEnrolled);
  const isSelectable = course.isSelectable !== false;
  const reason = course.unselectableReason;

  return (
    <article className={`course-card ${isEnrolled ? "enrolled" : ""} ${!isSelectable && !isEnrolled ? "conflict" : ""}`}>
      <div className="card-top">
        <span className="course-code">{course.courseCode}</span>
        <span className="credits-badge">{course.credits} credits</span>
      </div>

      <h3 className="course-title">{course.title}</h3>
      <p className="course-dept">{course.department} · {course.instructor}</p>

      <div className="course-meta-row">
        <div className="meta-item">
          <span className="meta-label">Schedule</span>
          <span>{formatSchedule(course.schedules)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Capacity</span>
          <span>{course.enrolledCount} / {course.capacity} seats</span>
        </div>
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="meta-item prerequisite-row">
            <span className="meta-label">Requires</span>
            <span>
              {course.prerequisites.map((prerequisite, index) => (
                <span key={index} className="prereq-tag">
                  {prerequisite.prerequisiteCode}
                </span>
              ))}
            </span>
          </div>
        )}
      </div>

      {!isSelectable && !isEnrolled && reason && (
        <div className="constraint-warning" role="status">
          <span aria-hidden="true">!</span>
          <span>Can't select: {reason}</span>
        </div>
      )}

      <div className="course-footer">
        <span className={`course-state ${isEnrolled ? "selected" : isSelectable ? "available" : "blocked"}`}>
          {isEnrolled ? <span className="state-check" aria-hidden="true">✓</span> : <span className="state-dot" aria-hidden="true" />}
          {isEnrolled ? "Selected" : isSelectable ? "Open for selection" : "Not available"}
        </span>
        {isEnrolled ? (
          <button className="btn btn-danger" type="button" disabled={loading} onClick={() => onDrop(course.id)}>
            Remove
          </button>
        ) : (
          <button className="btn btn-primary" type="button" disabled={!isSelectable || loading} onClick={() => onEnroll(course.id)}>
            {isSelectable ? "Select" : "Can't select"}
          </button>
        )}
      </div>
    </article>
  );
}
