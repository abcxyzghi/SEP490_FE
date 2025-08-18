import React, { useEffect, useState } from "react";
import { fetchMyAuctionList, fetchJoinedAuctionList } from "../../../services/api.auction";

export default function AuctionHistoryList() {
  const [myAuctions, setMyAuctions] = useState([]);
  const [joinedAuctions, setJoinedAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuctions = async () => {
      try {
        // Fetch danh sách mình tạo
        const resMy = await fetchMyAuctionList();
        const myData = resMy.data;
        const now = new Date();
        const endedMyAuctions = myData.filter((auction) => {
          const endTime = new Date(auction.end_time);
          return endTime < now;
        });
        setMyAuctions(endedMyAuctions);

        // Fetch danh sách mình đã tham gia
        const resJoined = await fetchJoinedAuctionList();
        const joinedData = resJoined.data;
        setJoinedAuctions(joinedData);
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
      <div>
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
    </div>
  );
}
