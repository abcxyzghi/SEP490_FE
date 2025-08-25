import React, { useEffect, useState } from "react";
import './AuctionRoomList.css';
import { useNavigate, Link } from "react-router-dom";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { fetchAuctionList } from "../../../services/api.auction";
import { getOtherProfile } from "../../../services/api.user";
import { useSelector } from "react-redux";
import MobileDownLink from "../../libs/MobileDownLink/MobileDownLink";
import ProfileHolder from "../../../assets/others/mmbAvatar.png";

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
            ...(started?.data?.data || []),
            ...(waiting?.data?.data || [])
          ];
        } else {
          const result = await fetchAuctionList(statusFilter);
          auctions = result?.data?.data || [];
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
          <h2 className="auctionRoomList__title">Auction Room List</h2>

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
                        <h3 className="auctionRoomList__card-title">{auction.title}</h3>
                        <p className="auctionRoomList__card-description">
                          {auction.descripition}
                        </p>

                      </div>

                      <div className="auctionRoomList__card-meta">
                        <StatusBadge status={auction.status} />
                        {/* <div className="auctionRoomList__card-id">ID: {auction.id}</div> */}

                        {seller && (
                          <div className="auctionRoomList__seller">
                            <span className="auctionRoomList__seller-name">
                              by {seller.username}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="auctionRoomList__dates">
                      <div className="auctionRoomList__date-item">
                        <span className="auctionRoomList__date-label">Start:</span>
                        <span className="auctionRoomList__date-value">
                          {formatDate(auction.start_time)}
                        </span>
                      </div>
                      <div className="auctionRoomList__date-item">
                        <span className="auctionRoomList__date-label">End:</span>
                        <span className="auctionRoomList__date-value">
                          {formatDate(auction.end_time)}
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
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  // status: 0 waiting, 1 started, 2 ended
  const { label, classes } = getStatusLabelAndClass(status);
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>{label}</span>;
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
