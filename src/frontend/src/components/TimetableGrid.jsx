import React from "react";

export default function TimetableGrid({ enrolledCourses = [] }) {
  // Periods:
  // 1-2: 08:00 - 09:40
  // 3-4: 10:00 - 11:40
  // 5-6: 14:00 - 15:40
  // 7-8: 16:00 - 17:40
  const periods = [
    { start: 1, end: 2, label: "Period 1-2", time: "08:00 - 09:40" },
    { start: 3, end: 4, label: "Period 3-4", time: "10:00 - 11:40" },
    { start: 5, end: 6, label: "Period 5-6", time: "14:00 - 15:40" },
    { start: 7, end: 8, label: "Period 7-8", time: "16:00 - 17:40" }
  ];

  const days = [
    { day: 1, name: "Monday" },
    { day: 2, name: "Tuesday" },
    { day: 3, name: "Wednesday" },
    { day: 4, name: "Thursday" },
    { day: 5, name: "Friday" }
  ];

  // Helper to find which course is scheduled at a given day & period
  function getCourseAt(dayOfWeek, startPeriod) {
    for (const course of enrolledCourses) {
      if (!course.schedules) continue;
      for (const s of course.schedules) {
        if (s.dayOfWeek === dayOfWeek && s.startPeriod === startPeriod) {
          return { course, schedule: s };
        }
      }
    }
    return null;
  }

  return (
    <div className="timetable-wrapper">
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Weekly Course Schedule Matrix</h3>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          {enrolledCourses.length} active course{enrolledCourses.length === 1 ? "" : "s"}
        </span>
      </div>

      <table className="timetable-grid">
        <thead>
          <tr>
            <th className="period-col">Time / Day</th>
            {days.map(d => (
              <th key={d.day}>{d.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map(p => (
            <tr key={p.start}>
              <td className="period-col">
                <div style={{ fontWeight: "700" }}>{p.label}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{p.time}</div>
              </td>
              {days.map(d => {
                const item = getCourseAt(d.day, p.start);
                return (
                  <td key={d.day} style={{ height: "70px", verticalAlign: "middle" }}>
                    {item ? (
                      <div className="schedule-block">
                        <div style={{ fontWeight: "700" }}>
                          {item.course.courseCode} ({item.course.credits}cr)
                        </div>
                        <div style={{ fontSize: "0.72rem", opacity: 0.9 }}>{item.course.title}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          {item.schedule.classroom}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>&mdash;</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
