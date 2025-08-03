import React, { useEffect, useState } from "react";
import "./ReportHistory.css";
import { getReportofUser } from "../../../services/api.order";

export default function ReportHistory() {
  const [reports, setReports] = useState([]);
  const [selectedType, setSelectedType] = useState("product"); // "product" | "user"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const data = await getReportofUser();
        if (Array.isArray(data)) setReports(data);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  // Split product vs user reports
  const productReports = reports.filter((r) => r.sellProductId && r.sellProductId !== "Unknown");
  const userReports = reports.filter((r) => r.sellerId && r.sellerId !== "Unknown");

  const displayedReports =
    selectedType === "product"
      ? productReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : userReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Status badge class
  const getStatusClass = (status) => {
    return status ? "report-history-status-badge-success" : "report-history-status-badge-pending";
  };

  if (loading) {
    return (
      <div className="report-history-container">
        {/* Toggle Skeleton */}
        <div className="report-history-toggle">
          <div className="skeleton h-10 w-32 sm:w-36 md:w-40 lg:w-48 mb-4 bg-gray-700/40 rounded-md"></div>
        </div>

        {/* Card List Skeleton */}
        <div className="report-history-card-list">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="report-history-card">
              {/* Left Side */}
              <div className="report-history-card-left w-full">
                <div className="skeleton h-5 w-32 mb-2 bg-gray-700/40 rounded"></div>
                <div className="skeleton h-3 w-40 mb-1 bg-gray-700/40 rounded"></div>
                <div className="skeleton h-3 w-28 bg-gray-700/40 rounded"></div>
              </div>

              {/* Right Side */}
              <div className="report-history-card-right items-end">
                <div className="skeleton h-4 w-24 mb-2 bg-gray-700/40 rounded"></div>
                <div className="skeleton h-3 w-28 bg-gray-700/40 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="report-history-container">
      {/* Toggle Buttons */}
      <div className="report-history-toggle">
        <button
          className={`report-history-product-toggle-btn ${selectedType === "product" ? "active" : ""}`}
          onClick={() => setSelectedType("product")}
        >
          Product Reports
        </button>
        <button
          className={`report-history-user-toggle-btn ${selectedType === "user" ? "active" : ""}`}
          onClick={() => setSelectedType("user")}
        >
          User Reports
        </button>
      </div>

      {displayedReports.length === 0 ? (
        <div className="report-history-empty oleo-script-regular">
          <p>No {selectedType} reports yet.</p>
        </div>
      ) : (

        <div className="report-history-card-list">
          {displayedReports.map((report, idx) => (
            <div key={report.id || idx} className="report-history-card">
              {/* Left Side */}
              <div className="report-history-card-left">
                {selectedType === "product" ? (
                  <>
                    <p className="report-history-type oleo-script-bold">Product Report</p>
                    <p className="report-history-field oxanium-regular">
                      Product: {report.productName || "Unknown"}
                    </p>
                    <p className="report-history-field oxanium-regular">Title: {report.title}</p>
                    <p className="report-history-field oxanium-regular">Content: {report.content}</p>
                  </>
                ) : (
                  <>
                    <p className="report-history-type oleo-script-bold">User Report</p>
                    <p className="report-history-field oxanium-regular">
                      Reported User: {report.sellerName || "Unknown"}
                    </p>
                    <p className="report-history-field oxanium-regular">Title: {report.title}</p>
                    <p className="report-history-field oxanium-regular">Content: {report.content}</p>
                  </>
                )}
              </div>

              {/* Right Side */}
              <div className="report-history-card-right">
                <span className={`report-history-status-badge ${getStatusClass(report.status)} oxanium-regular`}>
                  {report.status ? "Resolved" : "Waiting to proceed"}
                </span>
                <p className="report-history-date oxanium-regular">
                  {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

//         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//           <thead>
//             <tr>
//               <th style={{ border: '1px solid #ccc', padding: '8px' }}>Title</th>
//               <th style={{ border: '1px solid #ccc', padding: '8px' }}>Content</th>
//               <th style={{ border: '1px solid #ccc', padding: '8px' }}>Reported User</th>
//               <th style={{ border: '1px solid #ccc', padding: '8px' }}>Reported Product</th>
//               <th style={{ border: '1px solid #ccc', padding: '8px' }}>Status</th>
//               <th style={{ border: '1px solid #ccc', padding: '8px' }}>Created At</th>
//             </tr>
//           </thead>
//           <tbody>
//             {reports.map((report, idx) => (
//               <tr key={report.id || idx}>
//                 <td style={{ border: '1px solid #ccc', padding: '8px' }}>{report.title}</td>
//                 <td style={{ border: '1px solid #ccc', padding: '8px' }}>{report.content}</td>
//                 <td style={{ border: '1px solid #ccc', padding: '8px' }}>{report.sellerName || 'Unknown'}</td>
//                 <td style={{ border: '1px solid #ccc', padding: '8px' }}>{report.productName || 'Unknown'}</td>
//                 <td style={{ border: '1px solid #ccc', padding: '8px' }}>{report.status ? 'Resolved' : 'Pending'}</td>
//                 <td style={{ border: '1px solid #ccc', padding: '8px' }}>{new Date(report.createdAt).toLocaleString()}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

      )}
    </div>
  );
}
