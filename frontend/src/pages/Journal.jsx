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
    setCurrentPage("journal");
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

      {/* ================= JOURNAL ================= */}
      {!loading && journal.length > 0 && <JournalSection journal={journal} />}

      {/* ================= LEDGER ================= */}
      {!loading && Object.keys(ledger).length > 0 && (
        <div className="full-card">
          <h2 className="section-title">Ledger Accounts</h2>

          <div className="ledger-grid">
            {Object.keys(ledger).map((account) => (
              <LedgerSection
                key={account}
                account={account}
                data={ledger[account]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= JOURNAL SECTION ================= */
function JournalSection({ journal }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;

  const filtered = journal.filter(
    (entry) =>
      entry.debit?.toLowerCase().includes(search.toLowerCase()) ||
      entry.credit?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const exportCSV = () => {
    const headers = ["Date", "Debit", "Credit", "Amount"];
    const rows = filtered.map((e) => [e.date, e.debit, e.credit, e.amount]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "journal.csv";
    link.click();
  };

  return (
    <div className="full-card">
      <h2 className="section-title">Journal Entries</h2>

      <div className="section-controls">
        <input
          className="search-box"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <button className="export-btn" onClick={exportCSV}>
          Export CSV
        </button>
      </div>

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
            {paginated.map((entry, i) => (
              <tr key={i}>
                <td>{entry.date || "-"}</td>

                <td className="particulars">
                  <div>{entry.debit} Dr.</div>
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

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}

/* ================= LEDGER SECTION ================= */
function LedgerSection({ account, data }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const filtered = data.filter((row) =>
    row.particular?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const exportCSV = () => {
    const headers = ["Date", "Particular", "Debit", "Credit"];
    const rows = filtered.map((r) => [r.date, r.particular, r.debit, r.credit]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `${account}.csv`;
    link.click();
  };

  return (
    <div className="ledger-card">
      <h3 className="account-title">{account}</h3>

      <div className="section-controls">
        <input
          className="search-box"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <button className="export-btn" onClick={exportCSV}>
          Export
        </button>
      </div>

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
            {paginated.map((row, idx) => (
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

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}

/* ================= PAGINATION ================= */
function Pagination({ page, totalPages, setPage }) {
  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>
        Prev
      </button>

      <span>
        {page} / {totalPages || 1}
      </span>

      <button
        disabled={page === totalPages || totalPages === 0}
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
