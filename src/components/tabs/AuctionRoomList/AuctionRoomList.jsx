import React, { useEffect, useState } from "react";
import './AuctionRoomList.css';
import { useNavigate, Link } from "react-router-dom";
import { Pathname } from "../../../router/Pathname";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { fetchAuctionList, Top5bidAuction } from "../../../services/api.auction";
import { getOtherProfile } from "../../../services/api.user";
import { getCollectionDetail } from "../../../services/api.product"
import { useSelector } from "react-redux";
import * as HoverCard from "@radix-ui/react-hover-card";
import MessageModal from "../../libs/MessageModal/MessageModal";
import MobileDownLink from "../../libs/MobileDownLink/MobileDownLink";
import ProfileHolder from "../../../assets/others/mmbAvatar.png";
import MessageIcon from "../../../assets/Icon_fill/comment_fill.svg";
import moment from "moment";
import { Modal } from "antd";

export default function AuctionRoomList() {
  // State for auction product details (starting_price, quantity, user_product_id)
  const [auctionProductDetails, setAuctionProductDetails] = useState({});
  // State lưu thông tin collection cho từng product_id
  const [collectionDetails, setCollectionDetails] = useState({});
  const user = useSelector((state) => state.auth.user);
  const [auctionList, setAuctionList] = useState([]);
  const [sellerProfiles, setSellerProfiles] = useState({});
  const [useBackupImg, setUseBackupImg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("started"); // default: ongoing
  const { searchText = "" } = arguments[0] || {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });
  // Top 5 bids state: { [auctionId]: [{...bid, profile: {...}}] }
  const [topBids, setTopBids] = useState({});
  // State to control top bids visibility per auction
  const [showTopBids, setShowTopBids] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  const navigate = useNavigate();
  const fmtVND = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(Number(v || 0)) + " VND";
  // Only fetch if user is logged in
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("");
      setAuctionList([]);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        let auctions = [];
        if (statusFilter === "all") {
          const _default = await fetchAuctionList("default");
          auctions = [
            ...(_default?.data?.data.filter(item => new Date(item.end_time) < new Date()).sort((a, b) => new Date(b.start_time) - new Date(a.start_time)) || [])
          ];
        } else {
          const result = await fetchAuctionList(statusFilter);
          auctions = result?.data?.data.sort((b, a) => new Date(b.start_time) - new Date(a.start_time)) || [];
        }
        setAuctionList({ data: { data: auctions } });

        // Fetch seller profiles for each auction
        const sellerIds = auctions.map(a => a.seller_id).filter(Boolean);
        const profilePromises = sellerIds.map(id => getOtherProfile(id));
        const profiles = await Promise.all(profilePromises);
        const profileMap = {};
        profiles.forEach((res, idx) => {
          if (res?.status && res.data) {
            profileMap[sellerIds[idx]] = res.data;
          }
        });
        setSellerProfiles(profileMap);

        // Fetch collection details for each auction (product_id)
        const collectionDetailMap = {};
        for (const auction of auctions) {
          if (auction.product_id) {
            try {
              const res = await getCollectionDetail(auction.product_id);
              if (res?.status && res.data) {
                collectionDetailMap[auction.product_id] = {
                  urlImage: res.data.urlImage || '',
                  rarityName: res.data.rarityName || '',
                };
              }
            } catch (err) {
              // skip on error
            }
          }
        }
        setCollectionDetails(collectionDetailMap);

        // Fetch auction product details for each auction
        const auctionProductDetailMap = {};
        for (const auction of auctions) {
          try {
            const res = await import("../../../services/api.auction");
            const AuctionProductDetail = res.AuctionProductDetail;
            const detailRes = await AuctionProductDetail(auction.auction_id);
            if (detailRes?.success && Array.isArray(detailRes.data) && detailRes.data.length > 0) {
              auctionProductDetailMap[auction.auction_id] = detailRes.data[0];
            }
          } catch (err) {
            // skip on error
          }
        }
        setAuctionProductDetails(auctionProductDetailMap);

        // Top 5 bids for each auction
        const bidsMap = {};
        for (const auction of auctions) {
          if (!auction.auction_id) {
            console.warn('Auction missing auction_id:', auction);
            bidsMap[auction.auction_id || 'unknown'] = [];
            continue;
          }
          try {
            const bidRes = await Top5bidAuction(auction.auction_id);
            if (bidRes?.success && Array.isArray(bidRes.data)) {
              // Get unique bidder ids
              const bidderIds = [...new Set(bidRes.data.slice(0, 5).map(b => b.bidder_id))];
              const bidderProfiles = await Promise.all(bidderIds.map(id => getOtherProfile(id)));
              const bidderProfileMap = {};
              bidderProfiles.forEach((res, idx) => {
                if (res?.status && res.data) {
                  bidderProfileMap[bidderIds[idx]] = res.data;
                }
              });
              // Attach profile to each bid
              bidsMap[auction.auction_id] = bidRes.data.slice(0, 5).map(bid => ({
                ...bid,
                profile: bidderProfileMap[bid.bidder_id] || {},
              }));
            } else {
              bidsMap[auction.auction_id] = [];
            }
          } catch (err) {
            console.warn('Top5bidAuction error for auction', auction.auction_id, err);
            bidsMap[auction.auction_id] = [];
          }
        }
        setTopBids(bidsMap);
      } catch (err) {
        setError("An error occurred while loading auction rooms.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [statusFilter, user]);
  // Toggle top bids visibility per auction
  const handleToggleTopBids = (auctionId) => {
    setShowTopBids((prev) => ({
      ...prev,
      [auctionId]: !prev[auctionId],
    }));
  };

  // helpers
  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return "-";
    }
  };

  const auctionsRaw = auctionList?.data?.data || [];
  // Filter auctions by searchText
  const auctions = auctionsRaw.filter((auction) => {
    if (!searchText) return true;
    const seller = sellerProfiles[auction.seller_id];
    const username = seller?.username || "";
    const title = auction.title || "";
    const desc = auction.description || "";
    const q = searchText.toLowerCase();
    return (
      username.toLowerCase().includes(q) ||
      title.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q)
    );
  });

  // If not logged in, show message
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white oxanium-regular">
        <div className="bg-gray-800/80 p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-2">Auction Room List</h2>
          <p className="text-lg text-gray-300 mb-4">
            You must be logged in to view auction rooms.
          </p>
          <p className="text-gray-400 mb-6">
            Please log in to access this feature.
          </p>
          {/* Trigger button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 bg-gradient-to-r from-purple-500 to-yellow-400 text-gray-900 font-semibold rounded-lg shadow-md cursor-pointer hover:opacity-90 transition"
          >
            Open Mobile App
          </button>
        </div>

        {/* Mobile link modal */}
        <MobileDownLink open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="auctionRoomList oxanium-regular">
      <div className="auctionRoomList__container">
        {/* Header */}
        <div className="auctionRoomList__header">
          <button className="auctionRoomList__rules-btn oxanium-regular" onClick={() => setIsOpen(true)}>Rules</button>
          <div className="auctionRoomList__filter">
            <label className="auctionRoomList__filter-label">Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="auctionRoomList__filter-select"
            >
              <option value="all">End</option>
              <option value="started">On going</option>
              <option value="waiting">Waiting</option>
            </select>
          </div>


        </div>

        {/* Loading */}
        {loading && (
          <div className="auctionRoomList__grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="auctionRoomList__card">
                <div className="skeleton rounded-lg w-24 h-24 bg-gray-700/40 auctionRoomList__img" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-5 w-48 rounded-md bg-gray-700/40" />
                  <div className="skeleton h-4 w-36 rounded-md bg-gray-700/40" />
                  <div className="skeleton h-3 w-24 rounded-md bg-gray-700/40" />
                  <div className="flex gap-2 mt-2 justify-between align-center">
                    <div className="skeleton h-5 w-24 rounded-md bg-gray-700/40" />
                    <div className="skeleton h-8 w-20 rounded-md bg-gray-700/40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="auctionRoomList__error text-center oxanium-regular">{error}</div>
        )}

        {/* Empty */}
        {!loading && !error && auctions.length === 0 && (
          <div className="auctionRoomList__state auctionRoomList__empty oxanium-regular">
            No auction room available.
          </div>
        )}

        {/* List */}
        {!loading && !error && auctions.length > 0 && (
          <ul className="auctionRoomList__grid">
            {auctions.map((auction) => {
              const seller = sellerProfiles[auction.seller_id];
              const bids = topBids[auction.auction_id] || [];
              const collectionDetail = auction.product_id ? collectionDetails[auction.product_id] || {} : {};
              // Auction product detail (starting_price, quantity, user_product_id)
              const auctionDetail = auctionProductDetails[auction.auction_id] || {};
              // Filter unique bidder_id, keep highest bid_amount for each
              const uniqueBidsMap = {};
              bids.forEach(bid => {
                if (!uniqueBidsMap[bid.bidder_id] || bid.bid_amount > uniqueBidsMap[bid.bidder_id].bid_amount) {
                  uniqueBidsMap[bid.bidder_id] = bid;
                }
              });
              const uniqueBids = Object.values(uniqueBidsMap).sort((a, b) => b.bid_amount - a.bid_amount);
              return (
                <li key={auction.auction_id} className="auctionRoomList__card" style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", flexDirection: "row", width: "100%", gap: "12px" }}>
                    <div className="auctionRoomList__card-media">
                      <img
                        src={
                          seller?.profileImage
                            ? buildImageUrl(seller.profileImage, useBackupImg)
                            : ProfileHolder
                        }
                        onError={() => setUseBackupImg(true)}
                        alt={seller?.username || "seller"}
                        className="auctionRoomList__card-media-img"
                      />
                    </div>

                    <div className="auctionRoomList__card-body">
                      <div className="auctionRoomList__card-head">
                        <div className="auctionRoomList__card-info">
                          <h3 className="auctionRoomList__card-title">
                            <AuctionTextExpand text={auction.title} maxLength={60} className="auctionRoomList__card-title" />
                          </h3>
                          <AuctionTextExpand text={auction.description} maxLength={120} className="auctionRoomList__card-description" />
                          {/* Always render quantity, show fallback if missing */}
                          <div className="auctionRoomList__quantity">
                            Quantity: {typeof auctionDetail.quantity !== 'undefined' ? auctionDetail.quantity : (typeof auction.quantity !== 'undefined' ? auction.quantity : <span style={{ color: '#f55' }}>Not found</span>)}
                          </div>
                          <div className="auctionRoomList__starting-price">
                            {typeof auctionDetail.starting_price === 'number' && auctionDetail.starting_price > 0
                              ? `Starting Price: ${fmtVND(auctionDetail.starting_price)}`
                              : <span style={{ color: '#f55' }}>Starting Price: Not found</span>}
                          </div>
                        </div>

                        <div className="auctionRoomList__card-meta">
                          <StatusBadge status={auction.status} start_time={auction.start_time} end_time={auction.end_time} />
                          {seller && (
                            <div className="auctionRoomList__seller">
                              <span className="auctionRoomList__seller-name">by {seller.username}</span>
                            </div>
                          )}
                          {/* Always render urlImage and rarityName, fallback if missing */}
                          <div className="auctionRoomList__collection">
                            {typeof collectionDetail.urlImage === 'string' && collectionDetail.urlImage.trim() !== '' ? (
                              <img
                                src={buildImageUrl(collectionDetail.urlImage, useBackupImg)}
                                onError={() => setUseBackupImg(true)}
                                alt={collectionDetail.rarityName || 'Product'}
                                style={{ width: 60, height: 'auto', objectFit: 'cover' }}
                              />
                            ) : (
                              <span style={{ color: '#f55', fontSize: 12 }}>No image</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Compact finance row: StartPrice → Fee → Net */}
                      <div className="auctionRoomList__finance-row" title="Start • Fee • Net">
                        <div className="auctionRoomList__finance-item auctionRoomList__finance-start">
                          {fmtVND(auction.auction_current_amount)}
                        </div>
                        <div className="auctionRoomList__finance-sep">→</div>
                        <div className="auctionRoomList__finance-item auctionRoomList__finance-fee">
                          -{auction.transaction_fee_percent ?? '-'}%
                        </div>
                        <div className="auctionRoomList__finance-sep">→</div>
                        <div className="auctionRoomList__finance-item auctionRoomList__finance-net">
                          {fmtVND(auction.host_obtain_amount)}
                        </div>
                      </div>

                      <div className="auctionRoomList__dates">
                        <div className="auctionRoomList__date-item">
                          <span className="auctionRoomList__date-label">Start:</span>
                          <span className="auctionRoomList__date-value">
                            {moment(auction.start_time).local().format('DD/MM/YYYY HH:mm')}
                          </span>
                        </div>
                        <div className="auctionRoomList__date-item">
                          <span className="auctionRoomList__date-label">End:</span>
                          <span className="auctionRoomList__date-value">
                            {moment(auction.end_time).local().format('DD/MM/YYYY HH:mm')}
                          </span>
                        </div>
                      </div>

                      <div className="auctionRoomList__footer">
                        <button
                          className="auctionRoomList__viewBtn"
                          onClick={() => setIsModalOpen(true)}
                        >
                          View detail
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Top 5 bids section */}
                  <div className="order-history-expand mt-3" style={{ width: "100%" }}>
                    {bids.length > 0 && (
                      <div className="auctionRoomList__topBid" style={{ marginTop: 12 }}>
                        <button
                          style={{
                            width: "30%",
                            margin: "0 auto",
                            background: "#2a2e38",
                            border: "1px solid #444",
                            padding: "6px 14px",
                            borderRadius: 6,
                            fontSize: 14,
                            cursor: "pointer",
                            color: "#fff",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#3a3f4b";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#2a2e38";
                          }}
                          onClick={() => handleToggleTopBids(auction.auction_id)}
                        >
                          {showTopBids[auction.auction_id] ? "Hide top 5 bids" : "Show top 5 bids"}
                        </button>

                        {showTopBids[auction.auction_id] && (
                          <div style={{ marginTop: 10 }}>
                            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                              {uniqueBids.map((bid, idx) => (
                                <li
                                  key={bid._id || idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "8px 10px",
                                    borderRadius: 6,
                                    borderBottom: "1px solid #333",
                                    fontSize: 14,
                                    gap: 12,
                                    color: "#ddd",
                                    cursor: "default",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#31333b63";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
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
                                      width: 32,
                                      height: 32,
                                      borderRadius: "50%",
                                      marginRight: 8,
                                    }}
                                  />
                                  <span
                                    style={{
                                      flex: 1,
                                      fontWeight: 500,
                                      color: "#fff",
                                    }}
                                  >
                                    {bid.profile?.username || "Unknown"}
                                  </span>
                                  <span
                                    style={{
                                      minWidth: 100,
                                      textAlign: "right",
                                      fontWeight: 600,
                                      color: "#4da6ff",
                                    }}
                                  >
                                    {fmtVND(bid.bid_amount)}
                                  </span>
                                  <span
                                    style={{
                                      minWidth: 140,
                                      textAlign: "right",
                                      color: "#aaa",
                                      fontSize: 13,
                                    }}
                                  >
                                    {moment(bid.bid_time).local().format("DD/MM/YYYY HH:mm")}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Mobile link modal */}
        <MobileDownLink open={isModalOpen} onClose={() => setIsModalOpen(false)} />

        {/* Message Modal */}
        <MessageModal
          open={modal.open}
          onClose={() => setModal(prev => ({ ...prev, open: false }))}
          type={modal.type}
          title={modal.title}
          message={modal.message}
        />
        <Modal
          className="rules-modal"
          open={isOpen}
          onCancel={() => setIsOpen(false)}
          footer={null}
          centered
          title="Auction System Regulations"
        >
          <div className="rules-modal__content oxanium-regular">
            <h3>Article 1. Auction Session Creation</h3>
            <p>
              The organizer (Host) must create an auction session at least 4 hours
              prior to the scheduled start time.
            </p>
            <p>
              During the waiting period before the session begins, no participants
              are allowed to place bids.
            </p>
            <p>Each auction session is associated with one unique product.</p>

            <h3>Article 2. Starting Price and Session Duration</h3>
            <p>The Host determines the starting price of the product.</p>
            <p>
              The duration of each auction session is predetermined by the system
              and cannot be altered by users.
            </p>

            <h3>Article 3. Bidding Rules</h3>
            <p>
              The first valid bid placed by a participant must be equal to or
              higher than the starting price.
            </p>
            <p>
              Each subsequent bid must be at least <b>5%</b> higher than the
              current highest bid.
            </p>
            <p>
              Example: If the current highest bid is 1,000,000 VND → the next bid
              must be ≥ 1,050,000 VND.
            </p>
            <p>
              A participant cannot place consecutive bids against themselves
              (self-overbidding is prohibited).
            </p>
            <p>
              If a bid is placed within the final 1 minute of the auction session,
              the system will automatically extend the auction time by an
              additional 2 minutes.
            </p>

            <h3>Article 4. Auction Conclusion</h3>
            <p>
              At the end of the auction, the system will automatically determine
              the winner as the participant with the highest valid bid.
            </p>
            <p>
              After the auction session concludes, there will be a processing
              period of up to 24 hours for verification and the official
              announcement of the result.
            </p>

            <h3>Article 5. Responsibilities and Compliance</h3>
            <p>
              All participants must comply with these regulations; any fraudulent
              or violating behavior will result in bid cancellation and potential
              penalties under system policies.
            </p>
            <p>
              The system reserves the right to monitor, suspend, or cancel an
              auction session if irregularities are detected.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
}

function StatusBadge({ status, start_time, end_time }) {
  // status: 0 waiting, 1 started, 2 ended
  const now = Date.now();
  let label, classes;
  if (status === 1) {
    const start = new Date(start_time).getTime();
    const end = new Date(end_time).getTime();
    if (now >= start && now <= end) {
      label = "On Going";
      classes = "bg-green-600/20 text-green-200 border border-green-500";
    } else if (now > end) {
      label = "Finished";
      classes = "bg-blue-500/20 text-blue-200 border-blue-600";
    }
    else {
      label = "Waiting";
      classes = "bg-yellow-500/20 text-yellow-200 border border-yellow-600";
    }
  } else if (status === 0) {
    label = "Waiting";
    classes = "bg-yellow-500/20 text-yellow-200 border border-yellow-600";
  } else if (status === -1) {
    label = "Rejected";
    classes = "bg-gray-600/20 text-gray-200 border border-gray-500";
  } else {
    label = "Unidentified";
    classes = "bg-gray-600/20 text-gray-200 border border-gray-500";
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs oxanium-regular ${classes}`}>{label}</span>;
}

function getStatusLabelAndClass(status) {
  switch (status) {
    case 0:
      return { label: "Waiting", classes: "bg-yellow-500/20 text-yellow-200 border border-yellow-600" };
    case 1:
      return { label: "On Going", classes: "bg-green-600/20 text-green-200 border border-green-500" };
    case -1:
      return { label: "Rejected", classes: "bg-gray-600/20 text-gray-200 border border-gray-500" };
    default:
      return { label: "Unidentified", classes: "bg-gray-600/20 text-gray-200 border border-gray-500" };
  }
}

function AuctionTextExpand({ text, maxLength = 60, className }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > maxLength;
  const displayText = expanded || !isLong ? text : text.slice(0, maxLength) + "...";
  return (
    <span className={className} style={{ wordBreak: 'break-word' }}>
      {displayText}
      {isLong && (
        <button
          className="auctionRoomList__seeMoreBtn"
          type="button"
          onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </span>
  );
}
