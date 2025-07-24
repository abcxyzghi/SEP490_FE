import React, { useEffect, useState } from 'react';
import { getReportofUser } from '../../../services/api.order';

export default function ReportHistory() {
  const [reports, setReports] = useState([]);
  useEffect(() => {
    async function fetchReports() {
      const data = await getReportofUser();
      if (Array.isArray(data)) setReports(data);
    }
    fetchReports();
  }, []);

  return (
    <div>
      <h2>Report History</h2>
      {reports.length === 0 ? (
        <div>No reports found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Title</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Content</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Status</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, idx) => (
              <tr key={report.id || idx}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{report.title}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{report.content}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{report.status ? 'Resolved' : 'Pending'}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{new Date(report.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
