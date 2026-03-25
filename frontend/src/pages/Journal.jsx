import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Journal.css";
import { useStore } from "../store/useStore";

export default function Journal() {
  const [loading, setLoading] = useState(false);

  const setCurrentPage = useStore((state) => state.setCurrentPage);

  const setFileName = useStore((state) => state.setFileName);
  const fileName = useStore((state) => state.fileName);

  const journal = useStore((state) => state.journal);
  const ledger = useStore((state) => state.ledger);
  const setJournal = useStore((state) => state.setJournal);
  const setLedger = useStore((state) => state.setLedger);

  useEffect(() => {
    setCurrentPage("journal"); // 🔥 IMPORTANT
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;

    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8000/journal-ledger",
        formData,
      );

      setJournal(res.data.journal);
      setLedger(res.data.ledger);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleUpload(file);
  };

  return (
    <div className="journal-container">
      <div className="header">
        <h1>Journal & Ledger</h1>
        <p>Automated Double Entry Accounting</p>
      </div>

      <div
        className="upload-card"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="upload-inner">
          <p className="upload-text">Drag & Drop your file here</p>

          <label className="upload-btn">
            Choose File
            <input
              type="file"
              hidden
              onChange={(e) => handleUpload(e.target.files[0])}
            />
          </label>

          {fileName && <p className="file-name">📄 {fileName}</p>}
        </div>
      </div>

      {loading && (
        <div className="loader-overlay">
          <div className="loader-box">
            <div className="spinner"></div>
            <p>Generating Journal & Ledger...</p>
          </div>
        </div>
      )}

      {!loading && journal.length > 0 && (
        <div className="full-card">
          <h2 className="section-title">Journal Entries</h2>

          <div className="ledger-table-wrapper">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Particulars</th>
                  <th>Debit (₹)</th>
                  <th>Credit (₹)</th>
                </tr>
              </thead>

              <tbody>
                {journal.map((entry, i) => (
                  <tr key={i}>
                    <td>{entry.date || "-"}</td>

                    <td className="particulars">
                      <div className="debit-line">
                        {entry.debit} <span>Dr.</span>
                      </div>

                      <div className="credit-line">To {entry.credit}</div>

                      <div className="narration">({entry.narration})</div>
                    </td>

                    <td className="debit">{entry.amount}</td>
                    <td className="credit">{entry.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && Object.keys(ledger).length > 0 && (
        <div className="full-card">
          <h2 className="section-title">Ledger Accounts</h2>

          <div className="ledger-grid">
            {Object.keys(ledger).map((account) => (
              <div key={account} className="ledger-card">
                <h3 className="account-title">{account}</h3>

                <div className="ledger-table-wrapper">
                  <table className="ledger-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Particulars</th>
                        <th>Debit</th>
                        <th>Credit</th>
                      </tr>
                    </thead>

                    <tbody>
                      {ledger[account].map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.date || "-"}</td>
                          <td>{row.particular}</td>
                          <td className="debit">{row.debit || "-"}</td>
                          <td className="credit">{row.credit || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
