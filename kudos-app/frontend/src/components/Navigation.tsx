import React from "react";
import { User } from "../types";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: "feed" | "sent" | "received" | "admin") => void;
  user?: User;
}

const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onPageChange,
  user,
}) => {
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <h1>🎉 Kudos</h1>
        </div>

        <ul className="nav-menu">
          <li>
            <button
              className={`nav-link ${currentPage === "feed" ? "active" : ""}`}
              onClick={() => onPageChange("feed")}
            >
              Feed
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === "sent" ? "active" : ""}`}
              onClick={() => onPageChange("sent")}
            >
              Sent
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === "received" ? "active" : ""}`}
              onClick={() => onPageChange("received")}
            >
              Received
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === "admin" ? "active" : ""}`}
              onClick={() => onPageChange("admin")}
            >
              Admin
            </button>
          </li>
        </ul>

        <div className="nav-user">
          {user && (
            <>
              <span className="user-name">{user.fullName}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
