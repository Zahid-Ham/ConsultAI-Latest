import React, { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { FaTrash } from "react-icons/fa";
import "./MedicalReportUpload.css";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import ChatFloatingButton from "./ChatWithAI"; // Ensure this import path is correct

const MedicalReportUpload = ({ patientId }) => {
  const location = useLocation();
  const { isPatient } = useAuthContext();
  const showChatAIButton =
    isPatient &&
    location.pathname !== "/chat" &&
    location.pathname !== "/chat/ai";
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [reports, setReports] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (patientId) {
      fetchReports();
    }
  }, [patientId]);

  const fetchReports = async () => {
    if (!patientId) return;

    try {
      setLoading(true);
      const res = await api.get(`/reports/${patientId}`);

      let reportsData = [];
      if (Array.isArray(res.data)) {
        reportsData = res.data;
      } else if (res.data && Array.isArray(res.data.reports)) {
        reportsData = res.data.reports;
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        reportsData = res.data.data;
      }
      setReports(reportsData);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setReports([]);
      setUploadStatus("❌ Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 1) setSelectedFile(files[0]);
    else if (files.length > 1) setSelectedFile(files);
    else setSelectedFile(null);

    setUploadStatus("");
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 1) setSelectedFile(files[0]);
      else setSelectedFile(files);
      setUploadStatus("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("⚠️ Please select a file");
      return;
    }
    if (!patientId) {
      setUploadStatus("⚠️ Patient ID is required");
      return;
    }
    try {
      setLoading(true);

      // FIX: Force Content-Type to multipart/form-data for file uploads
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (Array.isArray(selectedFile)) {
        for (const file of selectedFile) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("patientId", patientId);
          await api.post(`/reports/upload`, formData, config);
        }
        setUploadStatus(
          `✅ ${selectedFile.length} files uploaded successfully`
        );
      } else {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("patientId", patientId);
        await api.post(`/reports/upload`, formData, config);
        setUploadStatus(`✅ ${selectedFile.name} uploaded successfully`);
      }
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchReports();
      setTimeout(() => setUploadStatus(""), 4000);
    } catch (err) {
      console.error("Upload Error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Upload failed";
      setUploadStatus(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      setLoading(true);
      await api.delete(`/reports/${id}`);
      await fetchReports();
      setUploadStatus("✅ Report deleted successfully");
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (err) {
      setUploadStatus(`❌ Delete failed`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (fileUrl) => {
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="report-upload-container">
      <h1>Medical Reports</h1>

      <div className="upload-section">
        <div
          className={`drop-zone${isDragging ? " dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <span className="drop-zone-icon">📄</span>
          <span className="drop-zone-text">
            {isDragging
              ? "Drop your file here"
              : "Drag & drop or click to upload medical report"}
          </span>
        </div>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
          multiple
          onChange={handleFileChange}
          className="file-input"
          ref={fileInputRef}
          style={{ display: "none" }}
          disabled={loading}
        />
        <button
          onClick={handleUpload}
          className="upload-btn"
          disabled={loading || !selectedFile}
        >
          {loading ? "Uploading..." : "Upload Report"}
        </button>
      </div>

      <div className="controls-bar">
        <div className="view-toggle-bar">
          <button
            className={`view-toggle-btn${viewMode === "grid" ? " active" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            Grid View
          </button>
          <button
            className={`view-toggle-btn${viewMode === "list" ? " active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            List View
          </button>
        </div>
        <div className="sort-filter-bar">
          <label className="sort-label">
            Sort by:{" "}
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Date</option>
              <option value="name">Name</option>
            </select>
          </label>
          <button
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
          <label className="filter-label">
            Type:{" "}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All</option>
              <option value="pdf">PDF</option>
              <option value="jpg">JPG</option>
            </select>
          </label>
        </div>
      </div>
      <div className="search-bar-container below-controls">
        <input
          type="text"
          className="search-bar"
          placeholder="Search by document name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading}
        />
      </div>

      {selectedFile &&
        (Array.isArray(selectedFile) ? (
          <p className="selected-file">{selectedFile.length} files selected</p>
        ) : (
          <p className="selected-file">{selectedFile.name}</p>
        ))}
      {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
      {loading && <p>Loading...</p>}

      {!loading && (!reports || reports.length === 0) ? (
        <p>No reports uploaded yet.</p>
      ) : (
        (() => {
          let filteredReports = reports;
          if (searchQuery.trim())
            filteredReports = filteredReports.filter((r) =>
              r.filename
                .toLowerCase()
                .includes(searchQuery.trim().toLowerCase())
            );
          if (filterType)
            filteredReports = filteredReports.filter(
              (r) => r.filename.split(".").pop().toLowerCase() === filterType
            );
          filteredReports.sort((a, b) => {
            return sortOrder === "asc"
              ? new Date(a.createdAt) - new Date(b.createdAt)
              : new Date(b.createdAt) - new Date(a.createdAt);
          });

          return (
            <div className={`reports-${viewMode}`}>
              {filteredReports.map((report) => (
                <div key={report._id || report.id} className="report-card">
                  <div className="report-card-filename">{report.filename}</div>
                  <div className="report-card-actions">
                    <button onClick={() => handlePreview(report.fileUrl)}>
                      Preview
                    </button>
                    <button
                      onClick={() => handleDelete(report._id || report.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })()
      )}
      {showChatAIButton && <ChatFloatingButton />}
    </div>
  );
};

export default MedicalReportUpload;
