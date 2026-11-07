import React from "react";

export default function Navbar({ user, catalogCategory, onCatalogChange, onOpenAuth, onLogout, onOpenHistory }) {
  return (
    <header className="navbar">
      <a className="brand" href="#top" aria-label="Uni Course Selection home">
        <div>
          <span>Uni Course Selection</span>
          <small>Student portal</small>
        </div>
      </a>

      {user && (
        <nav className="nav-links" aria-label="Course categories">
          <button className={`nav-link ${catalogCategory === "all" ? "active" : ""}`} type="button" onClick={() => onCatalogChange("all")}>
            All courses
          </button>
          <button className={`nav-link ${catalogCategory === "major" ? "active" : ""}`} type="button" onClick={() => onCatalogChange("major")}>
            Recommended for major
          </button>
          <button className={`nav-link ${catalogCategory === "elective" ? "active" : ""}`} type="button" onClick={() => onCatalogChange("elective")}>
            General elective
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
            <button className="btn btn-outline nav-action" type="button" onClick={onOpenHistory}>
              Academic History
            </button>
            <button className="btn btn-outline nav-action" type="button" onClick={onLogout}>
              Sign Out
            </button>
          </>
        ) : <span className="nav-context">Student portal</span>}
      </div>
    </header>
  );
}
