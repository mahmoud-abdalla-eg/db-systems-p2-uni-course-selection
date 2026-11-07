import React from "react";

export default function Navbar({ user, onOpenAuth, onLogout, onOpenHistory }) {
  return (
    <header className="navbar">
      <div className="brand" aria-label="CourseForge home">
        <div className="brand-icon">CF</div>
        <div>
          <span>CourseForge</span>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "normal" }}>
            Teaching Administration & Course Selection
          </div>
        </div>
      </div>

      <div className="nav-user">
        {user ? (
          <>
            <div className="user-badge">
              <span className="user-name">{user.name}</span>
              <span className="user-meta">{user.userNo} &bull; {user.major}</span>
            </div>
            <button className="btn btn-outline" style={{ fontSize: "0.82rem", padding: "0.4rem 0.8rem" }} onClick={onOpenHistory}>
              Academic History
            </button>
            <button className="btn btn-outline" style={{ fontSize: "0.82rem", padding: "0.4rem 0.8rem" }} onClick={onLogout}>
              Sign Out
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={onOpenAuth}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
