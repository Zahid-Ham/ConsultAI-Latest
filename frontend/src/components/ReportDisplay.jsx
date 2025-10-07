import React from 'react';
import './ReportDisplay.css'; // We'll create this file for basic styling

function ReportDisplay({ data }) {
  // If data isn't available or is not an object, don't render anything
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Destructure the data for easier access
  const { summary, patientInfo, testResults, abnormalFindings, recommendations } = data;

  return (
    <div className="report-container">
      <h3>Analysis Summary</h3>
      <p className="summary">{summary || 'No summary available.'}</p>

      {patientInfo && (
        <>
          <h4>Patient Information</h4>
          <div className="info-grid">
            <p><strong>Name:</strong> {patientInfo.name}</p>
            <p><strong>ID:</strong> {patientInfo.patientId}</p>
            <p><strong>DOB:</strong> {patientInfo.dob}</p>
          </div>
        </>
      )}

      {testResults && testResults.length > 0 && (
        <>
          <h4>Test Results</h4>
          <table className="results-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Result</th>
                <th>Reference Range</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((test, index) => (
                <tr key={index}>
                  <td>{test.testName}</td>
                  <td>{`${test.result} ${test.units || ''}`}</td>
                  <td>{test.referenceRange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {abnormalFindings && abnormalFindings.length > 0 && (
        <>
          <h4>Abnormal Findings</h4>
          <ul className="findings-list">
            {abnormalFindings.map((finding, index) => (
              <li key={index}>{finding}</li>
            ))}
          </ul>
        </>
      )}

      {recommendations && recommendations.length > 0 && (
        <>
          <h4>Recommendations</h4>
          <ul className="findings-list">
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default ReportDisplay;