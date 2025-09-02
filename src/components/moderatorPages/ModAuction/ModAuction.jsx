import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getAllAuctionOfMod, updateStatusAuction } from "../../../services/api.auction";
import { getCollectionDetail } from "../../../services/api.product";
import { buildImageUrl } from "../../../services/api.imageproxy";
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
                        </div>
                      ) : (<span>—</span>)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="modauction-mod-message">No auctions found.</td></tr>
              )}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
}