import React, { useEffect, useState, useMemo } from 'react';
import './AdAuctionManagement.css'; // Giả sử file này đã tồn tại
import { AuctionProductDetail, getAllAuctions, Top5bidAuction } from '../../../services/api.auction';
import { getOtherProfile } from '../../../services/api.user'; // Bạn cần import hàm này
import { buildImageUrl } from '../../../services/api.imageproxy'; // Import hàm build image
import ProfileIcon from '../../../assets/others/mmbAvatar.png';
import ProfileHolder from "../../../assets/others/mmbAvatar.png";
import moment from 'moment';
import { Button, Modal, Spin } from 'antd';
import { getCollectionDetail } from '../../../services/api.product';
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
  const [useBackupImg, setUseBackupImg] = useState(false);
  // State cho tìm kiếm và phân trang
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Giá trị mặc định có thể điều chỉnh

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loadingDetail, setLoadingDetail] = useState(false);
  const [bidsDetail, setBidsDetail] = useState([]);
  const [auctionDetail, setAuctionDetail] = useState(null);

  const handleViewDetail = async (auctionId, productId) => {
    console.log("Auction ID:", auctionId, "Product ID:", productId);
    try {
      setLoadingDetail(true);
      setIsModalOpen(true);

      // Gọi song song 3 API: top 5 bids, collection detail, auction detail
      const [bidsRes, collectionRes, auctionDetailRes] = await Promise.all([
        Top5bidAuction(auctionId),
        getCollectionDetail(productId),
        AuctionProductDetail(auctionId), // thêm API này
      ]);

      // Xử lý bids
      if (bidsRes?.success && Array.isArray(bidsRes.data)) {
        const bidderIds = [...new Set(bidsRes.data.map((b) => b.bidder_id))];
        const bidderProfiles = await Promise.all(
          bidderIds.map((id) => getOtherProfile(id))
        );

        const bidderProfileMap = {};
        bidderProfiles.forEach((res, idx) => {
          if (res?.status && res.data) {
            bidderProfileMap[bidderIds[idx]] = res.data;
          }
        });

        const bids = bidsRes.data.map((bid) => ({
          ...bid,
          profile: bidderProfileMap[bid.bidder_id] || {},
        }));
        setBidsDetail(bids);
      } else {
        setBidsDetail([]);
      }

      const auctionFromList = currentAuctions.find(a => a.auction_id === auctionId);
      console.log("Check price", auctionDetailRes.data)
      // Xử lý collection detail + auction detail (gộp dữ liệu)
      if (collectionRes?.status) {
        setAuctionDetail({
          ...collectionRes.data,
          starting_price: auctionDetailRes?.data?.[0]?.starting_price ?? null, // thêm starting price
          auction_current_amount: auctionFromList?.auction_current_amount,
          transaction_fee_percent: auctionFromList?.transaction_fee_percent,
          host_obtain_amount: auctionFromList?.host_obtain_amount,
        });
      } else {
        setAuctionDetail(null);
      }
    } catch (err) {
      console.error("Failed to load detail", err);
      setBidsDetail([]);
      setAuctionDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };


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
  const fmtVND = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(Number(v || 0)) + " VND";
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
      {loading ? (
        <p className="adproduct-status">Loading ...</p>
      ) : error ? (
        <p className="adproduct-status">{error}</p>
      ) : (
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
                <th>Action</th> {/* Thêm cột mới */}
              </tr>
            </thead>
            <tbody>
              {currentAuctions.map((auction) => {
                console.log("Auction:", auction);

                return (
                  <tr key={auction._id}>
                    <td>
                      {auction.seller ? (
                        <div className="seller-info-management-only">
                          <img
                            src={
                              auction.seller?.profileImage
                                ? buildImageUrl(
                                  auction.seller.profileImage,
                                  auction.seller.profileImage
                                )
                                : ProfileIcon
                            }
                            alt={auction.seller?.username || "N/A"}
                            className="adproduct-thumb"
                          />
                          <span>{auction.seller?.username || "Unknown Seller"}</span>
                        </div>
                      ) : (
                        "Loading..."
                      )}
                    </td>
                    <td className="adproduct-description">
                      <ExpandableDescription text={auction.title} maxLength={50} />
                    </td>
                    <td className="adproduct-description">
                      <ExpandableDescription text={auction.description} maxLength={100} />
                    </td>
                    <td>
                      {moment.utc(auction.start_time).local().format("DD/MM/YYYY HH:mm")}
                    </td>
                    <td>
                      {moment.utc(auction.end_time).local().format("DD/MM/YYYY HH:mm")}
                    </td>
                    <td>
                      <span
                        className={`adproduct-badge ${auction.status === 1 ? "ok" : "no"
                          }`}
                      >
                        {auction.status === 1 ? "Approved" : "Not Approved"}
                      </span>
                    </td>
                    <td>{renderPhase(auction)}</td>
                    <td>
                      <button
                        className="adproduct-action-btn"
                        onClick={() => handleViewDetail(auction.auction_id, auction.product_id)}
                      >
                        View Detail
                      </button>
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <Modal
            title={auctionDetail ? auctionDetail.title : "Auction Detail"}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            width={700}
            footer={[
              <Button
                key="close"
                className="adproduct-action-btn"
                style={{
                  background: "linear-gradient(135deg, #ff416c, #ff4b2b)",
                  border: "none",
                }}
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>,
            ]}
          >
            {loadingDetail ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Spin />
              </div>
            ) : (
              <>
                {auctionDetail && (
                  <>
                    {console.log("Auction detail:", auctionDetail)}
                    <div
                      style={{
                        display: "flex",
                        gap: 16,
                        marginBottom: 20,
                        alignItems: "flex-start",
                      }}
                    >
                      <img
                        src={auctionDetail.urlImage ? buildImageUrl(auctionDetail.urlImage, useBackupImg) : ProfileHolder}
                        onError={() => setUseBackupImg(true)}
                        alt={auctionDetail.title}
                        style={{
                          width: 120,
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 8,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      />
                      <div>
                        <h3 style={{ margin: 0 }}>{auctionDetail.title}</h3>
                        <p style={{ margin: "6px 0", color: "#666" }}>
                          {auctionDetail.description}
                        </p>
                        <p style={{ margin: "6px 0", color: "#666" }}>
                          Rarity: {auctionDetail.rarityName}
                        </p>

                        <p style={{ margin: "6px 0", color: "#999" }}>
                          Start:{" "}
                          {moment(auctionDetail.start_time)
                            .local()
                            .format("DD/MM/YYYY HH:mm")}
                          <br />
                          End:{" "}
                          {moment(auctionDetail.end_time)
                            .local()
                            .format("DD/MM/YYYY HH:mm")}
                        </p>
                        <p style={{ margin: "6px 0", fontWeight: 500 }}>
                          Starting Price: {fmtVND(auctionDetail.starting_price)}
                        </p>
                        <p><strong>Current Amount:</strong> {fmtVND(auctionDetail.auction_current_amount)}</p>
                        <p><strong>Transaction Fee (%):</strong> {auctionDetail.transaction_fee_percent}%</p>
                        <p><strong>Host Obtain Amount:</strong> {fmtVND(auctionDetail.host_obtain_amount)}</p>
                      </div>
                    </div>
                  </>
                )}


                <h4 style={{ marginBottom: 10 }}>Participant</h4>
                {bidsDetail.length > 0 ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {bidsDetail.map((bid, idx) => (
                      <li
                        key={bid._id || idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "10px 0",
                          borderBottom: "1px solid #eee",
                          fontSize: 14,
                          gap: 12,
                        }}
                      >
                        <img
                            src={bid.profile?.profileImage ? buildImageUrl(bid.profile.profileImage, useBackupImg) : ProfileHolder}
                            onError={() => setUseBackupImg(true)}
                            alt={bid.profile?.username || "bidder"}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        <span style={{ flex: 1, fontWeight: 500 }}>
                          {bid.profile?.username || "Unknown"}
                        </span>
                        <span style={{ minWidth: 110, textAlign: "right", fontWeight: 600 }}>
                          {fmtVND(bid.bid_amount)}
                        </span>
                        <span style={{ minWidth: 150, textAlign: "right", color: "#888" }}>
                          {moment(bid.bid_time).local().format("DD/MM/YYYY HH:mm")}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No bids found.</p>
                )}
              </>
            )}
          </Modal>

        </>
      )}

    </div>
  );
}