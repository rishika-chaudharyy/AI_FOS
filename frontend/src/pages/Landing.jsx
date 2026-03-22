import { useNavigate } from "react-router-dom";
import "../styles/Landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="card">
        <h1 className="logo">AuditAgent</h1>

        <p className="headline">
          Financial Intelligence Engine for Modern Enterprises
        </p>

        <p className="description">
          Upload one or multiple financial reports and convert them into
          structured, audit-ready intelligence. Automatically generate profit &
          loss statements, balance sheets, and journal entries while analyzing
          assets, liabilities, income, and expenses across periods. Identify
          trends, detect anomalies, and gain actionable insights - all within a
          unified financial system.
        </p>

        <button className="cta" onClick={() => navigate("/dashboard")}>
          Get Started →
        </button>
      </div>
    </div>
  );
}
