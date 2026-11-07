import React from "react";

export default function CreditProgressBar({ currentCredits = 0, maxCredits = 21, enrolledCount = 0 }) {
  const percentage = Math.min(100, Math.round((currentCredits / maxCredits) * 100));
  
  let fillClass = "progress-safe";
  let statusText = "Normal Status (Under 21 Limit)";
  
  if (currentCredits >= 18 && currentCredits <= 21) {
    fillClass = "progress-warning";
    statusText = "Near Semester Limit";
  } else if (currentCredits > 21) {
    fillClass = "progress-danger";
    statusText = "LIMIT EXCEEDED (Max 21 Allowed)";
  }

  return (
    <div className="credit-meter-card">
      <div className="credit-meter-header">
        <div className="credit-title">
          <span>Semester Credit Meter</span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "normal" }}>
            ({enrolledCount} course{enrolledCount === 1 ? "" : "s"} selected)
          </span>
        </div>
        <div className="credit-stats">
          <span style={{ fontSize: "1.25rem", color: currentCredits > 21 ? "var(--danger)" : "var(--primary)" }}>
            {currentCredits}
          </span>
          <span style={{ color: "var(--text-muted)" }}> / {maxCredits} max credits</span>
        </div>
      </div>

      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${fillClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="credit-rules-summary">
        <div className="rule-chip">
          <strong>Rule 1:</strong> Prerequisites verified before enrollment
        </div>
        <div className="rule-chip">
          <strong>Rule 2:</strong> Max 21 credits per semester (<span style={{ color: "var(--primary)", fontWeight: "600" }}>{statusText}</span>)
        </div>
        <div className="rule-chip">
          <strong>Rule 3:</strong> Automated time collision detection
        </div>
      </div>
    </div>
  );
}
