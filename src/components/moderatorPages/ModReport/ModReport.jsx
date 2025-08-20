import React, { useEffect, useState } from "react";
import { getAllReport, updateStatusReport } from "../../../services/api.report";
import "./ModReport.css";
import { toast } from "react-toastify";
import moment from "moment";

export default function ModReport() {
   const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 8;

  const fetchReports = async () => {
    const response = await getAllReport();
    if (response?.status) {
      setReports(response.data);
    } else {
      toast.error("Error loading report");
    }
  };

  const handleUpdateStatus = async (id) => {
    const success = await updateStatusReport(id);
    if (success?.status) {
      toast.success("Update successful");
      fetchReports();
    } else {
      toast.error("Update failed");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Phân trang
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  const Pagination = () => (
    <div style={{ marginTop: "20px", textAlign: "center" }}>
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        ◀ Before
      </button>
      <span style={{ margin: "0 12px" }}>
        Page {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        After ▶
      </button>
    </div>
  );

  return (
    <div className="mod-report-container">
      <h2>List Report</h2>
      <table className="report-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Accuser</th>
            <th>The accused</th>
            <th>Product</th>
            <th>Title</th>
            <th>Description</th>
            <th>Create at</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) .map((report) => (
            <tr key={report.id}>
              <td>{report.id.slice(0, 6)}...</td>
              <td>{report.userId || "Unknow"}</td>
              <td>{report.sellerId || "Unknow"}</td>
              <td>{report.sellProductId || "Unknow"}</td>
              <td>{report.title}</td>
              <td>{report.content}</td>
              <td>{moment(report.createdAtmoment).format("DD/MM/YYYY HH:mm")}</td>
              <td>
                <span
                  className={`report-status ${
                    report.status ? "status-processed" : "status-pending"
                  }`}
                >
                  {report.status ? "Processed" : "Pending"}
                </span>
              </td>
              <td>
                {!report.status && (
                  <button
                    className="update-btn"
                    onClick={() => handleUpdateStatus(report.id)}
                  >
                    ✅ Mark as processed
                  </button>
                )}
              </td>
            </tr>
          ))}
          {reports.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No reports yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {reports.length > reportsPerPage && <Pagination />}
    </div>
  );
}
