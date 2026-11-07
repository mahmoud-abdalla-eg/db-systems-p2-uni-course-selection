import React from "react";

export default function AcademicHistoryModal({ isOpen, onClose, history = [], studentName = "" }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "600px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Academic Transcript & Prerequisites</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{studentName}'s completed courses record</p>
          </div>
          <button className="btn btn-outline" style={{ padding: "0.2rem 0.5rem" }} onClick={onClose}>
            &times;
          </button>
        </div>

        {history.length === 0 ? (
          <p style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)" }}>
            No past completed course records found for this student.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ background: "var(--surface-raised)", borderBottom: "2px solid var(--border)" }}>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Code</th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Course Title</th>
                <th style={{ padding: "0.5rem", textAlign: "center" }}>Credits</th>
                <th style={{ padding: "0.5rem", textAlign: "center" }}>Semester</th>
                <th style={{ padding: "0.5rem", textAlign: "center" }}>Grade</th>
                <th style={{ padding: "0.5rem", textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.6rem 0.5rem", fontWeight: "700" }}>{item.courseCode}</td>
                  <td style={{ padding: "0.6rem 0.5rem" }}>{item.title}</td>
                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center" }}>{item.credits}</td>
                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", color: "var(--text-muted)" }}>{item.semester}</td>
                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", fontWeight: "600" }}>{item.grade}</td>
                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center" }}>
                    <span style={{
                      background: item.status === "PASSED" ? "var(--success-soft)" : "var(--danger-soft)",
                      color: item.status === "PASSED" ? "var(--success)" : "var(--danger)",
                      padding: "0.15rem 0.4rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "700"
                    }}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: "1.25rem", textAlign: "right" }}>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
