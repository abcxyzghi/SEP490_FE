import React, { useEffect, useState, useMemo } from 'react';

import './AdAuctionManagement.css'; // Giả sử file này đã tồn tại
import { getAllAuctions } from '../../../services/api.auction';
import { getOtherProfile } from '../../../services/api.user'; // Bạn cần import hàm này
import { buildImageUrl } from '../../../services/api.imageproxy'; // Import hàm build image
import ProfileIcon from '../../../assets/others/mmbAvatar.png';
import moment from 'moment';
// --- Component tái sử dụng: ExpandableDescription ---
const ExpandableDescription = ({ text, maxLength = 100 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sửa lỗi: API trả về 'descripition' thay vì 'description'
  const safeText = text || '';

  if (safeText.length <= maxLength) {
    return <span>{safeText}</span>;
  }

  const toggleExpansion = () => setIsExpanded(!isExpanded);

  return (
    <span>
      {isExpanded ? safeText : `${safeText.substring(0, maxLength)}...`}
      <button onClick={toggleExpansion} className="description-toggle-btn">
        {isExpanded ? "Read Less" : "Read More"}
      </button>
    </span>
  );
};

// --- Component tái sử dụng: Pagination ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="adproduct-pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        &laquo; Previous
      </button>
      {pages.map((page) => (
        <button key={page} onClick={() => onPageChange(page)} className={currentPage === page ? "active" : ""}>
          {page}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next &raquo;
      </button>
    </div>
  );
};


export default function AdAuctionManagement() {
  const [auctionsWithSellers, setAuctionsWithSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho tìm kiếm và phân trang
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Giá trị mặc định có thể điều chỉnh

  // Fetch và xử lý dữ liệu
  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        setLoading(true);
        // 1. Fetch tất cả auctions
        const auctionRes = await getAllAuctions();
        let auctionsData = auctionRes.data || [];

        // 2. Lấy danh sách ID người bán duy nhất để tránh gọi API trùng lặp
        const sellerIds = [...new Set(auctionsData.map(a => a.seller_id))];

        // 3. Fetch thông tin của tất cả người bán song song
        const profilePromises = sellerIds.map(id => getOtherProfile(id));
        const profileResults = await Promise.all(profilePromises);

        // 4. Tạo một map để tra cứu thông tin người bán dễ dàng (id -> profile)
        const sellerProfileMap = new Map();
        profileResults.forEach(res => {
          if (res && res.data) {
            sellerProfileMap.set(res.data.id, res.data);
          }
        });

        // 5. Gộp thông tin người bán vào từng auction
        const enrichedAuctions = auctionsData.map(auction => ({
          ...auction,
          seller: sellerProfileMap.get(auction.seller_id) || null,
        }));

        // 6. Sắp xếp auctions theo thời gian bắt đầu gần nhất
        // enrichedAuctions.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
        enrichedAuctions.reverse();
        setAuctionsWithSellers(enrichedAuctions);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Unable to load auction list');
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcessData();
  }, []);

  // Logic lọc và phân trang
  const filteredAuctions = useMemo(() => {
    if (!searchTerm) return auctionsWithSellers;

    const lowercasedSearch = searchTerm.toLowerCase();
    return auctionsWithSellers.filter(auction =>
      auction.title?.toLowerCase().includes(lowercasedSearch) ||
      auction.descripition?.toLowerCase().includes(lowercasedSearch) || // Chú ý: API có thể trả về 'descripition'
      auction.seller?.username?.toLowerCase().includes(lowercasedSearch)
    );
  }, [searchTerm, auctionsWithSellers]);

  const totalPages = Math.ceil(filteredAuctions.length / itemsPerPage);
  const currentAuctions = filteredAuctions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Render phase của auction
  const renderPhase = (auction) => {
    const now = new Date();
    const start = new Date(auction.start_time);
    const end = new Date(auction.end_time);

    if (auction.status === 0) {
      return <span className="adproduct-badge no">Rejected</span>;
    }
    if (auction.status === 1) { // Approved
      if (now < start) return <span className="adproduct-badge rarity-uncommon">Waiting</span>;
      if (now >= start && now <= end) return <span className="adproduct-badge rarity-common">On Going</span>;
      if (now > end) return <span className="adproduct-badge rarity-rare">Finished</span>;
    }
    return <span className="adproduct-badge">Unknown</span>;
  }

  return (
    <div className="adproduct-container">
      <h2 className="adproduct-title">Auction Management</h2>

      {/* Thanh tìm kiếm và điều chỉnh phân trang */}
      <div className="adproduct-filters">
        <input
          type="text"
          placeholder="Search by title, description, seller..."
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
          <option value={2}>2 per page</option>
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
        </select>
      </div>

      {loading ? <p className="adproduct-status">Loading ...</p> :
        error ? <p className="adproduct-status">{error}</p> : (
          <>
            <table className="adproduct-table">
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Approval</th>
                  <th>Phase</th>
                </tr>
              </thead>
              <tbody>
                {currentAuctions.map((auction) => (
                  <tr key={auction._id}>
                    <td>
                      {auction.seller ? (
                        <div className="seller-info-management-only">
                          <img
                            src={
                              auction.seller?.profileImage
                                ? buildImageUrl(auction.seller.profileImage, auction.seller.profileImage)
                                : ProfileIcon
                            }
                            alt={auction.seller?.username || 'N/A'}
                            className="adproduct-thumb"
                          />
                          <span>{auction.seller?.username || 'Unknown Seller'}</span>
                        </div>
                      ) : 'Loading...'}
                    </td>
                    <td className="adproduct-description">
                      <ExpandableDescription text={auction.title} maxLength={50} />
                    </td>
                    <td className="adproduct-description">
                      <ExpandableDescription text={auction.descripition} maxLength={100} />
                    </td>
                    {/* <td>{new Date(auction.start_time).toLocaleString('vi-VN')}</td>
                    <td>{new Date(auction.end_time).toLocaleString('vi-VN')}</td> */}
                    <td>{moment.utc(auction.start_time).local().format('DD/MM/YYYY HH:mm')}</td>
                    <td>{moment.utc(auction.end_time).local().format('DD/MM/YYYY HH:mm')}</td>
                    <td>
                      <span className={`adproduct-badge ${auction.status === 1 ? 'ok' : 'no'}`}>
                        {auction.status === 1 ? 'Approved' : 'Not Approved'}
                      </span>
                    </td>
                    <td>{renderPhase(auction)}</td>
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