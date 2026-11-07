import React from "react";

export default function CreditProgressBar({ currentCredits = 0, maxCredits = 21, enrolledCount = 0 }) {
  const percentage = Math.min(100, Math.round((currentCredits / maxCredits) * 100));
  const nearLimit = currentCredits >= 18 && currentCredits <= maxCredits;
  const overLimit = currentCredits > maxCredits;

  return (
    <div className="credit-meter-card">
      <div className="credit-meter-header">
        <div>
          <span className="credit-title">Semester credits</span>
          <span className="credit-subtitle">{enrolledCount} course{enrolledCount === 1 ? "" : "s"} selected</span>
        </div>
        <div className={`credit-stats ${overLimit ? "over-limit" : ""}`}>
          <strong>{currentCredits}</strong><span> / {maxCredits}</span>
        </div>
      </div>

      <div className="progress-bar-track" aria-label={`${currentCredits} of ${maxCredits} credits selected`}>
        <div
          className={`progress-bar-fill ${overLimit ? "progress-danger" : nearLimit ? "progress-warning" : "progress-safe"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="credit-status">
        {overLimit ? "Credit limit exceeded" : nearLimit ? "Near the semester limit" : `${maxCredits - currentCredits} credits remaining`}
      </p>
    </div>
  );
}
