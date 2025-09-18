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

export default function AuctionRoomList() {
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
          // Combine default and waiting
          const _default = await fetchAuctionList("default");
          // const waiting = await fetchAuctionList("waiting");
          auctions = [
            ...(_default?.data?.data.filter(item => new Date(item.end_time) < new Date()).sort((a, b) => new Date(b.start_time) - new Date(a.start_time)) || [])
            // ...(waiting?.data?.data.sort((a, b) => new Date(b.start_time) - new Date(a.start_time)) || [])
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
        <header className="auctionRoomList__header">
          {/* <h2 className="auctionRoomList__title">Auction Room List</h2> */}

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
        </header>

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
              // Lấy collectionDetail từ product_id
              const collectionDetail = auction.product_id ? collectionDetails[auction.product_id] || {} : {};
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
                  <div style={{ display: "flex", flexDirection: "row", width: "100%", gap: "12px", }}>
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
                        </div>

                        <div className="auctionRoomList__card-meta">
                          <StatusBadge status={auction.status} start_time={auction.start_time} end_time={auction.end_time} />
                          {/* <div className="auctionRoomList__card-id">ID: {auction.id}</div> */}

                          {seller && (
                            <div className="auctionRoomList__seller">
                              <div className="auctionHistoryList-seller-name mt-1 text-[0.9rem]">by {" "}
                                {/* reuse style from ExchangeHistory */}
                                <span className="exchange-history-user-info">
                                  <HoverCard.Root>
                                    <HoverCard.Trigger asChild>
                                      <span>{seller.username}</span>
                                    </HoverCard.Trigger>
                                    <HoverCard.Content
                                      side="top" sideOffset={3} align="start"
                                      className="exchange-history-hovercard-content"
                                      forceMount
                                    >
                                      <div className="exchange-history-hovercard-inner">
                                        <img
                                          src={
                                            seller?.profileImage
                                              ? buildImageUrl(seller.profileImage, useBackupImg)
                                              : ProfileHolder
                                          }
                                          onError={() => setUseBackupImg(true)}
                                          alt={seller?.username}
                                          className="exchange-history-hovercard-avatar"
                                        />
                                        <div className="flex flex-col items-start">
                                          <Link
                                            to={Pathname("PROFILE").replace(":id", auction.seller_id)}
                                            className="exchange-history-hovercard-name !mb-[1px]"
                                          >
                                            {seller?.username}
                                          </Link>

                                          <button
                                            // reuse style from Profilepage
                                            className="profilepage-btn-message oxanium-semibold"
                                            onClick={() => {
                                              const targetId = auction.seller_id;

                                              if (!targetId) {
                                                showModal("warning", "Error", "No user found to message.");
                                                return;
                                              }

                                              navigate(`/chatroom/${targetId}`);
                                            }}
                                          >
                                            <img
                                              src={MessageIcon}
                                              alt="Message"
                                              className="profilepage-message-icon"
                                            />
                                            Message
                                          </button>
                                        </div>
                                      </div>
                                    </HoverCard.Content>
                                  </HoverCard.Root>
                                </span>
                              </div>
                            </div>
                          )}
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

                      {/* Thông tin collection: urlImage và rarityName */}
                      <div className="auctionRoomList__collectionInfo" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        {typeof collectionDetail.urlImage === 'string' && collectionDetail.urlImage.trim() !== '' ? (
                          <img
                            src={buildImageUrl(collectionDetail.urlImage, useBackupImg)}
                            onError={() => setUseBackupImg(true)}
                            alt={collectionDetail.rarityName || 'Product'}
                            style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid #333' }}
                          />
                        ) : (
                          <span style={{ color: '#f55', fontSize: 12 }}>No image</span>
                        )}
                        <span style={{ fontSize: 14, color: '#aaf', fontWeight: 500 }}>
                          Rarity: {typeof collectionDetail.rarityName === 'string' && collectionDetail.rarityName.trim() !== '' ? collectionDetail.rarityName : <span style={{ color: '#f55' }}>Not found</span>}
                        </span>
                      </div>
                      {/* Hiển thị các trường quantity, auction_current_amount, transaction_fee_percent, host_obtain_amount */}
                      <div className="auctionRoomList__financial">
                        <div className="auctionRoomList__financial-item">
                          <span className="auctionRoomList__financial-label">Quantity:</span>
                          <span className="auctionRoomList__financial-value">{auction.quantity ?? '-'}</span>
                        </div>
                        <div className="auctionRoomList__financial-item">
                          <span className="auctionRoomList__financial-label">Current Amount:</span>
                          <span className="auctionRoomList__financial-value">{auction.auction_current_amount !== undefined ? fmtVND(auction.auction_current_amount) : '-'}</span>
                        </div>
                        <div className="auctionRoomList__financial-item">
                          <span className="auctionRoomList__financial-label">Transaction Fee (%):</span>
                          <span className="auctionRoomList__financial-value">{auction.transaction_fee_percent ?? '-'}</span>
                        </div>
                        <div className="auctionRoomList__financial-item">
                          <span className="auctionRoomList__financial-label">Host Obtain Amount:</span>
                          <span className="auctionRoomList__financial-value">{auction.host_obtain_amount !== undefined ? fmtVND(auction.host_obtain_amount) : '-'}</span>
                        </div>
                      </div>

                      <div className="auctionRoomList__footer">
                        {/* <div className="auctionRoomList__bid">
                          {auction.current_bid ? `Current bid: ${auction.current_bid}` : "No bid yet"}
                        </div> */}
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
                  <div className="order-history-expand mt-3" style={{ width: "100%", display: "flex", flexDirection: "row", gap: "12px", }}>
                    <div className="auctionRoomList__card-media">
                      <div
                        style={{
                          width: "8.6rem",
                          height: 0,
                          backgroundColor: "transparent",
                        }}
                      />
                    </div>

                    <div className="auctionRoomList__card-body">
                      {bids.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <button
                            style={{
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
                                      borderBottom: "1px solid #333",
                                      fontSize: 14,
                                      gap: 12,
                                      color: "#ddd",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "#242833";
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
