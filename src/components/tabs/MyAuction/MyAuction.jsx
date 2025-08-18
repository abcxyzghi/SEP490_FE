import React, { useEffect, useState } from "react";
import { fetchMyAuctionList } from "../../../services/api.auction";

export default function MyAuction() {
  const [auctionList, setAuctionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchMyAuctionList();
        const flattenedData = result.data.flat();
        setAuctionList(flattenedData);
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải danh sách phiên đấu giá.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
       Loading
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 bg-gray-900">
        {error}
      </div>
    );

  if (auctionList.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300 bg-gray-900">
        No auction
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 text-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">My auction list</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {auctionList.map((auction) => (
            <li
              key={auction._id}
              className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold">{auction.title}</h3>
              <p className="mt-1 text-sm text-gray-300">{auction.descripition}</p>
              <p className="text-sm text-gray-600">{auction.host_value}</p>
              <p className="text-sm text-gray-600">{auction.fee_charge}</p>
              <p className="text-sm text-gray-600">{auction.incoming_value}</p>
              <div className="mt-3 text-sm text-gray-300 space-y-1">
                <p>
                  <span className="font-medium text-gray-200">Start:</span> {" "}
                  {new Date(auction.start_time).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium text-gray-200">End time:</span> {" "}
                  {new Date(auction.end_time).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium text-gray-200">Status:</span> {" "}
                  <StatusBadge status={auction.status} />
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const { label, classes } = getStatusLabelAndClass(status);
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${classes}`}
    >
      {label}
    </span>
  );
}

function getStatusLabelAndClass(status) {
  switch (status) {
    case 0:
      return {
        label: "Waiting",
        classes: "bg-yellow-500/20 text-yellow-200 border-yellow-600",
      };
    case 1:
      return {
        label: "On going",
        classes: "bg-green-600/20 text-green-200 border-green-500",
      };
    case -1:
      return {
        label: "Rejected",
        classes: "bg-gray-600/20 text-gray-200 border-gray-500",
      };
    default:
      return {
        label: "Unidentified",
        classes: "bg-gray-600/20 text-gray-200 border-gray-500",
      };
  }
}