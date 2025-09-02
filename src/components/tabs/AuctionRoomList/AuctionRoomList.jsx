import React, { useEffect, useState } from "react";
import './AuctionRoomList.css';
import { useNavigate, Link } from "react-router-dom";
import { Pathname } from "../../../router/Pathname";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { fetchAuctionList } from "../../../services/api.auction";
import { getOtherProfile } from "../../../services/api.user";
import { useSelector } from "react-redux";
import * as HoverCard from "@radix-ui/react-hover-card";
import MessageModal from "../../libs/MessageModal/MessageModal";
import MobileDownLink from "../../libs/MobileDownLink/MobileDownLink";
import ProfileHolder from "../../../assets/others/mmbAvatar.png";
import MessageIcon from "../../../assets/Icon_fill/comment_fill.svg";
import moment from "moment";

export default function AuctionRoomList() {
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

  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  const navigate = useNavigate();

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
          // Combine started and waiting
          const started = await fetchAuctionList("started");
          const waiting = await fetchAuctionList("waiting");
          auctions = [
            ...(started?.data?.data.sort((b, a) => new Date(b.start_time) - new Date(a.start_time)) || []),
            ...(waiting?.data?.data.sort((b, a) => new Date(b.start_time) - new Date(a.start_time)) || [])
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
      } catch (err) {
        setError("An error occurred while loading auction rooms.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [statusFilter, user]);

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
    const desc = auction.descripition || "";
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
              <option value="all">All</option>
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
              return (
                <li key={auction.id} className="auctionRoomList__card">
                  {/* Left media (image) */}
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

                  {/* Right body */}
                  <div className="auctionRoomList__card-body">
                    <div className="auctionRoomList__card-head">
                      <div className="auctionRoomList__card-info">
                        <h3 className="auctionRoomList__card-title">
                          <AuctionTextExpand text={auction.title} maxLength={60} className="auctionRoomList__card-title" />
                        </h3>
                        <AuctionTextExpand text={auction.descripition} maxLength={120} className="auctionRoomList__card-description" />
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

                    <div className="auctionRoomList__footer">
                      <div className="auctionRoomList__bid">
                        {auction.current_bid ? `Current bid: ${auction.current_bid}` : "No bid yet"}
                      </div>
                      <button
                        className="auctionRoomList__viewBtn"
                        onClick={() => setIsModalOpen(true)}
                      >
                        View detail
                      </button>
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
    } else {
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
