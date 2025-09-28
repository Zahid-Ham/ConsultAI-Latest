import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaDownload } from "react-icons/fa";
import "./MedicalReportUpload.css";

const MedicalReportUpload = ({ patientId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [reports, setReports] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [loading, setLoading] = useState(false);

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
      if (typeof res.data === 'string' && res.data.includes('<!doctype html>')) {
        console.error("❌ Received HTML instead of JSON - API endpoint not found or backend not running");
        setReports([]);
        setUploadStatus("❌ Backend server not responding. Check if server is running on port 5000.");
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
      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        setUploadStatus("❌ Cannot connect to server. Make sure backend is running on port 5000.");
      } else {
        setUploadStatus("❌ Failed to load reports");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("File selected:", file?.name, file?.type, file?.size);
    setSelectedFile(file);
    setUploadStatus("");
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

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("patientId", patientId);

    try {
      setLoading(true);
      console.log("🔄 Starting upload...");
      console.log("Upload URL:", `${API_BASE_URL}/api/reports/upload`);
      console.log("File:", selectedFile.name, selectedFile.type, selectedFile.size, "bytes");
      console.log("Patient ID:", patientId);
      
      const response = await axios.post(`${API_BASE_URL}/api/reports/upload`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 seconds timeout
      });
      
      console.log("✅ Upload successful!");
      console.log("Upload response:", response.data);
      
      setUploadStatus(`✅ ${selectedFile.name} uploaded successfully`);
      setSelectedFile(null);
      
      // Reset the file input
      const fileInput = document.querySelector('.file-input');
      if (fileInput) fileInput.value = '';
      
      // Refresh the reports list
      await fetchReports();
      
      setTimeout(() => setUploadStatus(""), 4000);
    } catch (err) {
      console.error("❌ Upload failed:", err);
      console.error("Upload error response:", err.response);
      console.error("Upload error status:", err.response?.status);
      console.error("Upload error data:", err.response?.data);
      
      let errorMessage = "Upload failed";
      if (err.code === 'ECONNREFUSED') {
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
      console.log("🗑️ Deleting report:", id);
      console.log("Delete URL:", `${API_BASE_URL}/api/reports/${id}`);
      
      await axios.delete(`${API_BASE_URL}/api/reports/${id}`);
      console.log("✅ Report deleted successfully");
      
      await fetchReports();
      setUploadStatus("✅ Report deleted successfully");
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (err) {
      console.error("❌ Delete failed:", err);
      console.error("Delete error response:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || err.message;
      setUploadStatus(`❌ Delete failed: ${errorMessage}`);
      setTimeout(() => setUploadStatus(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (fileUrl, contentType) => {
    console.log("👁️ Opening preview:", fileUrl, contentType);
    // Open in new tab instead of showing below
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
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
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'download';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log("✅ Download triggered successfully");
    } catch (error) {
      console.error("❌ Download failed:", error);
      // Fallback to opening in new tab if download fails
      window.open(fileUrl, '_blank');
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
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
          onChange={handleFileChange}
          className="file-input"
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
      
      {selectedFile && (
        <p>Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
      )}
      
      {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
      {loading && <p>Loading...</p>}

      {!loading && (!reports || !Array.isArray(reports) || reports.length === 0) ? (
        <p>No reports uploaded yet.</p>
      ) : !loading && Array.isArray(reports) ? (
        <div className="table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report._id || report.id}
                  className="report-row clickable-row"
                  onClick={(e) => {
                    // Only trigger preview if the click is NOT on a button or link
                    if (!e.target.closest("button") && !e.target.closest("a")) {
                      handlePreview(report.fileUrl, report.contentType);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                  title="Click to preview"
                >
                  <td>{report.filename}</td>
                  <td>{formatDate(report.createdAt || report.uploadDate)}</td>
                  <td className="actions-cell">
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
                        handleDelete(report._id || report.id);
                      }}
                      title="Delete"
                      disabled={loading}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default MedicalReportUpload;