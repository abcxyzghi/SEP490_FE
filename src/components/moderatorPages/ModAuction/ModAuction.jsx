import React, { useEffect, useState } from "react";
import { getAllAuctionOfMod, updateStatusAuction } from "../../../services/api.auction";
import "./ModAuction.css";
import { toast } from "react-toastify";
import moment from "moment";

export default function ModAuction() {
  const [auctions, setAuctions] = useState([]);
  const [activeTab, setActiveTab] = useState("pending"); // pending | others

  const fetchAuctions = async () => {
    const res = await getAllAuctionOfMod();
    if (res?.success) {
      const filtered = res.data.filter(a => a.product_id !== null && a.product_id !== undefined && a.product_id !== ""); 
      setAuctions(res.data);
    } else {
      toast.error("Error loading auctions");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    console.log("Updating auction status:", id, status);
    const res = await updateStatusAuction(id, status);
    if (res?.success) {
      toast.success(status === 1 ? "Accepted" : "Rejected");
      fetchAuctions();
    } else {
      toast.error("Update status failed, please try again later");
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const pendingAuctions = auctions.filter(a => a.status === 0);
  const otherAuctions = auctions.filter(a => a.status !== 0);

  const renderAuctionCard = (auction) => (
    <div key={auction.auction_id} className="auction-card fade-in">
      <p><strong>Seller:</strong> {auction.host_username}</p>
      <p><strong>Start time:</strong> {moment(auction.start_time).format("DD/MM/YYYY HH:mm")}</p>
      <p><strong>End time:</strong> {moment(auction.end_time).format("DD/MM/YYYY HH:mm")}</p>
      <p>
        <strong>Status:</strong>{" "}
        {auction.status === 1 ? (
          <span className="status-approved">Accepted</span>
        ) : auction.status === -1 ? (
          <span className="status-rejected">Rejected</span>
        ) : (
          <span className="status-pending">Pending</span>
        )}
      </p>
      {auction.status === 0 && (
        <div className="auction-actions">
          <button
            className="btn-approve"
            onClick={() => handleUpdateStatus(auction.auction_id, 1)}
          >
            ✅ Approve
          </button>
          <button
            className="btn-reject"
            onClick={() => handleUpdateStatus(auction.auction_id, -1)}
          >
            ❌ Reject
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="mod-auction-container">
      <h2>🏷 List Auction</h2>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "pending" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("pending")}
        >
          ⏳ Pending
        </button>
        <button
          className={activeTab === "others" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("others")}
        >
          📦 Others
        </button>
      </div>

      {/* Content */}
      <div className="auction-card-list">
        {activeTab === "pending"
          ? pendingAuctions.length > 0
            ? pendingAuctions.map(renderAuctionCard)
            : <p>Không có dữ liệu pending.</p>
          : otherAuctions.length > 0
            ? otherAuctions.map(renderAuctionCard)
            : <p>Không có dữ liệu khác.</p>
        }
      </div>
    </div>
  );
}
