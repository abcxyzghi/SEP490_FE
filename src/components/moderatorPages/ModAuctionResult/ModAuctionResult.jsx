import React, { useEffect, useState } from "react";
import { getAllAuctionResultForMod, updateAuctionSettlement } from "../../../services/api.auction";
import { getOtherProfile } from "../../../services/api.user";
import { buildImageUrl } from '../../../services/api.imageproxy';
import "./ModAuctionResult.css";
import { toast } from "react-toastify";

export default function ModAuctionResult() {
  const [auctionResults, setAuctionResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useBackupImg, setUseBackupImg] = useState(false);

  // fetch auctions và enrich thêm user info
  const fetchAuctionResults = async () => {
    setLoading(true);
    const res = await getAllAuctionResultForMod();

    if (res?.success) {
      const auctions = res.data || [];

      const enrichedAuctions = await Promise.all(
        auctions.map(async (auction) => {
          try {
            const bidderRes = await getOtherProfile(auction.bidder_id);
            const hosterRes = await getOtherProfile(auction.hoster_id);

            return {
              ...auction,
              bidder: bidderRes?.data
                ? {
                  username: bidderRes.data.username,
                  profileImage: bidderRes.data.profileImage,
                }
                : null,
              hoster: hosterRes?.data
                ? {
                  username: hosterRes.data.username,
                  profileImage: hosterRes.data.profileImage,
                }
                : null,
            };
          } catch (err) {
            console.error("Error fetching user profile:", err);
            return auction;
          }
        })
      );
      enrichedAuctions.reverse();
      setAuctionResults(enrichedAuctions);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAuctionResults();
  }, []);

  const handleUpdateSettlement = async (auctionId) => {
    const res = await updateAuctionSettlement(auctionId);
    if (res?.success) {
      toast.success("Auction settlement updated successfully");
      fetchAuctionResults();
    }
  };

  return (
    <div className="mod-auction-result">
      <h2 className="mod-auction-result-title">Auction Results</h2>

      {loading && <p className="mod-auction-result-loading">Loading...</p>}

      {!loading && auctionResults.length === 0 && (
        <p className="mod-auction-result-empty">No auction results found.</p>
      )}

      <div className="mod-auction-result-card-list">
        {auctionResults.map((item) => (
          <div className="mod-auction-result-card" key={item._id}>
            <h3 className="mod-auction-result-card-title">
              Auction ID: {item.auction_id}
            </h3>

            {/* Bidder info */}
            {item.bidder && (
              <div className="mod-auction-result-user">
                <img
                  src={buildImageUrl(item.bidder.profileImage, useBackupImg)}
                  onError={() => setUseBackupImg(true)}
                  alt={item.bidder.username}
                  className="mod-auction-result-avatar"
                />
                <span className="mod-auction-result-username">
                  Bidder: {item.bidder.username}
                </span>
              </div>
            )}

            {/* Hoster info */}
            {item.hoster && (
              <div className="mod-auction-result-user">
                <img
                  src={buildImageUrl(item.hoster.profileImage, useBackupImg)}
                  onError={() => setUseBackupImg(true)}
                  alt={item.hoster.username}
                  className="mod-auction-result-avatar"
                />
                <span className="mod-auction-result-username">
                  Hoster: {item.hoster.username}
                </span>
              </div>
            )}

            <p><strong>Quantity:</strong> {item.quantity}</p>
            <p><strong>Bidder Amount:</strong> {item.bidder_amount}</p>
            <p><strong>Host Claim Amount:</strong> {item.host_claim_amount}</p>
            <p>
              <strong>Status:</strong>{" "}
              {item.is_solved ? (
                <span className="mod-auction-result-status solved">Solved</span>
              ) : (
                <span className="mod-auction-result-status pending">Pending</span>
              )}
            </p>

            {!item.is_solved && (
              <button
                className="mod-auction-result-btn-update"
                onClick={() => handleUpdateSettlement(item.auction_id)}
              >
                Confirm Settlement
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
