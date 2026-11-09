import React from "react";

export default function Navbar({ user, activeTab, catalogCategory, onCatalogChange, onWorkspaceChange, onLogout }) {
  return (
    <header className="navbar">
      <a className="brand" href="#top" aria-label="University Course Selection home">
        <div>
          <span>University Course Selection</span>
          <small>Student portal</small>
        </div>
      </a>

      {user && (
        <nav className="nav-links" aria-label="Student workspace">
          <button className={`nav-link ${activeTab === "available" && catalogCategory === "all" ? "active" : ""}`} type="button" onClick={() => onCatalogChange("all")} aria-current={activeTab === "available" && catalogCategory === "all" ? "page" : undefined}>
            All courses
          </button>
          <button className={`nav-link ${activeTab === "available" && catalogCategory === "major" ? "active" : ""}`} type="button" onClick={() => onCatalogChange("major")} aria-current={activeTab === "available" && catalogCategory === "major" ? "page" : undefined}>
            Recommended this semester
          </button>
          <button className={`nav-link ${activeTab === "available" && catalogCategory === "curriculum" ? "active" : ""}`} type="button" onClick={() => onCatalogChange("curriculum")} aria-current={activeTab === "available" && catalogCategory === "curriculum" ? "page" : undefined}>
            Major curriculum
          </button>
          <button className={`nav-link ${activeTab === "enrolled" ? "active" : ""}`} type="button" onClick={() => onWorkspaceChange("enrolled")} aria-current={activeTab === "enrolled" ? "page" : undefined}>
            My selection
          </button>
          <button className={`nav-link ${activeTab === "timetable" ? "active" : ""}`} type="button" onClick={() => onWorkspaceChange("timetable")} aria-current={activeTab === "timetable" ? "page" : undefined}>
            Timetable
          </button>
        </nav>
      )}

      <div className="nav-user">
        {user ? (
          <>
            <div className="user-badge">
              <span className="user-name">{user.name}</span>
              <span className="user-meta">{user.userNo} &bull; {user.major}</span>
            </div>
            <button className="btn btn-outline nav-action" type="button" onClick={onLogout}>
              Sign Out
            </button>
          </>
        ) : <span className="nav-context">Student portal</span>}
      </div>
    </header>
  );
}
