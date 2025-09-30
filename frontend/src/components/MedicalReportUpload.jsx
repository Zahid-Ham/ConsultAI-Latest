import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaDownload } from "react-icons/fa";
import "./MedicalReportUpload.css";

const MedicalReportUpload = ({ patientId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [reports, setReports] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]); // array of selected report ids
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [sortBy, setSortBy] = useState("date"); // "date" or "name"
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" or "desc"
  const [filterType, setFilterType] = useState(""); // file type filter
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Base URL for API calls
  const API_BASE_URL = "http://localhost:5000";

  useEffect(() => {
    if (patientId) {
      console.log("Component loaded with patientId:", patientId);
      fetchReports();
    }
  }, [patientId]);

  const fetchReports = async () => {
    if (!patientId) {
      console.log("No patientId provided");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching reports for patient:", patientId);
      console.log("Fetch URL:", `${API_BASE_URL}/api/reports/${patientId}`);

      const res = await axios.get(`${API_BASE_URL}/api/reports/${patientId}`);
      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);
      console.log("Response data:", res.data);
      console.log("Response data type:", typeof res.data);

      // Check if response is HTML (indicates wrong endpoint)
      if (
        typeof res.data === "string" &&
        res.data.includes("<!doctype html>")
      ) {
        console.error(
          "❌ Received HTML instead of JSON - API endpoint not found or backend not running"
        );
        setReports([]);
        setUploadStatus(
          "❌ Backend server not responding. Check if server is running on port 5000."
        );
        return;
      }

      // Handle different response structures
      let reportsData = [];
      if (Array.isArray(res.data)) {
        reportsData = res.data;
      } else if (res.data && Array.isArray(res.data.reports)) {
        reportsData = res.data.reports;
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        reportsData = res.data.data;
      } else {
        console.warn("Unexpected response structure:", res.data);
        reportsData = [];
      }

      console.log("✅ Setting reports:", reportsData);
      setReports(reportsData);
    } catch (err) {
      console.error("❌ Error fetching reports:", err);
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);

      setReports([]);
      if (
        err.code === "ECONNREFUSED" ||
        err.message.includes("Network Error")
      ) {
        setUploadStatus(
          "❌ Cannot connect to server. Make sure backend is running on port 5000."
        );
      } else {
        setUploadStatus("❌ Failed to load reports");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 1) {
      setSelectedFile(files[0]);
    } else if (files.length > 1) {
      setSelectedFile(files);
    } else {
      setSelectedFile(null);
    }
    setUploadStatus("");
    setIsDragging(false);
  };

  // Drag and drop handlers
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
      if (files.length === 1) {
        setSelectedFile(files[0]);
      } else {
        setSelectedFile(files);
      }
      setUploadStatus("");
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      if (Array.isArray(selectedFile)) {
        for (const file of selectedFile) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("patientId", patientId);
          await axios.post(`${API_BASE_URL}/api/reports/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 30000,
          });
        }
        setUploadStatus(
          `✅ ${selectedFile.length} files uploaded successfully`
        );
      } else {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("patientId", patientId);
        await axios.post(`${API_BASE_URL}/api/reports/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        });
        setUploadStatus(`✅ ${selectedFile.name} uploaded successfully`);
      }
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchReports();
      setTimeout(() => setUploadStatus(""), 4000);
    } catch (err) {
      let errorMessage = "Upload failed";
      if (err.code === "ECONNREFUSED") {
        errorMessage = "Cannot connect to server. Check if backend is running.";
      } else if (err.response?.status === 404) {
        errorMessage = "Upload endpoint not found. Check backend routes.";
      } else if (err.response?.status === 413) {
        errorMessage = "File too large";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setUploadStatus(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/api/reports/${id}`);
      await fetchReports();
      setUploadStatus("✅ Report deleted successfully");
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setUploadStatus(`❌ Delete failed: ${errorMessage}`);
      setTimeout(() => setUploadStatus(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Batch delete selected reports
  const handleBatchDelete = async () => {
    if (selectedReports.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedReports.length} selected report(s)?`
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      for (const id of selectedReports) {
        await axios.delete(`${API_BASE_URL}/api/reports/${id}`);
      }
      await fetchReports();
      setSelectedReports([]);
      setUploadStatus(`✅ Deleted ${selectedReports.length} report(s)`);
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setUploadStatus(`❌ Batch delete failed: ${errorMessage}`);
      setTimeout(() => setUploadStatus(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Selection logic
  const handleSelectReport = (id) => {
    setSelectedReports((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };
  const handleSelectAll = (allIds) => {
    if (selectedReports.length === allIds.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(allIds);
    }
  };

  const handlePreview = (fileUrl, contentType) => {
    console.log("👁️ Opening preview:", fileUrl, contentType);
    // Open in new tab instead of showing below
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownload = async (fileUrl, filename) => {
    try {
      console.log("📥 Starting download:", filename);

      // Fetch the file as a blob
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "download";
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log("✅ Download triggered successfully");
    } catch (error) {
      console.error("❌ Download failed:", error);
      // Fallback to opening in new tab if download fails
      window.open(fileUrl, "_blank");
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    } catch (err) {
      console.error("Date formatting error:", err);
      return "Invalid Date";
    }
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
          tabIndex={0}
          role="button"
          aria-label="Upload medical report by drag and drop or click"
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

      {/* Grid/List Toggle & Sorting/Filtering Controls */}
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
            Sort by:
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Date</option>
              <option value="name">Name</option>
            </select>
          </label>
          <button
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
          <label className="filter-label">
            Type:
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All</option>
              <option value="pdf">PDF</option>
              <option value="doc">DOC</option>
              <option value="docx">DOCX</option>
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </label>
        </div>
      </div>
      {/* Premium Search Field - now below controls */}
      <div className="search-bar-container below-controls">
        <input
          type="text"
          className="search-bar"
          placeholder="Search by document name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          aria-label="Search medical reports by name"
          disabled={loading}
        />
      </div>

      {selectedFile &&
        (Array.isArray(selectedFile) ? (
          <div className="selected-file-list">
            {selectedFile.map((file, idx) => (
              <p className="selected-file" key={idx}>
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            ))}
          </div>
        ) : (
          <p className="selected-file">
            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
            MB)
          </p>
        ))}

      {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
      {loading && <p>Loading...</p>}

      {!loading &&
      (!reports || !Array.isArray(reports) || reports.length === 0) ? (
        <p>No reports uploaded yet.</p>
      ) : !loading && Array.isArray(reports) ? (
        (() => {
          // Filter and sort reports
          let filteredReports = reports;
          // Filter by search query
          if (searchQuery.trim()) {
            filteredReports = filteredReports.filter((r) =>
              r.filename.toLowerCase().includes(searchQuery.trim().toLowerCase())
            );
          }
          // Filter by file type
          if (filterType) {
            filteredReports = filteredReports.filter((r) => {
              const ext = r.filename.split(".").pop().toLowerCase();
              return ext === filterType;
            });
          }
          filteredReports = filteredReports.slice().sort((a, b) => {
            if (sortBy === "name") {
              if (sortOrder === "asc") {
                return a.filename.localeCompare(b.filename);
              } else {
                return b.filename.localeCompare(a.filename);
              }
            } else {
              // sort by date
              const dateA = new Date(a.createdAt || a.uploadDate);
              const dateB = new Date(b.createdAt || b.uploadDate);
              if (sortOrder === "asc") {
                return dateA - dateB;
              } else {
                return dateB - dateA;
              }
            }
          });
          const allIds = filteredReports.map((r) => r._id || r.id);
          return (
            <>
              {/* Batch actions bar */}
              <div className="batch-actions-bar">
                <label className="select-all-label">
                  <input
                    type="checkbox"
                    checked={
                      selectedReports.length === allIds.length &&
                      allIds.length > 0
                    }
                    onChange={() => handleSelectAll(allIds)}
                    disabled={loading || allIds.length === 0}
                  />
                  Select All
                </label>
                <button
                  className="batch-delete-btn"
                  onClick={handleBatchDelete}
                  disabled={loading || selectedReports.length === 0}
                >
                  <FaTrash style={{ marginRight: 6 }} /> Delete Selected
                </button>
                <span className="selected-count">
                  {selectedReports.length > 0
                    ? `${selectedReports.length} selected`
                    : null}
                </span>
              </div>
              {viewMode === "grid" ? (
                <div className="reports-grid">
                  {filteredReports.map((report) => {
                    const id = report._id || report.id;
                    return (
                      <div
                        key={id}
                        className={`report-card${
                          selectedReports.includes(id) ? " selected" : ""
                        }`}
                        onClick={(e) => {
                          if (
                            !e.target.closest("button") &&
                            !e.target.closest("a") &&
                            !e.target.closest("input")
                          ) {
                            handlePreview(report.fileUrl, report.contentType);
                          }
                        }}
                        title="Click to preview"
                        tabIndex={0}
                        role="button"
                        style={{ cursor: "pointer" }}
                      >
                        <div className="report-card-select">
                          <input
                            type="checkbox"
                            checked={selectedReports.includes(id)}
                            onChange={() => handleSelectReport(id)}
                            onClick={(e) => e.stopPropagation()}
                            disabled={loading}
                          />
                        </div>
                        <div className="report-card-filename">
                          {report.filename}
                        </div>
                        <div className="report-card-date">
                          {formatDate(report.createdAt || report.uploadDate)}
                        </div>
                        <div className="report-card-actions">
                          <button
                            className="icon-btn download-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(report.fileUrl, report.filename);
                            }}
                            title="Download"
                            disabled={loading}
                          >
                            <FaDownload />
                          </button>
                          <button
                            className="icon-btn delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(id);
                            }}
                            title="Delete"
                            disabled={loading}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="table-container">
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={
                              selectedReports.length === allIds.length &&
                              allIds.length > 0
                            }
                            onChange={() => handleSelectAll(allIds)}
                            disabled={loading || allIds.length === 0}
                          />
                        </th>
                        <th>Name</th>
                        <th>Date Uploaded</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.map((report) => {
                        const id = report._id || report.id;
                        return (
                          <tr
                            key={id}
                            className={`report-row clickable-row${
                              selectedReports.includes(id) ? " selected" : ""
                            }`}
                            onClick={(e) => {
                              if (
                                !e.target.closest("button") &&
                                !e.target.closest("a") &&
                                !e.target.closest("input")
                              ) {
                                handlePreview(
                                  report.fileUrl,
                                  report.contentType
                                );
                              }
                            }}
                            style={{ cursor: "pointer" }}
                            title="Click to preview"
                          >
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedReports.includes(id)}
                                onChange={() => handleSelectReport(id)}
                                onClick={(e) => e.stopPropagation()}
                                disabled={loading}
                              />
                            </td>
                            <td>{report.filename}</td>
                            <td>
                              {formatDate(
                                report.createdAt || report.uploadDate
                              )}
                            </td>
                            <td className="actions-cell">
                              <button
                                className="icon-btn download-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(
                                    report.fileUrl,
                                    report.filename
                                  );
                                }}
                                title="Download"
                                disabled={loading}
                              >
                                <FaDownload />
                              </button>
                              <button
                                className="icon-btn delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(id);
                                }}
                                title="Delete"
                                disabled={loading}
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          );
        })()
      ) : null}
    </div>
  );
};

export default MedicalReportUpload;
