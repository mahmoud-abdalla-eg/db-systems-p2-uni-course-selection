import React, { useEffect, useState } from "react";

export default function AuthModal({ isOpen, onClose, onLogin, onRegister, embedded = false }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [userNo, setUserNo] = useState("");
  const [major, setMajor] = useState("Computer Science");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen]);

  if (!isOpen && !embedded) return null;

  function switchMode(registerMode) {
    setIsRegister(registerMode);
    setError(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanUserNo = userNo.trim();
    const cleanMajor = major.trim();

    if (!cleanEmail || !password) {
      setError("Enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (isRegister && (!cleanName || !cleanUserNo || !cleanMajor)) {
      setError("Complete your name, student number, and major.");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await onRegister({ email: cleanEmail, password, name: cleanName, userNo: cleanUserNo, major: cleanMajor });
      } else {
        await onLogin(cleanEmail, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail, demoPass) {
    setEmail(demoEmail);
    setPassword(demoPass);
    switchMode(false);
  }

  const content = (
      <section className={`modal-content auth-modal ${embedded ? "auth-page-card" : ""}`} role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={event => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="kicker">Uni Course Selection</p>
            <h2 id="auth-title">{isRegister ? "Create your student account" : "Welcome back"}</h2>
          </div>
          {!embedded && <button className="modal-close" type="button" onClick={onClose} aria-label="Close authentication dialog">&times;</button>}
        </div>

        <p className="auth-intro">
          {isRegister ? "Create an account to save your course selection." : "Sign in to select courses and view your timetable."}
        </p>

        {error && <div className="alert-box alert-error auth-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <>
              <div className="form-group">
                <label htmlFor="student-name">Full name</label>
                <input id="student-name" type="text" className="form-input" required value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Alex Chen" autoComplete="name" />
              </div>
              <div className="form-group">
                <label htmlFor="student-number">Student number</label>
                <input id="student-number" type="text" className="form-input" required value={userNo} onChange={event => setUserNo(event.target.value)} placeholder="e.g. 2024101001" autoComplete="off" />
              </div>
              <div className="form-group">
                <label htmlFor="student-major">Major</label>
                <input id="student-major" type="text" className="form-input" required value={major} onChange={event => setMajor(event.target.value)} autoComplete="organization-title" />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="student-email">Student email</label>
            <input id="student-email" type="email" className="form-input" required value={email} onChange={event => setEmail(event.target.value)} placeholder="e.g. alex.student@jnu.edu.cn" autoComplete="email" />
          </div>

          <div className="form-group">
            <label htmlFor="student-password">Password</label>
            <input id="student-password" type="password" className="form-input" required minLength={6} value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete={isRegister ? "new-password" : "current-password"} />
          </div>

          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? "Checking..." : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="auth-switch">
          {isRegister ? (
            <span>Already registered? <button className="text-link" type="button" onClick={() => switchMode(false)}>Sign in</button></span>
          ) : (
            <span>New student? <button className="text-link" type="button" onClick={() => switchMode(true)}>Create an account</button></span>
          )}
        </div>

        {!isRegister && (
          <div className="demo-credentials">
            <strong>Demo accounts</strong>
            <p>Use one of these to demonstrate the database rules.</p>
            <button type="button" className="demo-account" onClick={() => fillDemo("alex.student@jnu.edu.cn", "student123")}>
              <span>Alex Chen</span><small>Prerequisite checks</small>
            </button>
            <button type="button" className="demo-account" onClick={() => fillDemo("maria.silva@jnu.edu.cn", "student123")}>
              <span>Maria Silva</span><small>Advanced and credit checks</small>
            </button>
          </div>
        )}
      </section>
  );

  return embedded ? content : <div className="modal-overlay" role="presentation" onClick={onClose}>{content}</div>;
}
