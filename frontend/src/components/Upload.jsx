import axios from "axios";
import { useState } from "react";
import { useStore } from "../store/useStore";

export default function Upload() {
  const [loading, setLoading] = useState(false);

  const fileName = useStore((state) => state.fileName);
  const setFileName = useStore((state) => state.setFileName);

  const setData = useStore((state) => state.setData);
  const setSummary = useStore((state) => state.setSummary);

  const handleUpload = async (file) => {
    try {
      if (!file || loading) return;

      setLoading(true);

      setFileName(file.name);

      const formData = new FormData();
      formData.append("file", file);

      const res1 = await axios.post("http://127.0.0.1:8000/process", formData);
      const res2 = await axios.post("http://127.0.0.1:8000/analyze", formData);

      if (res1.data.error || res2.data.error) {
        alert(res1.data.error || res2.data.error);
        setLoading(false);
        return;
      }

      setData(res1.data.classified_data || []);
      setSummary(res2.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (loading) return;
    const file = e.dataTransfer.files[0];
    handleUpload(file);
  };

  return (
    <div
      className="upload-box"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <p className="upload-text">Drag & Drop your file here</p>

      <div className="upload-actions">
        <label className={`upload-btn ${loading ? "disabled" : ""}`}>
          {loading ? "Processing..." : "Upload File"}
          <input
            type="file"
            hidden
            disabled={loading}
            onChange={(e) => handleUpload(e.target.files[0])}
          />
        </label>
      </div>

      {fileName && <p className="file-name">📄 {fileName}</p>}

      {loading && (
        <div className="loader-overlay">
          <div className="loader-box">
            <div className="spinner"></div>
            <p>Processing your file...</p>
          </div>
        </div>
      )}
    </div>
  );
}
