import React, { useEffect, useState } from "react";

import "./AdReportManagement.css";
import { getAllReport } from "../../../services/api.report";

export default function AdReportManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllReport();
      console.log(res.data);
      setData(res.data || []);
    } catch {
      setError("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderStatus = (status) => {
    const isOk = status === true || status === "true" || status === 1;
    return (
      <span className={`adreport-badge ${isOk ? "ok" : "no"}`}>
        {isOk ? "Resolved" : "Pending"}
      </span>
    );
  };

  return (
    <div className="adreport-container">
      <h2 className="adreport-title">Report Management</h2>

      {loading ? (
        <div className="adreport-status">Loading...</div>
      ) : error ? (
        <div className="adreport-status">{error}</div>
      ) : (
        <table className="adreport-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Product</th>
              <th>Seller</th>
              <th>Reporter</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {data.map((report) => (
              <tr key={report._id}>
                <td>{report.title}</td>
                <td>{report.productName}</td>
                <td>
                  {report.sellerName ? report.sellerName : report.sellerId}
                </td>
                <td>{report.userName}</td>
                <td>{renderStatus(report.status)}</td>
                <td>
                  {report.createdAt
                    ? new Date(report.createdAt).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
