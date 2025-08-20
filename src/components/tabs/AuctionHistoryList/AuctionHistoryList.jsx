import React, { useEffect, useState } from "react";
import {
  fetchMyAuctionList,
  fetchJoinedAuctionList,
  fetchAuctionWinner,
} from "../../../services/api.auction";
import { getCollectionDetail } from "../../../services/api.product";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { getOtherProfile } from "../../../services/api.user";

export default function AuctionHistoryList() {
  const [myAuctions, setMyAuctions] = useState([]);
  const [joinedAuctions, setJoinedAuctions] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuctions = async () => {
      try {
        setLoading(true);

        // Fetch initial data concurrently for better performance
        const [resMy, resJoined, resWinner] = await Promise.all([
          fetchMyAuctionList(),
          fetchJoinedAuctionList(),
          fetchAuctionWinner(),
        ]);

        const now = new Date();
        const endedMyAuctions = resMy.data.filter((auction) => {
          const endTime = new Date(auction.end_time);
          return endTime < now;
        });
        setMyAuctions(endedMyAuctions);
        setJoinedAuctions(resJoined.data);

        // Process winners list to fetch additional details
        const winnerData = resWinner.data || [];
        const enrichedWinners = await Promise.all(
          winnerData.map(async (item) => {
            try {
              const [productDetailRes, bidderProfileRes, hosterProfileRes] =
                await Promise.all([
                  getCollectionDetail(item.auction_result.product_id),
                  getOtherProfile(item.auction_result.bidder_id),
                  getOtherProfile(item.auction_result.hoster_id),
                ]);

              // Combine all data into a single object
              return {
                ...item,
                productDetail: productDetailRes.data,
                bidderProfile: bidderProfileRes.data,
                hosterProfile: hosterProfileRes.data,
              };
            } catch (error) {
              console.error(
                `Failed to fetch details for winner item: ${item.auction_info._id}`,
                error
              );
              return { ...item, error: true }; // Mark item with an error
            }
          })
        );
        // Only keep items that were successfully enriched
        setWinners(enrichedWinners.filter((item) => !item.error));
      } catch (error) {
        console.error("Failed to load auctions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuctions();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Auction History</h2>

      {/* Auction mình tạo và đã kết thúc */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">My Ended Auctions</h3>
        {myAuctions.length === 0 ? (
          <div>No ended auctions found.</div>
        ) : (
          <ul className="space-y-3">
            {myAuctions.map((auction) => (
              <li
                key={auction._id}
                className="border p-3 rounded-lg shadow-sm bg-gray-50"
              >
                <h4 className="font-bold">{auction.title}</h4>
                <p className="text-sm text-gray-600">{auction.descripition}</p>
                <p className="text-sm text-gray-600">{auction.host_value}</p>
                <p className="text-sm text-gray-600">{auction.fee_charge}</p>
                <p className="text-sm text-gray-600">{auction.incoming_value}</p>
                <p className="text-xs text-gray-500">
                  Ended at: {new Date(auction.end_time).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Auction mình đã tham gia */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Joined Auctions</h3>
        {joinedAuctions.length === 0 ? (
          <div>No joined auctions found.</div>
        ) : (
          <ul className="space-y-3">
            {joinedAuctions.map((auction) => (
              <li
                key={auction._id}
                className="border p-3 rounded-lg shadow-sm bg-gray-50"
              >
                <h4 className="font-bold">{auction.title}</h4>
                <p className="text-sm text-gray-600">{auction.descripition}</p>
                <p className="text-xs text-gray-500">
                  Ends at: {new Date(auction.end_time).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Auction winners with detailed information */}
      <div>
        <h3 className="text-lg font-bold mb-2">Auction Winners</h3>
        {winners.length === 0 ? (
          <div>No winners found.</div>
        ) : (
          <ul className="space-y-3">
            {winners.map((item, index) => (
              <li
                key={index}
                className="border p-3 rounded-lg shadow-sm bg-gray-50"
              >
                <h4 className="font-bold">{item.auction_info.title}</h4>
                <p className="text-sm text-gray-600">
                  {item.auction_info.descripition}
                </p>
                <div className="mt-2">
                  <p className="font-semibold text-gray-800">Product Info:</p>
                  <div className="flex items-center space-x-2">
                    {item.productDetail && (
                      <img
                        src={buildImageUrl(item.productDetail.urlImage)}
                        alt={item.productDetail.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        Name: {item.productDetail?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Rarity: {item.productDetail?.rarityName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="font-semibold text-gray-800">Winner:</p>
                  <div className="flex items-center space-x-2">
                    {item.bidderProfile && (
                      <img
                        src={buildImageUrl(item.bidderProfile.profileImage)}
                        alt={item.bidderProfile.username}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        Username: {item.bidderProfile?.username}
                      </p>
                      <p className="text-sm text-gray-600">
                        Email: {item.bidderProfile?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="font-semibold text-gray-800">Host:</p>
                  <div className="flex items-center space-x-2">
                    {item.hosterProfile && (
                      <img
                        src={buildImageUrl(item.hosterProfile.profileImage)}
                        alt={item.hosterProfile.username}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        Username: {item.hosterProfile?.username}
                      </p>
                      <p className="text-sm text-gray-600">
                        Email: {item.hosterProfile?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Quantity: {item.auction_result.quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    Winning Bid: {item.auction_result.bidder_amount} VND
                  </p>
                  <p className="text-sm text-gray-600">
                    Host Claim: {item.auction_result.host_claim_amount} VND
                  </p>
                  <p className="text-xs text-gray-500">
                    Ended at:{" "}
                    {new Date(item.auction_info.end_time).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}