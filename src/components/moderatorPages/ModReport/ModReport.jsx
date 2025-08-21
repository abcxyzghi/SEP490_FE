import React, { useEffect, useState } from "react";
import { getAllReport, updateStatusReport } from "../../../services/api.report";
import "./ModReport.css";
import { toast } from "react-toastify";
import moment from "moment";

export default function ModReport() {
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedReports, setExpandedReports] = useState({});


  const reportsPerPage = 3;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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

  const toggleExpand = (id) => {
    setExpandedReports((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Lọc + tìm kiếm
  const filteredReports = reports.filter((r) => {
    const validIds = r.sellerId && r.userId;

    const searchMatch =
      r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.sellerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.content?.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch =
      statusFilter === "All"
        ? true
        : statusFilter === "Processed"
          ? r.status
          : !r.status;

    return searchMatch && statusMatch && validIds;
  });

  const sortedReports = filteredReports.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = sortedReports.slice(
    indexOfFirstReport,
    indexOfLastReport
  );
  const totalPages = Math.ceil(sortedReports.length / reportsPerPage);

  const Pagination = () => (
    <div className="pagination">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        ◀ Before
      </button>
      <span>
        Page {currentPage} / {totalPages || 1}
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
    <div className="mod-report-container oxanium-regular">
      <h2 className="oxanium-bold">List Report</h2>
      {/* Thanh search + filter */}
      <div className="mod-filter-bar">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Processed">Processed</option>
        </select>
      </div>

      {/* Card grid */}
      <div className="card-grid">
        {currentReports.map((report) => (
          <div className="report-card" key={report.id}>
            <div className="report-header">
              <span className="report-id">ID: {report.id.slice(0, 6)}...</span>
              <span
                className={`report-status ${report.status ? "status-processed" : "status-pending"
                  }`}
              >
                {report.status ? "Processed" : "Pending"}
              </span>
            </div>

            <div className="report-body">
              {/* Sửa phần code ở đây: sử dụng sellProductId */}
              {report.sellProductId ? (
                <>
                  <p className="report-type-tag product">
                    <strong lassName="oxanium-bold">Reported Item:</strong> Product on sale
                  </p>
                  <p>
                    <strong lassName="oxanium-bold">Accuser:</strong> {report.userName || "Unknown"}
                  </p>
                  <p>
                    <strong lassName="oxanium-bold">Product Name:</strong> {report.productName || "Unknown"}
                  </p>
                  <p>
                    <strong lassName="oxanium-bold">Seller:</strong> {report.sellerName || "Unknown"}
                  </p>
                  <p>
                    <strong lassName="oxanium-bold">Title:</strong> {report.title}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {expandedReports[report.id] || report.content.length <= 60
                      ? report.content
                      : `${report.content.substring(0, 60)}... `}
                    {report.content.length > 60 && (
                      <span className="read-more" onClick={() => toggleExpand(report.id)}>
                        {expandedReports[report.id] ? "Show less" : "Read more"}
                      </span>
                    )}
                  </p>
                  <p>
                    <strong>Create at:</strong>{" "}
                    {moment(report.createdAt).format("DD/MM/YYYY HH:mm")}
                  </p>
                </>
              ) : (
                <>
                  <p className="report-type-tag seller">
                    <strong>Reported Item:</strong> Seller
                  </p>
                  <p>
                    <strong>Accuser:</strong> {report.userName || "Unknown"}
                  </p>
                  <p>
                    <strong>Seller Name:</strong> {report.sellerName || "Unknown"}
                  </p>
                  <p>
                    <strong>Title:</strong> {report.title}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {expandedReports[report.id] || report.content.length <= 60
                      ? report.content
                      : `${report.content.substring(0, 60)}... `}
                    {report.content.length > 60 && (
                      <span className="read-more" onClick={() => toggleExpand(report.id)}>
                        {expandedReports[report.id] ? "Show less" : "Read more"}
                      </span>
                    )}
                  </p>
                  <p>
                    <strong>Create at:</strong>{" "}
                    {moment(report.createdAt).format("DD/MM/YYYY HH:mm")}
                  </p>
                  <p>
                    <strong></strong>
                    <br></br>
                  </p>
                </>
              )}
            </div>

            <div className="report-footer">
              {!report.status && (
                <button
                  className="update-btn"
                  onClick={() => handleUpdateStatus(report.id)}
                >
                  ✅ Mark as processed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <p style={{ textAlign: "center" }}>No reports found.</p>
      )}

      {sortedReports.length > reportsPerPage && <Pagination />}

    </div>
  );
}
