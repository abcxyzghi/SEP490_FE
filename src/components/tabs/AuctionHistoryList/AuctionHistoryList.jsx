import React, { useEffect, useState } from "react";
import "./AuctionHistoryList.css";
import { fetchMyAuctionList, fetchJoinedAuctionList, fetchAuctionWinner } from "../../../services/api.auction";
import { getCollectionDetail } from "../../../services/api.product";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { getOtherProfile } from "../../../services/api.user";

export default function AuctionHistoryList() {
  const [myAuctions, setMyAuctions] = useState([]);
  const [joinedAuctions, setJoinedAuctions] = useState([]);
  const [winners, setWinners] = useState([]);
  const [useBackupImg, setUseBackupImg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my"); // 'my' | 'joined' | 'winners'
  const [error, setError] = useState(null);

  useEffect(() => {
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

        // Filter ended auctions created by me (based on end_time)
        const endedMyAuctions = myItems.filter((auction) => {
          try {
            const endTime = new Date(auction.end_time);
            return endTime < now;
          } catch {
            return false;
          }
        });

        setMyAuctions(endedMyAuctions);
        setJoinedAuctions(joinedItems || []);

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

        setWinners((enrichedWinners || []).filter((i) => i._enriched !== false));
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

  const renderMyAuctions = () => {
    if (!myAuctions.length) return <div className="auctionHistoryList-empty">No ended auctions found.</div>;

    return (
      <ul className="auctionHistoryList-list">
        {myAuctions.map((auction) => (
          <li key={auction.id || auction._id} className="auctionHistoryList-card">
            <div className="auctionHistoryList-card-left">
              <div className="auctionHistoryList-avatar-placeholder" aria-hidden />
            </div>

            <div className="auctionHistoryList-card-body">
              <div className="auctionHistoryList-card-title">{auction.title}</div>
              <div className="auctionHistoryList-card-desc">{auction.descripition}</div>

              <div className="auctionHistoryList-card-row">
                <div className="auctionHistoryList-finance">
                  {fmtVND(auction.host_value)} <span className="auctionHistoryList-muted">• fee {auction.fee_charge}</span> <strong>{fmtVND(auction.incoming_value)}</strong>
                </div>
                <div className="auctionHistoryList-endtime">Ended: {new Date(auction.end_time).toLocaleString()}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const renderJoinedAuctions = () => {
    if (!joinedAuctions.length) return <div className="auctionHistoryList-empty">No joined auctions found.</div>;

    return (
      <ul className="auctionHistoryList-list">
        {joinedAuctions.map((auction) => (
          <li key={auction.id || auction._id} className="auctionHistoryList-card">
            <div className="auctionHistoryList-card-left">
              <div className="auctionHistoryList-avatar-small" aria-hidden />
            </div>

            <div className="auctionHistoryList-card-body">
              <div className="auctionHistoryList-card-title">{auction.title}</div>
              <div className="auctionHistoryList-card-desc">{auction.descripition}</div>
              <div className="auctionHistoryList-card-row">
                <div className="auctionHistoryList-endtime">Ends at: {new Date(auction.end_time).toLocaleString()}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const renderWinners = () => {
    if (!winners.length) return <div className="auctionHistoryList-empty">No winners found.</div>;

    return (
      <ul className="auctionHistoryList-list">
        {winners.map((item, idx) => {
          const product = item.productDetail;
          const bidder = item.bidderProfile;
          const hoster = item.hosterProfile;
          return (
            <li key={idx} className="auctionHistoryList-card auctionHistoryList-card--winner">
              <div className="auctionHistoryList-card-left">
                {product?.urlImage ? (
                  <img
                    src={buildImageUrl(product.urlImage, useBackupImg)}
                    onError={() => setUseBackupImg(true)}
                    alt={product?.name || "product"}
                    className="auctionHistoryList-product-img" />
                ) : (
                  <div className="auctionHistoryList-avatar-placeholder" />
                )}
              </div>

              <div className="auctionHistoryList-card-body">
                <div className="auctionHistoryList-card-title">{item.auction_info?.title || "Auction"}</div>
                <div className="auctionHistoryList-card-desc">{item.auction_info?.descripition}</div>

                <div className="auctionHistoryList-subgrid">
                  <div>
                    <div className="muted">Product</div>
                    <div className="auctionHistoryList-mini">
                      <div className="auctionHistoryList-mini-name">{product?.name}</div>
                      <div className="muted">Rarity: {product?.rarityName}</div>
                    </div>
                  </div>

                  <div>
                    <div className="muted">Winner</div>
                    <div className="auctionHistoryList-mini">
                      <div className="auctionHistoryList-mini-name">{bidder?.username}</div>
                      <div className="muted">{bidder?.email}</div>
                    </div>
                  </div>

                  <div>
                    <div className="muted">Host</div>
                    <div className="auctionHistoryList-mini">
                      <div className="auctionHistoryList-mini-name">{hoster?.username}</div>
                    </div>
                  </div>
                </div>

                <div className="auctionHistoryList-card-row" style={{ marginTop: 10 }}>
                  <div className="auctionHistoryList-finance">
                    Qty: {item.auction_result?.quantity} • Winning: {fmtVND(item.auction_result?.bidder_amount)} • Host Claim: {fmtVND(item.auction_result?.host_claim_amount)}
                  </div>
                  <div className="auctionHistoryList-endtime">Ended: {new Date(item.auction_info?.end_time).toLocaleString()}</div>
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
          <h2 className="auctionHistoryList__title">Auction History</h2>

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
    </div>
  );
}
