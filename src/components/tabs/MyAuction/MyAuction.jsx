import React, { useEffect, useState } from "react";
import "./MyAuction.css";
import {
  cancelAuction,
  fetchMyAuctionList,
  Top5bidAuction,
  AuctionProductDetail
} from "../../../services/api.auction";
import { getOtherProfile } from "../../../services/api.user";
import { getCollectionDetail } from "../../../services/api.product"
import { useSelector } from "react-redux";
import { buildImageUrl } from "../../../services/api.imageproxy";
import MobileDownLink from "../../libs/MobileDownLink/MobileDownLink";
import ProfileHolder from "../../../assets/others/mmbAvatar.png";
import MessageModal from "../../libs/MessageModal/MessageModal";
import moment from "moment";

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
  // Top 5 bids state: { [auctionId]: [{...bid, profile: {...}}] }
  const [topBids, setTopBids] = useState({});
  // State to control top bids visibility per auction
  const [showTopBids, setShowTopBids] = useState({});
  // Auction product details state: { [auctionId]: { quantity, user_product_id } }
  const [auctionProductDetails, setAuctionProductDetails] = useState({});
  // Collection details state: { [user_product_id]: { urlImage, rarityName } }
  const [collectionDetails, setCollectionDetails] = useState({});
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

  // const handleConfirm = async (auctionId) => {
  //   try {
  //     const res = await confirmAuction(auctionId);
  //     console.log("confirmAuction response:", res);

  //     const success = res?.success ?? res?.data?.success;

  //     if (success) {
  //       showModal("default", "Success", "Auction confirmed successfully!");
  //       fetchData();
  //     } else if (res.errorCode === 404) {
  //       showModal('error', 'Error', 'No one has placed a bid!');

  //     } else if (res.errorCode === 403) {
  //       showModal('error', 'Error', 'Auction still in progress');
  //     }
  //   } catch (error) {
  //     console.error("confirm error:", error);
  //     showModal("error", "Error", error || "Failed to confirm auction.");
  //   }
  // };

  // Tạo hàm fetchData để tái sử dụng
  const fetchData = React.useCallback(async () => {
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

      // Seller profiles
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

      // Top 5 bids for each auction
      const bidsMap = {};
      for (const auction of flattenedData) {
        try {
          const bidRes = await Top5bidAuction(auction.id);
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
            bidsMap[auction.id] = bidRes.data.slice(0, 5).map(bid => ({
              ...bid,
              profile: bidderProfileMap[bid.bidder_id] || {},
            }));
          } else {
            bidsMap[auction.id] = [];
          }
        } catch {
          bidsMap[auction.id] = [];
        }
      }
      setTopBids(bidsMap);

      // Auction product details and collection details
      const auctionDetailMap = {};
      const collectionDetailMap = {};
      for (const auction of flattenedData) {
        try {
          const auctionDetailRes = await AuctionProductDetail(auction.id);
          let auctionDetailObj = null;
          if (auctionDetailRes?.success && Array.isArray(auctionDetailRes.data) && auctionDetailRes.data.length > 0) {
            auctionDetailObj = auctionDetailRes.data[0];
            auctionDetailMap[auction.id] = auctionDetailObj;
            // Debug: log user_product_id
            console.log('Auction:', auction.id, 'user_product_id:', auctionDetailObj.user_product_id);
            // Get collection detail using user_product_id
            if (auctionDetailObj.user_product_id) {
              const collectionRes = await getCollectionDetail(auctionDetailObj.user_product_id);
              // Debug: log collectionRes
              console.log('getCollectionDetail response for', auctionDetailObj.user_product_id, collectionRes);
              if (collectionRes.data) {
                // Defensive: ensure urlImage and rarityName are mapped from data
                const { urlImage = '', rarityName = '' } = collectionRes.data || {};
                collectionDetailMap[auctionDetailObj.user_product_id] = {
                  urlImage,
                  rarityName
                };
              }
            }
          }
        } catch (err) {
          // skip on error
        }
      }
      setAuctionProductDetails(auctionDetailMap);
      setCollectionDetails(collectionDetailMap);
    } catch (err) {
      setError("An error occurred while loading your auction list.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Gọi fetchData khi component mount
  useEffect(() => {
    fetchData();
  }, [user, fetchData]);

  // one sort line (non-mutating)
  const sortedAuctionsRaw = [...auctionList].reverse();
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
      <div className="auctionRoomList__state auctionRoomList__error oxanium-regular">
        {error}
      </div>
    );

  if (sortedAuctions.length === 0)
    return (
      <div className="auctionRoomList oxanium-regular">
        <div className="auctionRoomList__container">
          <div className="auctionRoomList__controls">
            {/* <h2 className="auctionRoomList__title">My auction list</h2> */}
          </div>
          <div className="auctionRoomList__state auctionRoomList__empty oxanium-regular">
            No auctions available
          </div>
        </div>
      </div>
    );

  // State to control top bids visibility per auction

  const handleToggleTopBids = (auctionId) => {
    setShowTopBids((prev) => ({
      ...prev,
      [auctionId]: !prev[auctionId],
    }));
  };

  return (
    <div className="auctionRoomList oxanium-regular">
      <div className="auctionRoomList__container">
        {/* <div className="auctionRoomList__controls">
          <h2 className="auctionRoomList__title">My auction list</h2>
        </div> */}

        <ul className="auctionRoomList__grid" >
          {sortedAuctions.map((auction) => {
            const seller = sellerProfiles[auction.seller_id];
            const bids = topBids[auction.id] || [];
            // Filter unique bidder_id, keep highest bid_amount for each
            const uniqueBidsMap = {};
            bids.forEach(bid => {
              if (!uniqueBidsMap[bid.bidder_id] || bid.bid_amount > uniqueBidsMap[bid.bidder_id].bid_amount) {
                uniqueBidsMap[bid.bidder_id] = bid;
              }
            });
            const uniqueBids = Object.values(uniqueBidsMap).sort((a, b) => b.bid_amount - a.bid_amount);

            // Get auction product detail and collection detail
            const auctionDetail = auctionProductDetails[auction.id] || {};
            // Always use auctionDetail.user_product_id as key for collectionDetails
            let collectionDetail = {};
            if (auctionDetail.user_product_id) {
              collectionDetail = collectionDetails[auctionDetail.user_product_id] || {};
            }

            return (
              <li key={auction.id} className="auctionRoomList__card" style={{ display: "flex", flexDirection: "column" }}>
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
                        {/* Always render quantity, show fallback if missing */}
                        <div className="auctionRoomList__quantity" style={{ marginTop: 4, fontSize: 14, color: '#f5c518' }}>
                          Quantity: {typeof auctionDetail.quantity !== 'undefined' ? auctionDetail.quantity : <span style={{ color: '#f55' }}>Not found</span>}
                        </div>
                        {/* Hiển thị starting_price từ AuctionProductDetail */}
                        <div className="auctionRoomList__starting-price" style={{ marginTop: 4, fontSize: 14, color: '#4da6ff' }}>
                          {typeof auctionDetail.starting_price === 'number' && auctionDetail.starting_price > 0
                            ? `Starting Price: ${fmtVND(auctionDetail.starting_price)}`
                            : <span style={{ color: '#f55' }}>Starting Price: Not found</span>}
                        </div>
                        {/* Always render urlImage and rarityName, fallback if missing */}
                        <div className="auctionRoomList__collection" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {/* Debug: show raw urlImage and rarityName values */}

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
                      {/* <div className="auctionRoomList__bid">
                        {auction.current_bid
                          ? `Current bid: ${fmtVND(auction.current_bid)}`
                          : "No bid yet"}
                      </div> */}



                      <div className="auctionRoomList__footer-actions">
                        {(auction.status === 0 || auction.status === -1) && (
                          <button
                            className="auctionRoomList__deleteBtn"
                            onClick={() => handleDeleteAuction(auction.id)}
                          >
                            Cancel
                          </button>
                        )}
                        {/* {auction.status === 1 &&
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
                        )} */}
                        <button
                          className="auctionRoomList__viewBtn"
                          onClick={() => setIsModalOpen(true)}
                        >
                          View detail
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
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
                            background: "#2a2e38", // nền tối cho button
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
                          onClick={() => handleToggleTopBids(auction.id)}
                        >
                          {showTopBids[auction.id] ? "Hide top 5 bids" : "Show top 5 bids"}
                        </button>

                        {showTopBids[auction.id] && (
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
    </div >
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
    } else if (now < start) {
      label = "Waiting";
      classes = "bg-yellow-500/20 text-yellow-200 border-yellow-600";
    } else if (now > end) {
      label = "Finished";
      classes = "bg-blue-500/20 text-blue-200 border-blue-600";
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
