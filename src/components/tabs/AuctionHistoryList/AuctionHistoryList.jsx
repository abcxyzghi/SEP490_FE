/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import "./AuctionHistoryList.css";
import { fetchMyAuctionList, fetchJoinedAuctionList, fetchAuctionWinner, Top5bidAuction, AuctionProductDetail } from "../../../services/api.auction";
import { getCollectionDetail } from "../../../services/api.product";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { getOtherProfile } from "../../../services/api.user";
import * as HoverCard from "@radix-ui/react-hover-card";
import { useNavigate, Link } from "react-router-dom";
import { Pathname } from "../../../router/Pathname";
import MessageModal from "../../libs/MessageModal/MessageModal";
import ProfileHolder from "../../../assets/others/mmbAvatar.png";
import MessageIcon from "../../../assets/Icon_fill/comment_fill.svg";
import moment from "moment";

export default function AuctionHistoryList() {
  // State tạm thời cho joined auction financials
  const [joinedFinancials, setJoinedFinancials] = useState({});
  // State lưu feePercent lấy từ fetchMyAuctionList
  const [feePercent, setFeePercent] = useState('');
  const [myAuctions, setMyAuctions] = useState([]);
  const [joinedAuctions, setJoinedAuctions] = useState([]);
  const [winners, setWinners] = useState([]);
  const [useBackupImg, setUseBackupImg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my"); // 'my' | 'joined' | 'winners'
  const [error, setError] = useState(null);
  const [sellerProfiles, setSellerProfiles] = useState({});
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });
  const [topBids, setTopBids] = useState({}); // { [auctionId]: [{...bid, profile: {...}}] }
  const [showTopBids, setShowTopBids] = useState({}); // { [auctionId]: boolean }
  const navigate = useNavigate();
  const [auctionProductDetails, setAuctionProductDetails] = useState({});
  // Collection details state: { [user_product_id]: { urlImage, rarityName } }
  const [collectionDetails, setCollectionDetails] = useState({});
  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  useEffect(() => {
  // Sau khi lấy AuctionProductDetail cho joinedItems, lưu starting_price và fee_charge vào joinedFinancials
  const tempFinancials = {};
    const loadAuctions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch initial data concurrently
        const [resMy, resJoined, resWinner] = await Promise.all([
          fetchMyAuctionList(),
          fetchJoinedAuctionList(),
          fetchAuctionWinner(),
        ]);

        const now = new Date();

        // normalize arrays (some of your endpoints return { data: [...] })
        const myItems = Array.isArray(resMy?.data) ? resMy.data : Array.isArray(resMy) ? resMy : (resMy?.data?.data || []);
        const joinedItems = Array.isArray(resJoined?.data) ? resJoined.data : Array.isArray(resJoined) ? resJoined : (resJoined?.data?.data || []);
        const winnerItems = Array.isArray(resWinner?.data) ? resWinner.data : Array.isArray(resWinner) ? resWinner : (resWinner?.data?.data || []);

        // Lấy fee_charge đầu tiên từ myItems
        if (Array.isArray(myItems) && myItems.length > 0) {
          setFeePercent(myItems[0].fee_charge || '');
        }
        // Bỏ lọc end_time, hiển thị tất cả auction của tôi
        const allMyAuctions = Array.isArray(myItems) ? [...myItems].reverse() : [];
        setMyAuctions(allMyAuctions);
        joinedItems.reverse();
        setJoinedAuctions(joinedItems || []);

        // Collect all seller_ids from both lists
        const sellerIds = [
          ...allMyAuctions.map(a => a.seller_id).filter(Boolean),
          ...joinedItems.map(a => a.seller_id).filter(Boolean)
        ];
        // Remove duplicates
        const uniqueSellerIds = Array.from(new Set(sellerIds));
        // Fetch all seller profiles
        const profileResults = await Promise.all(
          uniqueSellerIds.map(id => getOtherProfile(id))
        );
        const profileMap = {};
        profileResults.forEach((res, idx) => {
          if (res?.data) profileMap[uniqueSellerIds[idx]] = res.data;
        });
        setSellerProfiles(profileMap);

        // Fetch top 5 bids for each auction của tôi và joinedAuction
        const bidsMap = {};
        // MyAuctions
        for (const auction of allMyAuctions) {
          try {
            const bidRes = await Top5bidAuction(auction.id);
            if (bidRes?.success && Array.isArray(bidRes.data)) {
              const bidderIds = [...new Set(bidRes.data.slice(0, 5).map(b => b.bidder_id))];
              const bidderProfiles = await Promise.all(bidderIds.map(id => getOtherProfile(id)));
              const bidderProfileMap = {};
              bidderProfiles.forEach((res, idx) => {
                if (res?.status && res.data) {
                  bidderProfileMap[bidderIds[idx]] = res.data;
                }
              });
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
        // JoinedAuctions
        for (const auction of joinedItems) {
          try {
            const bidRes = await Top5bidAuction(auction._id);
            if (bidRes?.success && Array.isArray(bidRes.data)) {
              const bidderIds = [...new Set(bidRes.data.slice(0, 5).map(b => b.bidder_id))];
              const bidderProfiles = await Promise.all(bidderIds.map(id => getOtherProfile(id)));
              const bidderProfileMap = {};
              bidderProfiles.forEach((res, idx) => {
                if (res?.status && res.data) {
                  bidderProfileMap[bidderIds[idx]] = res.data;
                }
              });
              bidsMap[auction._id] = bidRes.data.slice(0, 5).map(bid => ({
                ...bid,
                profile: bidderProfileMap[bid.bidder_id] || {},
              }));
            } else {
              bidsMap[auction._id] = [];
            }
          } catch {
            bidsMap[auction._id] = [];
          }
        }
        setTopBids(bidsMap);

        // Enrich winners with product and profile details concurrently
        const enrichedWinners = await Promise.all(
          (winnerItems || []).map(async (item) => {
            try {
              const productId = item?.auction_result?.product_id;
              const bidderId = item?.auction_result?.bidder_id;
              const hosterId = item?.auction_result?.hoster_id;

              const [productDetailRes, bidderProfileRes, hosterProfileRes] = await Promise.all([
                productId ? getCollectionDetail(productId) : Promise.resolve({ data: null }),
                bidderId ? getOtherProfile(bidderId) : Promise.resolve({ data: null }),
                hosterId ? getOtherProfile(hosterId) : Promise.resolve({ data: null }),
              ]);

              return {
                ...item,
                productDetail: productDetailRes?.data || null,
                bidderProfile: bidderProfileRes?.data || null,
                hosterProfile: hosterProfileRes?.data || null,
                _enriched: true,
              };
            } catch (err) {
              console.error("Failed to enrich winner item", err, item);
              return { ...item, _enriched: false };
            }
          })
        );
        enrichedWinners.reverse();
        setWinners((enrichedWinners || []).filter((i) => i._enriched !== false));

        // Gộp cả auction của tôi và joinedItems để fetch AuctionProductDetail
        const allAuctionsForDetail = [
          ...allMyAuctions,
          ...joinedItems
        ];

        const auctionDetailMap = {};
        const collectionDetailMap = {};
        for (const auction of allAuctionsForDetail) {
          try {
            // Dùng auction._id nếu có, nếu không dùng auction.id
            const auctionKey = auction._id || auction.id;
            const auctionDetailRes = await AuctionProductDetail(auctionKey);
            let auctionDetailObj = null;
            if (auctionDetailRes?.success && Array.isArray(auctionDetailRes.data) && auctionDetailRes.data.length > 0) {
              auctionDetailObj = auctionDetailRes.data[0];
              auctionDetailMap[auctionKey] = auctionDetailObj;
              // Nếu là joinedAuction thì lưu starting_price và fee_charge vào tempFinancials
              if (joinedItems.find(j => (j._id || j.id) === auctionKey)) {
                const startingPrice = auctionDetailObj.current_price ?? 0;
                const currentPrice = auctionDetailObj.starting_price ?? 0;
                // fee_charge có thể là "5%" hoặc số, cần parse
                let feePercent = 5
                if (typeof auctionDetailObj.fee_charge === 'string' && auctionDetailObj.fee_charge.includes('%')) {
                  feePercent = parseFloat(auctionDetailObj.fee_charge.replace('%', ''));
                } else if (typeof auctionDetailObj.fee_charge === 'number') {
                  feePercent = auctionDetailObj.fee_charge;
                }
                // Tính số tiền host nhận được
                const hostReceive = startingPrice * (1 - feePercent / 100);
                tempFinancials[auctionKey] = {
                  startingPrice,
                  currentPrice,
                  feePercent,
                  hostReceive
                };
              }
              // Get collection detail using user_product_id
              if (auctionDetailObj.user_product_id) {
                const collectionRes = await getCollectionDetail(auctionDetailObj.user_product_id);
                if (collectionRes.data) {
                  const { urlImage = '', rarityName = '' } = collectionRes.data || {};
                  collectionDetailMap[auctionDetailObj.user_product_id] = {
                    urlImage,
                    rarityName
                  };
                }
              }
            }
  setJoinedFinancials(tempFinancials);
          } catch (err) {
            // skip on error
          }
        }
        setAuctionProductDetails(auctionDetailMap);
        setCollectionDetails(collectionDetailMap);

      } catch (err) {
        console.error("Failed to load auctions:", err);
        setError("Failed to load auction history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadAuctions();
  }, []);

  // VND formatter
  const fmtVND = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(Number(v || 0)) + " VND";

  // Skeleton cards while loading
  const renderSkeletonList = () => {
    return (
      <ul className="auctionHistoryList-list">
        {[...Array(3)].map((_, i) => (
          <li key={i} className="auctionHistoryList-card">
            <div className="skeleton rounded-lg w-18 h-18 bg-gray-700/40" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="skeleton h-5 w-48 rounded-md bg-gray-700/40" />
              <div className="skeleton h-4 w-36 rounded-md bg-gray-700/40" />
              <div className="flex gap-2 mt-3 justify-between align-center">
                <div className="skeleton h-5 w-44 rounded-md bg-gray-700/40" />
                <div className="skeleton h-5 w-40 rounded-md bg-gray-700/40" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const handleToggleTopBids = (auctionId) => {
    setShowTopBids((prev) => ({
      ...prev,
      [auctionId]: !prev[auctionId],
    }));
  };

  const renderMyAuctions = () => {
    if (!myAuctions.length) return <div className="auctionHistoryList-empty oleo-script-regular">No ended auction.</div>;

    return (
      <ul className="auctionHistoryList-list">
        {myAuctions.map((auction) => {
          const seller = sellerProfiles[auction.seller_id];
          const bids = topBids[auction.id] || [];
          const auctionDetail = auctionProductDetails[auction.id] || {};
          // Always use auctionDetail.user_product_id as key for collectionDetails
          let collectionDetail = {};
          if (auctionDetail.user_product_id) {
            collectionDetail = collectionDetails[auctionDetail.user_product_id] || {};
          }

          // Filter unique bidder_id, keep highest bid_amount for each
          const uniqueBidsMap = {};
          bids.forEach(bid => {
            if (!uniqueBidsMap[bid.bidder_id] || bid.bid_amount > uniqueBidsMap[bid.bidder_id].bid_amount) {
              uniqueBidsMap[bid.bidder_id] = bid;
            }
          });
          const uniqueBids = Object.values(uniqueBidsMap).sort((a, b) => b.bid_amount - a.bid_amount);
          return (
            <li key={auction.id || auction._id} className="auctionHistoryList-card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", flexDirection: "row", width: "100%", gap: "12px", }}>
                <div className="auctionHistoryList-card-left">
                  <img
                    src={
                      seller?.profileImage
                        ? buildImageUrl(seller.profileImage, useBackupImg)
                        : ProfileHolder
                    }
                    onError={() => setUseBackupImg(true)}
                    alt={seller?.username || "seller"}
                    className="auctionHistoryList-avatar-img"
                  />
                </div>

                <div className="auctionHistoryList-card-body">
                  <div className="auctionHistoryList-card-title" style={{ display: "flex", justifyContent: "space-between" }}>{auction.title}   <div className="auctionRoomList__collection" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
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
                  </div></div>
                  <div className="auctionHistoryList-card-desc">{auction.descripition}</div>
                  {seller && (
                    <div className="auctionHistoryList-seller">
                      <span className="auctionHistoryList-seller-name">by {seller.username}</span>

                    </div>
                  )}

                  <div className="auctionHistoryList-card-row">
                    <div className="auctionHistoryList-finance">
                      {fmtVND(auction.host_value)} <span className="auctionHistoryList-muted">• fee {auction.fee_charge} •</span> <span className="auctionHistoryList-net">{fmtVND(auction.incoming_value)}</span>
                    </div>
                      {/* Render quantity from AuctionProductDetail */}
                      <div className="auctionHistoryList-quantity" style={{ marginTop: 4, color: '#4da6ff', fontWeight: 500 }}>
                        Quantity: {auctionDetail.quantity !== undefined ? auctionDetail.quantity : 'N/A'}
                      </div>
                      {/* Hiển thị starting_price từ AuctionProductDetail */}
                        <div className="auctionRoomList__starting-price" style={{ marginTop: 4, fontSize: 14, color: '#4da6ff' }}>
                          {typeof auctionDetail.starting_price === 'number' && auctionDetail.starting_price > 0
                            ? `Starting Price: ${fmtVND(auctionDetail.starting_price)}`
                            : <span style={{ color: '#f55' }}>Starting Price: Not found</span>}
                        </div>
                    <div className="auctionHistoryList-endtime">Ended: {moment(auction.end_time).local().format('DD/MM/YYYY HH:mm')}</div>
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
                  {uniqueBids.length > 0 && (
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
    );
  };

  const renderJoinedAuctions = () => {
    if (!joinedAuctions.length) return <div className="auctionHistoryList-empty oleo-script-regular">No joined auction.</div>;

    return (
      <ul className="auctionHistoryList-list">
        {joinedAuctions.map((auction) => {
          const seller = sellerProfiles[auction.seller_id];
          // Use fallback logic for auctionDetail and collectionDetail
          let auctionDetail = auctionProductDetails[auction._id] || auctionProductDetails[auction.id] || {};
          let collectionDetail = {};
          if (auctionDetail.user_product_id) {
            collectionDetail = collectionDetails[auctionDetail.user_product_id] || {};
          }
          // Lấy financials từ state tạm
          const financials = joinedFinancials[auction._id] || joinedFinancials[auction.id] || {};
          // feePercent lấy từ state
          let feePercentValue = feePercent;
          // Nếu financials.feePercent có, ưu tiên dùng
          if (financials.feePercent !== undefined) feePercentValue = (typeof financials.feePercent === 'number' ? financials.feePercent + '%' : financials.feePercent);
          const bids = topBids[auction._id] || topBids[auction.id] || [];
          // Filter unique bidder_id, keep highest bid_amount for each
          const uniqueBidsMap = {};
          bids.forEach(bid => {
            if (!uniqueBidsMap[bid.bidder_id] || bid.bid_amount > uniqueBidsMap[bid.bidder_id].bid_amount) {
              uniqueBidsMap[bid.bidder_id] = bid;
            }
          });
          const uniqueBids = Object.values(uniqueBidsMap).sort((a, b) => b.bid_amount - a.bid_amount);
          return (
            <li key={auction.id || auction._id} className="auctionHistoryList-card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", flexDirection: "row", width: "100%", gap: "12px", }}>
                <div className="auctionHistoryList-card-left">
                  <img
                    src={
                      seller?.profileImage
                        ? buildImageUrl(seller.profileImage, useBackupImg)
                        : ProfileHolder
                    }
                    onError={() => setUseBackupImg(true)}
                    alt={seller?.username || "seller"}
                    className="auctionHistoryList-avatar-img"
                  />
                </div>

                <div className="auctionHistoryList-card-body">
                  <div className="auctionHistoryList-card-title" style={{ display: "flex", justifyContent: "space-between" }}>{auction.title}
                    <div className="auctionRoomList__collection" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
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
                  <div className="auctionHistoryList-card-desc">{auction.descripition}</div>
                  {seller && (
                    <div className="auctionHistoryList-seller">
                      <span className="auctionHistoryList-seller-name">by {seller.username}</span>
                    </div>
                  )}
                  <div className="auctionHistoryList-card-row">
                    <div className="auctionHistoryList-quantity" style={{ marginTop: 4, color: '#4da6ff', fontWeight: 500 }}>
                      Quantity: {auctionDetail.quantity !== undefined ? auctionDetail.quantity : 'N/A'}
                    </div>
                    {financials && financials.currentPrice!== undefined && (
                      <div style={{ marginTop: 4, color: '#ffb84d', fontWeight: 500 }}>
                        Starting Price: {fmtVND(financials.currentPrice)} 
                      </div>
                    )}
                    {/* Hiển thị financials nếu có */}
                    {financials && financials.startingPrice !== undefined && (
                      <div style={{ marginTop: 4, color: '#ffb84d', fontWeight: 500 }}>
                        Current Price: {fmtVND(financials.startingPrice)} | Fee: {feePercentValue} | Host Receive: {fmtVND(financials.hostReceive)}
                      </div>
                    )}
                    <div className="auctionHistoryList-endtime">Ends at: {moment(auction.end_time).local().format('DD/MM/YYYY HH:mm')}</div>
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
                  {uniqueBids.length > 0 && (
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
                        onClick={() => handleToggleTopBids(auction._id || auction.id)}
                      >
                        {showTopBids[auction._id || auction.id] ? "Hide top 5 bids" : "Show top 5 bids"}
                      </button>

                      {showTopBids[auction._id || auction.id] && (
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
    );
  };

  const renderWinners = () => {
    if (!winners.length) return <div className="auctionHistoryList-empty oleo-script-regular">No win auction.</div>;

    return (
      <ul className="auctionHistoryList-list">
        {winners.map((item, idx) => {
          const product = item.productDetail;
          const bidder = item.bidderProfile;
          const hoster = item.hosterProfile;
          return (
            <li key={idx} className="auctionHistoryList-card auctionHistoryList-card--winner">
              <div className="auctionHistoryList-card-left">
                <img
                  src={buildImageUrl(product.urlImage, useBackupImg)}
                  onError={() => setUseBackupImg(true)}
                  alt={product?.name || "product"}
                  className="auctionHistoryList-product-img" />
              </div>

              <div className="auctionHistoryList-card-body">
                <div className="auctionHistoryList-card-title">{item.auction_info?.title || "Auction"}</div>
                <div className="auctionHistoryList-card-desc">{item.auction_info?.descripition}</div>

                <div className="auctionHistoryList-subgrid">
                  <div>
                    <div className="auctionHistoryList-head-subGrid">Product</div>
                    <div className="auctionHistoryList-mini">
                      <div className="auctionHistoryList-mini-name">{product?.name}</div>
                      <div className="auctionHistoryList-muted">Rarity: {product?.rarityName}</div>
                    </div>
                  </div>

                  <div>
                    <div className="auctionHistoryList-head-subGrid">Winner</div>
                    <div className="auctionHistoryList-mini">
                      <div className="auctionHistoryList-mini-name">{bidder?.username}</div>
                      <div className="auctionHistoryList-muted">{bidder?.email}</div>
                    </div>
                  </div>

                  <div>
                    <div>
                      <div className="auctionHistoryList-head-subGrid">Host</div>
                      <div className="auctionHistoryList-mini">
                        <HoverCard.Root>
                          <HoverCard.Trigger asChild>
                            <div className="auctionHistoryList-mini-name cursor-pointer">
                              {hoster?.username}
                            </div>
                          </HoverCard.Trigger>
                          <HoverCard.Content
                            side="bottom"
                            sideOffset={1}
                            align="start"
                            className="exchange-history-hovercard-content"
                            forceMount
                          >
                            <div className="exchange-history-hovercard-inner">
                              <img
                                src={
                                  hoster?.profileImage
                                    ? buildImageUrl(hoster.profileImage, useBackupImg)
                                    : ProfileHolder
                                }
                                onError={() => setUseBackupImg(true)}
                                alt={hoster?.username}
                                className="exchange-history-hovercard-avatar"
                              />
                              <div className="flex flex-col items-start">
                                <Link
                                  to={Pathname("PROFILE").replace(":id", item.auction_result?.hoster_id)}
                                  className="exchange-history-hovercard-name !mb-[1px]"
                                >
                                  {hoster?.username}
                                </Link>

                                <button
                                  className="profilepage-btn-message oxanium-semibold"
                                  onClick={() => {
                                    const targetId = item.auction_result?.hoster_id;
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
                      </div>
                    </div>
                  </div>

                </div>

                <div className="auctionHistoryList-card-row" style={{ marginTop: 10 }}>
                  <div className="auctionHistoryList-finance">
                    <span className="auctionHistoryList-muted">Qty: {item.auction_result?.quantity} •</span> Winning: {fmtVND(item.auction_result?.bidder_amount)} <span className="auctionHistoryList-muted">• Host Claim: {fmtVND(item.auction_result?.host_claim_amount)}</span>
                  </div>

                  <div className="auctionHistoryList-endtime">
                    Ended: {item.auction_info?.end_time
                      ? moment(item.auction_info.end_time).local().format('DD/MM/YYYY HH:mm')
                      : 'N/A'}
                  </div>

                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="auctionHistoryList">
      <div className="auctionHistoryList__container">
        <header className="auctionHistoryList__header">
          <div className="auctionHistoryList__tabs" role="tablist" aria-label="Auction history tabs">
            <button
              role="tab"
              aria-selected={activeTab === "my"}
              className={`auctionHistoryList__tab ${activeTab === "my" ? "active" : ""}`}
              onClick={() => setActiveTab("my")}
            >
              My Ended Auctions
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "joined"}
              className={`auctionHistoryList__tab ${activeTab === "joined" ? "active" : ""}`}
              onClick={() => setActiveTab("joined")}
            >
              Joined Auctions
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "winners"}
              className={`auctionHistoryList__tab ${activeTab === "winners" ? "active" : ""}`}
              onClick={() => setActiveTab("winners")}
            >
              Auction Winners
            </button>
          </div>
        </header>

        <main className="auctionHistoryList__main">
          {error && <div className="auctionHistoryList-error">{error}</div>}

          {loading ? (
            renderSkeletonList()
          ) : (
            <>
              {activeTab === "my" && renderMyAuctions()}
              {activeTab === "joined" && renderJoinedAuctions()}
              {activeTab === "winners" && renderWinners()}
            </>
          )}
        </main>
      </div>

      {/* Message Modal */}
      <MessageModal
        open={modal.open}
        onClose={() => setModal(prev => ({ ...prev, open: false }))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
}
