
import React, { useEffect, useState, useMemo } from "react";

import "./AdReportManagement.css";
import { getAllReport } from "../../../services/api.report";
import { getOtherProfile } from "../../../services/api.user";
import { buildImageUrl } from "../../../services/api.imageproxy";
import ProfileIcon from '../../../assets/others/mmbAvatar.png';

// --- Component tái sử dụng: Pagination ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="adproduct-pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        &laquo; Previous
      </button>
      {pages.map((page) => (<button key={page} onClick={() => onPageChange(page)} className={currentPage === page ? "active" : ""}>{page}</button>))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next &raquo;
      </button>
    </div>
  );
};

export default function AdReportManagement() {
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho tìm kiếm và phân trang
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch tất cả reports
        const res = await getAllReport();
        const rawData = res.data || [];

        // 2. Lọc ra các report hợp lệ (phải có sellerId)
        const validIdRegex = /^[0-9a-fA-F]{24}$/;
        const validReports = rawData.filter(report =>
          (report.sellerId && validIdRegex.test(report.sellerId)) &&
          (report.userId && validIdRegex.test(report.userId))
        );

        // 3. Lấy danh sách ID của seller và user duy nhất để fetch profile
        const profileIds = new Set();
        validReports.forEach(report => {
          profileIds.add(report.sellerId);
          profileIds.add(report.userId);
        });

        // 4. Fetch tất cả profile cần thiết một cách song song
        const profilePromises = Array.from(profileIds).map(id => getOtherProfile(id));
        const profileResults = await Promise.all(profilePromises);

        // 5. Tạo một map để tra cứu profile nhanh chóng
        const profileMap = new Map();
        profileResults.forEach(result => {
          if (result && result.data) {
            profileMap.set(result.data.id, result.data);
          }
        });

        // 6. Gộp dữ liệu profile, phân loại và tạo ra danh sách ban đầu
        const enrichedReports = validReports.map(report => ({
          ...report,
          sellerProfile: profileMap.get(report.sellerId),
          reporterProfile: profileMap.get(report.userId),
          reportType: report.productName ? 'Report Product' : 'Report Seller'
        }));

        // SỬA ĐỔI: Thêm bước lọc cuối cùng
        // Chỉ giữ lại report mà cả seller và reporter đều có profile hợp lệ
        const fullyVerifiedReports = enrichedReports.filter(report =>
          report.sellerProfile && report.reporterProfile
        );

        // 7. Sắp xếp danh sách đã được xác thực hoàn toàn
        fullyVerifiedReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setAllReports(fullyVerifiedReports);
      } catch {
        setError("Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcessData();
  }, []);

  // Logic lọc và phân trang
  const filteredReports = useMemo(() => {
    if (!searchTerm) return allReports;
    const lowercasedSearch = searchTerm.toLowerCase();
    return allReports.filter(report => {
      const statusString = report.status ? 'resolved' : 'pending';
      return (
        report.title?.toLowerCase().includes(lowercasedSearch) ||
        report.productName?.toLowerCase().includes(lowercasedSearch) ||
        report.sellerProfile?.username.toLowerCase().includes(lowercasedSearch) ||
        report.reporterProfile?.username.toLowerCase().includes(lowercasedSearch) ||
        report.reportType?.toLowerCase().includes(lowercasedSearch) ||
        statusString.includes(lowercasedSearch)
      );
    });
  }, [searchTerm, allReports]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const currentReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderStatus = (status) => {
    const isOk = status === true || status === "true" || status === 1;
    return (
      <span className={`adproduct-badge ${isOk ? "ok" : "no"}`}>
        {isOk ? "Resolved" : "Pending"}
      </span>
    );
  };

  const renderUserInfo = (profile) => {
    if (!profile) return <span>N/A</span>;

    const FALLBACK_AVATAR = ProfileIcon;
    const initialSrc = profile.profileImage
      ? buildImageUrl(profile.profileImage, profile.profileImage)
      : FALLBACK_AVATAR;

    const handleError = (e) => {
      if (e.target.src !== FALLBACK_AVATAR) {
        e.target.src = FALLBACK_AVATAR;
      }
    };

    return (
      <div className="seller-info">
        <img
          src={initialSrc}
          onError={handleError}
          alt={profile.username}
          className="adproduct-thumb"
        />
        <span title={profile.username}>{profile.username}</span>
      </div>
    );
  };

  return (
    <div className="adproduct-container">
      <h2 className="adproduct-title">Report Management</h2>

      <div className="adproduct-filters">
        <input
          type="text"
          placeholder="Search type, title, product, user, status..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select value={itemsPerPage} onChange={(e) => {
          setItemsPerPage(Number(e.target.value));
          setCurrentPage(1);
        }}>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      {loading ? (
        <div className="adproduct-status">Loading...</div>
      ) : error ? (
        <div className="adproduct-status">{error}</div>
      ) : (
        <>
          <table className="adproduct-table">
            <thead>
              <tr>
                <th>Report Type</th>
                <th>Title</th>
                <th>Product</th>
                <th>Seller</th>
                <th>Reporter</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {currentReports.map((report) => (
                <tr key={report._id}>
                  <td>
                    <span className={`info-tag ${report.reportType === 'Report Product' ? 'tag-payment' : 'tag-auction'}`}>
                      {report.reportType}
                    </span>
                  </td>
                  <td>{report.title}</td>
                  <td>
                    {report.productName ? (
                      report.productName
                    ) : (
                      <span className="product-tag-special">Only Seller</span>
                    )}
                  </td>
                  <td>{renderUserInfo(report.sellerProfile)}</td>
                  <td>{renderUserInfo(report.reporterProfile)}</td>
                  <td>{renderStatus(report.status)}</td>
                  <td>{new Date(report.createdAt).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}