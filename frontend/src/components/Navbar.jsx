import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { name: "Overview", path: "/dashboard" },
    { name: "Journal & Ledger", path: "/journal" },
    { name: "Financial Statements", path: "/statements" },
    { name: "Cash Flow Analysis", path: "/cashflow" },
    { name: "Comparative Insights", path: "/analysis" },
  ];

  return (
    <div className="navbar">
      <div className="nav-links">
        {links.map((link) => (
          <span
            key={link.path}
            className={`nav-item ${
              location.pathname === link.path ? "active" : ""
            }`}
            onClick={() => navigate(link.path)}
          >
            {link.name}
          </span>
        ))}
      </div>
    </div>
  );
}
