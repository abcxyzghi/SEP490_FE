import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getAllAuctionOfMod, updateStatusAuction, AuctionProductDetail, Top5bidAuction, getAllAuctions } from "../../../services/api.auction";
import { getCollectionDetail } from "../../../services/api.product";
import { getOtherProfile } from '../../../services/api.user';
import { buildImageUrl } from "../../../services/api.imageproxy";
import ProfileHolder from "../../../assets/others/mmbAvatar.png";
import ProfileIcon from '../../../assets/others/mmbAvatar.png';
import { Button, Modal, Spin } from 'antd';
import "./ModAuction.css";
import { toast } from "react-toastify";
import moment from "moment";

// --- Component tái sử dụng: Pagination ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="modauction-mod-pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>&laquo; Previous</button>
      {pages.map((page) => (<button key={page} onClick={() => onPageChange(page)} className={currentPage === page ? "active" : ""}>{page}</button>))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={totalPages === currentPage}>Next &raquo;</button>
    </div>
  );
};

// --- Component tái sử dụng: ExpandableDescription ---
const ExpandableDescription = ({ text, maxLength = 80 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text || text.length <= maxLength) return <span>{text}</span>;
  return (
    <span className="expandable-text">
      {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      <button onClick={() => setIsExpanded(!isExpanded)} className="expandable-toggle-btn">
        {isExpanded ? "Show Less" : "Show More"}
      </button>
    </span>
  );
};

export default function ModAuction() {
  const [allAuctions, setAllAuctions] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bidsDetail, setBidsDetail] = useState([]);
  const [auctionDetail, setAuctionDetail] = useState(null);
  const [useBackupImg, setUseBackupImg] = useState(false);

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllAuctionOfMod();
      // if (!res?.status) throw new Error("Error loading auctions");
      if (!res?.success) throw new Error("Error loading auctions");

      const validAuctions = (res.data || [])
        .filter(a => a.product_id)
        // .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
        .reverse()

      const productIds = [...new Set(validAuctions.map(a => a.product_id))];
      const BATCH_SIZE = 5, DELAY_BETWEEN_BATCHES = 200;
      const productDetailsMap = new Map();

      for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
        const batch = productIds.slice(i, i + BATCH_SIZE);
        const productPromises = batch.map(id => getCollectionDetail(id));
        const productResults = await Promise.all(productPromises);

        productResults.forEach((productRes, index) => {
          if (productRes && productRes.data) {
            productDetailsMap.set(batch[index], productRes.data);
          }
        });
        if (i + BATCH_SIZE < productIds.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }
      }

      const enrichedAuctions = validAuctions.map(auction => ({
        ...auction,
        productDetails: productDetailsMap.get(auction.product_id)
      })).filter(a => a.productDetails);

      setAllAuctions(enrichedAuctions);
    } catch (error) {
      toast.error(error.message || "Failed to fetch auctions");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const res = await updateStatusAuction(id, status);
    if (res?.status) {
      toast.success(status === 1 ? "Auction Approved" : "Auction Rejected");
      fetchAuctions();
    } else {
      toast.error("Update status failed, please try again later");
    }
  };
  const handleViewDetail = async (auctionId, productId, startTime, endTime) => {
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
      // Gộp các trường từ collection và auction detail, ưu tiên auctionDetailRes.data[0]
      if (collectionRes?.status && auctionDetailRes?.data?.[0]) {
        const auctionData = auctionDetailRes.data[0];
        setAuctionDetail({
          ...collectionRes.data,
          ...auctionData,
          host_username: auctionFromList?.host_username,
          title: auctionFromList?.title,
          description: auctionFromList?.description,
          starting_price: auctionData.starting_price ?? null,
          auction_current_amount: auctionFromList?.auction_current_amount,
          transaction_fee_percent: auctionFromList?.transaction_fee_percent,
          host_obtain_amount: auctionFromList?.host_obtain_amount,
          start_time: startTime,
          end_time: endTime
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
  useEffect(() => { fetchAuctions(); }, [fetchAuctions]);

  const filteredAuctions = useMemo(() => {
    let data = activeTab === 'pending'
      ? allAuctions.filter(a => a.status === 0 && new Date(a.end_time) > new Date())
      : allAuctions.filter(a => a.status !== 0 || new Date(a.end_time) <= new Date());

    if (rarityFilter !== 'all') {
      data = data.filter(a => a.productDetails?.rarityName.toLowerCase() === rarityFilter.toLowerCase());
    }

    if (!searchTerm) return data;
    const lowercasedSearch = searchTerm.toLowerCase();
    return data.filter(a =>
      a.host_username?.toLowerCase().includes(lowercasedSearch) ||
      a.productDetails?.name.toLowerCase().includes(lowercasedSearch) ||
      a.productDetails?.description.toLowerCase().includes(lowercasedSearch)
    );
  }, [allAuctions, activeTab, searchTerm, rarityFilter]);

  const totalPages = Math.ceil(filteredAuctions.length / itemsPerPage);
  const currentAuctions = filteredAuctions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const pendingCount = useMemo(() => allAuctions.filter(a => a.status === 0 && new Date(a.end_time) > new Date()).length, [allAuctions]);

  const renderStatusBadge = (auction) => {
    const now = new Date();
    const end = new Date(auction.end_time);
    if (now > end && auction.status !== -1) {
      return <span className="auction-mod-modauction-mod-badge auction-status-finished">Finished</span>;
    }
    switch (auction.status) {
      case 1: return <span className="auction-mod-modauction-mod-badge auction-status-approved">Approved</span>;
      case -1: return <span className="auction-mod-modauction-mod-badge auction-status-rejected">Rejected</span>;
      default: return <span className="auction-mod-modauction-mod-badge auction-status-pending">Pending</span>;
    }
  };
  const fmtVND = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(Number(v || 0)) + " VND";

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="modauction-mod-container">
      <div className="modauction-mod-header">
        <h2 className="modauction-mod-title">Auction Approval</h2>
        <p className="modauction-mod-subtitle">You have <strong>{pendingCount}</strong> auctions waiting for approval.</p>
      </div>

      <div className="modauction-mod-controls">
        <div className="modauction-mod-tabs">
          <button className={activeTab === "pending" ? "active" : ""} onClick={() => handleTabChange("pending")}>Pending ({pendingCount})</button>
          <button className={activeTab === "others" ? "active" : ""} onClick={() => handleTabChange("others")}>Processed</button>
        </div>
        <input type="text" className="modauction-mod-search" placeholder="Search seller, product name, rarity, description..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
        <div className="modauction-mod-filters">
          <select className="modauction-mod-select" value={rarityFilter} onChange={(e) => { setRarityFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">All Rarities</option><option value="common">Common</option><option value="uncommon">Uncommon</option><option value="rare">Rare</option><option value="epic">Epic</option><option value="legendary">Legendary</option>
          </select>
          <select className="modauction-mod-select" value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
            <option value={5}>5 / page</option><option value={10}>10 / page</option><option value={20}>20 / page</option><option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {loading ? <p className="modauction-mod-message">Loading auctions...</p> : (
        <>
          <table className="modauction-mod-table">
            <thead><tr><th>Seller</th><th>Product Details</th><th>Time Frame</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {currentAuctions.length > 0 ? (
                currentAuctions.map((auction) => (
                  <tr key={auction.auction_id} className="fade-in">
                    <td>{auction.host_username}</td>
                    <td>
                      <div className="modauction-mod-product-cell">
                        <img src={buildImageUrl(auction.productDetails.urlImage, auction.productDetails.urlImage)} alt={auction.productDetails.name} className="modauction-mod-product-cell__image" />
                        <div className="modauction-mod-product-cell__info">
                          <div className={`modauction-mod-product-cell__rarity rarity-${auction.productDetails.rarityName?.toLowerCase()}`}>{auction.productDetails.rarityName}</div>
                          <div className="modauction-mod-product-cell__name"><ExpandableDescription text={auction.productDetails.name} maxLength={50} /></div>
                          <div className="modauction-mod-product-cell__desc"><ExpandableDescription text={auction.productDetails.description} maxLength={100} /></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="modauction-mod-time-frame">
                        <span><strong>Start:</strong> {moment(auction.start_time).format("DD/MM/YYYY HH:mm")}</span>
                        <span><strong>End:</strong> {moment(auction.end_time).format("DD/MM/YYYY HH:mm")}</span>
                      </div>
                    </td>
                    <td>{renderStatusBadge(auction)}</td>
                    <td>
                      {auction.status === 0 && new Date(auction.end_time) > new Date() ? (
                        <div className="modauction-mod-actions">
                          <button className="modauction-mod-btn-approve" onClick={() => handleUpdateStatus(auction.auction_id, 1)}>Approve</button>
                          <button className="modauction-mod-btn-reject" onClick={() => handleUpdateStatus(auction.auction_id, -1)}>Reject</button>
                          <button className="modauction-mod-btn-view-detail" onClick={() => handleViewDetail(auction.auction_id, auction.product_id, auction.start_time, auction.end_time)}>View Detail</button>
                        </div>
                      ) : (<div className="modauction-mod-actions">
                        <button className="modauction-mod-btn-view-detail" onClick={() => handleViewDetail(auction.auction_id, auction.product_id, auction.start_time, auction.end_time)}>View Detail</button>
                      </div>)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="modauction-mod-message">No auctions found.</td></tr>
              )}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          <Modal
            title={auctionDetail ? auctionDetail.title : "Auction Detail"}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            width={700}
            className="custom-auction-modal"
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
                    <div className="auction-detail-header">
                      <div className="auction-detail-img-wrap">
                        <img
                          src={auctionDetail.urlImage ? buildImageUrl(auctionDetail.urlImage, useBackupImg) : ProfileHolder}
                          onError={() => setUseBackupImg(true)}
                          alt={auctionDetail.title}
                          className="auction-detail-img"
                        />
                      </div>
                      <div className="auction-detail-info">
                        <h2 className="auction-title">Title: {auctionDetail.title}</h2>
                        {auctionDetail.name && (
                          <p className="auction-name">
                            Product Name: <span>{auctionDetail.name}</span>
                          </p>
                        )}
                        <p className="auction-host">
                          Hosted by <span>{auctionDetail.host_username}</span>
                        </p>
                        <p className="auction-desc">Description : {auctionDetail.description}</p>
                        <span className="auction-rarity">Rarity: {auctionDetail.rarityName}</span>

                        <div className="auction-time-card">
                          <p>Start: {moment(auctionDetail.start_time).format("DD/MM/YYYY HH:mm")}</p>
                          <p>End: {moment(auctionDetail.end_time).format("DD/MM/YYYY HH:mm")}</p>
                        </div>

                        <div className="auction-price-cards">
                          <div className="price-item">
                            <span>Starting Price</span>
                            <strong>{fmtVND(auctionDetail.starting_price)}</strong>
                          </div>
                          <div className="price-item highlight">
                            <span>Current Amount</span>
                            <strong>{fmtVND(auctionDetail.auction_current_amount)}</strong>
                          </div>
                          <div className="price-item">
                            <span>Transaction Fee</span>
                            <strong>{auctionDetail.transaction_fee_percent}%</strong>
                          </div>
                          <div className="price-item">
                            <span>Host Obtain</span>
                            <strong>{fmtVND(auctionDetail.host_obtain_amount)}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                  </>
                )}


                <h4 style={{ marginBottom: 10 }}>Participant</h4>
                {bidsDetail.length > 0 ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {[...bidsDetail]
                      .sort((a, b) => new Date(b.bid_time) - new Date(a.bid_time))
                      .map((bid, idx) => (
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
                            src={
                              bid.profile?.profileImage
                                ? buildImageUrl(bid.profile.profileImage, useBackupImg)
                                : ProfileHolder
                            }
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
                            {moment(bid.bid_time).format("DD/MM/YYYY HH:mm")}
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