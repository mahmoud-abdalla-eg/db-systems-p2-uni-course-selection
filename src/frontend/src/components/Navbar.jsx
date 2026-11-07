import React from "react";

export default function Navbar({ user, onOpenAuth, onLogout, onOpenHistory }) {
  return (
    <header className="navbar">
      <a className="brand" href="#top" aria-label="Uni Course Selection home">
        <div className="brand-icon">CF</div>
        <div>
          <span>Uni Course Selection</span>
          <small>Database Systems · Project 2</small>
        </div>
      </a>

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
        ) : (
          <button className="btn btn-primary" type="button" onClick={onOpenAuth}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
