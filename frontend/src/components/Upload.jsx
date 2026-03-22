import axios from "axios";
import { useState } from "react";
import { useStore } from "../store/useStore";

export default function Upload() {
  const [fileName, setFileName] = useState("");

  const setData = useStore((state) => state.setData);
  const setSummary = useStore((state) => state.setSummary);

  const handleUpload = async (file) => {
    try {
      if (!file) return;

      setFileName(file.name);

      const formData = new FormData();
      formData.append("file", file);

      const res1 = await axios.post("http://127.0.0.1:8000/process", formData);
      const res2 = await axios.post("http://127.0.0.1:8000/analyze", formData);

      if (res1.data.error || res2.data.error) {
        alert(res1.data.error || res2.data.error);
        return;
      }

      setData(res1.data.classified_data || []);
      setSummary(res2.data || null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
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
        <label className="upload-btn">
          Upload File
          <input
            type="file"
            hidden
            onChange={(e) => handleUpload(e.target.files[0])}
          />
        </label>
      </div>

      {fileName && <p className="file-name">📄 {fileName}</p>}
    </div>
  );
}
