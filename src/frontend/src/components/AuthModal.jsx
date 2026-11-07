import React, { useState } from "react";

export default function AuthModal({ isOpen, onClose, onLogin, onRegister }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [userNo, setUserNo] = useState("");
  const [major, setMajor] = useState("Computer Science");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await onRegister({ email, password, name, userNo, major });
      } else {
        await onLogin(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail, demoPass) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsRegister(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
            {isRegister ? "Student Registration" : "Student Portal Sign In"}
          </h2>
          <button className="btn btn-outline" style={{ padding: "0.2rem 0.5rem" }} onClick={onClose}>
            &times;
          </button>
        </div>

        {error && (
          <div className="alert-box alert-error" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label>Student Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                />
              </div>
              <div className="form-group">
                <label>Student ID Number</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={userNo}
                  onChange={e => setUserNo(e.target.value)}
                  placeholder="e.g. 2024101001"
                />
              </div>
              <div className="form-group">
                <label>Major / Degree Program</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={major}
                  onChange={e => setMajor(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Student Email Address</label>
            <input
              type="email"
              className="form-input"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. alex.student@jnu.edu.cn"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loading}>
            {loading ? "Processing..." : isRegister ? "Create Student Account" : "Sign In to CourseForge"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.85rem" }}>
          {isRegister ? (
            <span>
              Already registered?{" "}
              <button className="text-link" type="button" onClick={() => setIsRegister(false)}>
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New student?{" "}
              <button className="text-link" type="button" onClick={() => setIsRegister(true)}>
                Register Account
              </button>
            </span>
          )}
        </div>

        {/* Demo Fast-Fill Accounts */}
        <div className="demo-credentials">
          <strong style={{ display: "block", marginBottom: "0.35rem" }}>Click to Autofill Demo Test Students:</strong>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", textAlign: "left", display: "block" }}
              onClick={() => fillDemo("alex.student@jnu.edu.cn", "student123")}
            >
              1. <strong>Alex Chen</strong> (Passed CS101, CS102 &mdash; test prerequisite blocking on CS202)
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", textAlign: "left", display: "block" }}
              onClick={() => fillDemo("maria.silva@jnu.edu.cn", "student123")}
            >
              2. <strong>Maria Silva</strong> (Passed CS101, CS102, CS201, CS202 &mdash; test credit limit / advanced)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
