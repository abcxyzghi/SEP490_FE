import React, { useEffect, useState } from "react";
import "./MyAuction.css";
import {
  cancelAuction,
  confirmAuction,
  fetchMyAuctionList,
} from "../../../services/api.auction";
import { getOtherProfile } from "../../../services/api.user";
import { useSelector } from "react-redux";
import { buildImageUrl } from "../../../services/api.imageproxy";
import MobileDownLink from "../../libs/MobileDownLink/MobileDownLink";
import ProfileHolder from "../../../assets/others/mmbAvatar.png";
import MessageModal from "../../libs/MessageModal/MessageModal";

export default function MyAuction() {
  const user = useSelector((state) => state.auth.user);
  const [auctionList, setAuctionList] = useState([]);
  const [sellerProfiles, setSellerProfiles] = useState({});
  const [useBackupImg, setUseBackupImg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { searchText = "" } = arguments[0] || {};
  const [modal, setModal] = useState({
    open: false,
    type: "default",
    title: "",
    message: "",
  });
  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };
  const handleDeleteAuction = async (auctionId) => {
    try {
      const res = await cancelAuction(auctionId);
      if (!res?.errorCode) {
        showModal("default", "Success", "Auction cancelled successfully!");
        fetchData();
      } else {
        showModal("error", "Failed", res.message || "Failed to cancel auction");
      }
    } catch (error) {
      showModal(
        "error",
        "Error",
        error.response?.data?.error ||
        "Something went wrong while cancelling auction"
      );
    }
  };

  const handleConfirm = async (auctionId) => {
    try {
      const res = await confirmAuction(auctionId);
      console.log("confirmAuction response:", res);

      const success = res?.success ?? res?.data?.success;

      if (success) {
        showModal("default", "Success", "Auction confirmed successfully!");
        fetchData();
      } else if (res.errorCode === 404) {
        showModal('error', 'Error', 'No one has placed a bid!');

      } else if (res.errorCode === 403) {
        showModal('error', 'Error', 'Auction still in progress');
      }
    } catch (error) {
      console.error("confirm error:", error);
      showModal("error", "Error", error || "Failed to confirm auction.");
    }
  };

  // Tạo hàm fetchData để tái sử dụng
  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      setError("");
      setAuctionList([]);
      return;
    }
    try {
      const result = await fetchMyAuctionList();
      const flattenedData = result.data.flat();
      setAuctionList(flattenedData);

      const sellerIds = flattenedData.map((a) => a.seller_id).filter(Boolean);
      const profilePromises = sellerIds.map((id) => getOtherProfile(id));
      const profiles = await Promise.all(profilePromises);

      const profileMap = {};
      profiles.forEach((res, idx) => {
        if (res?.status && res.data) {
          profileMap[sellerIds[idx]] = res.data;
        }
      });
      setSellerProfiles(profileMap);
    } catch (err) {
      setError("An error occurred while loading your auction list.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Gọi fetchData khi component mount
  useEffect(() => {
    fetchData();
  }, [user]);

  // one sort line (non-mutating)
  const sortedAuctionsRaw = [...auctionList].sort(
    (a, b) =>
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );
  // Filter auctions by searchText
  const sortedAuctions = sortedAuctionsRaw.filter((auction) => {
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

  // VND formatter
  const fmtVND = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(Number(v || 0)) + " VND";

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white oxanium-regular">
        <div className="bg-gray-800/80 p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl oxanium-semibold mb-2">My Auction List</h2>
          <p className="text-lg text-gray-300 mb-4">
            You must be logged in to view your auction list.
          </p>
          <p className="text-gray-400">Please log in to access this feature.</p>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="auctionRoomList oxanium-regular">
        <div className="auctionRoomList__container">
          {/* <div className="auctionRoomList__controls">
            <h2 className="auctionRoomList__title">My auction list</h2>
          </div> */}
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
        </div>
      </div>
    );

  if (error)
    return (
      <div className="auctionRoomList__state auctionRoomList__state--error oxanium-regular">
        {error}
      </div>
    );

  if (sortedAuctions.length === 0)
    return (
      <div className="auctionRoomList oxanium-regular">
        <div className="auctionRoomList__container">
          <div className="auctionRoomList__controls">
            <h2 className="auctionRoomList__title">My auction list</h2>
          </div>
          <div className="auctionRoomList__state auctionRoomList__state--empty oxanium-regular">
            No auctions available
          </div>
        </div>
      </div>
    );

  return (
    <div className="auctionRoomList oxanium-regular">
      <div className="auctionRoomList__container">
        {/* <div className="auctionRoomList__controls">
          <h2 className="auctionRoomList__title">My auction list</h2>
        </div> */}

        <ul className="auctionRoomList__grid">
          {sortedAuctions.map((auction) => {
            const seller = sellerProfiles[auction.seller_id];
            return (
              <li key={auction.id} className="auctionRoomList__card">
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
                        <AuctionTextExpand
                          text={auction.title}
                          maxLength={60}
                          className="auctionRoomList__card-title"
                        />
                      </h3>
                      <AuctionTextExpand
                        text={auction.descripition}
                        maxLength={60}
                        className="auctionRoomList__card-description"
                      />
                    </div>

                    <div className="auctionRoomList__card-meta">
                      <StatusBadge
                        status={auction.status}
                        start_time={auction.start_time}
                        end_time={auction.end_time}
                      />
                      {/* <div className="auctionRoomList__card-id">ID: {auction._id}</div> */}

                      {seller && (
                        <div className="auctionRoomList__seller">
                          <span className="auctionRoomList__seller-name">
                            by {seller.username}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Compact finance row: StartPrice → Fee → Net */}
                  <div
                    className="auctionRoomList__finance-row"
                    title="Start • Fee • Net"
                  >
                    <div className="auctionRoomList__finance-item auctionRoomList__finance-start">
                      {fmtVND(auction.host_value)}
                    </div>
                    <div className="auctionRoomList__finance-sep">→</div>
                    <div className="auctionRoomList__finance-item auctionRoomList__finance-fee">
                      -{auction.fee_charge}
                    </div>
                    <div className="auctionRoomList__finance-sep">→</div>
                    <div className="auctionRoomList__finance-item auctionRoomList__finance-net">
                      {fmtVND(auction.incoming_value)}
                    </div>
                  </div>

                  <div className="auctionRoomList__dates">
                    <div className="auctionRoomList__date-item">
                      <span className="auctionRoomList__date-label">
                        Start:
                      </span>
                      <span className="auctionRoomList__date-value">
                        {new Date(auction.start_time).toLocaleString()}
                      </span>
                    </div>

                    <div className="auctionRoomList__date-item">
                      <span className="auctionRoomList__date-label">End:</span>
                      <span className="auctionRoomList__date-value">
                        {new Date(auction.end_time).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="auctionRoomList__footer">
                    <div className="auctionRoomList__bid">
                      {auction.current_bid
                        ? `Current bid: ${fmtVND(auction.current_bid)}`
                        : "No bid yet"}
                    </div>

                    <div className="auctionRoomList__footer-actions">
                      {(auction.status === 0 || auction.status === -1) && (
                        <button
                          className="auctionRoomList__deleteBtn"
                          onClick={() => handleDeleteAuction(auction.id)}
                        >
                          Cancel
                        </button>
                      )}
                      {auction.status === 1 &&
                        new Date(auction.end_time) <
                        new Date(
                          new Date().toLocaleString("en-US", {
                            timeZone: "Asia/Ho_Chi_Minh",
                          })
                        ) && (
                          <button
                            className="auctionRoomList__deleteBtn"
                            onClick={() => handleConfirm(auction.id)}
                          >
                            Confirm
                          </button>
                        )}
                      <button
                        className="auctionRoomList__viewBtn"
                        onClick={() => setIsModalOpen(true)}
                      >
                        View detail
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Mobile link modal */}
        <MobileDownLink
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        <MessageModal
          open={modal.open}
          onClose={() => setModal((prev) => ({ ...prev, open: false }))}
          type={modal.type}
          title={modal.title}
          message={modal.message}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status, start_time, end_time }) {
  const now = Date.now();
  let label, classes;
  if (status === 1) {
    const start = new Date(start_time).getTime();
    const end = new Date(end_time).getTime();
    if (now >= start && now <= end) {
      label = "On Going";
      classes = "bg-green-600/20 text-green-200 border-green-500";
    } else {
      label = "Waiting";
      classes = "bg-yellow-500/20 text-yellow-200 border-yellow-600";
    }
  } else if (status === 0) {
    label = "Waiting to proceed";
    classes = "bg-yellow-500/20 text-yellow-200 border-yellow-600";
  } else if (status === -1) {
    label = "Rejected";
    classes = "bg-gray-600/20 text-gray-200 border-gray-500";
  } else {
    label = "Unidentified";
    classes = "bg-gray-600/20 text-gray-200 border-gray-500";
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${classes}`}>
      {label}
    </span>
  );
}

function AuctionTextExpand({ text, maxLength = 60, className }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > maxLength;
  const displayText =
    expanded || !isLong ? text : text.slice(0, maxLength) + "...";
  return (
    <span className={className} style={{ wordBreak: "break-word" }}>
      {displayText}
      {isLong && (
        <button
          className="auctionRoomList__seeMoreBtn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </span>
  );
}
