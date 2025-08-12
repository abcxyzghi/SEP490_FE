import React, { useEffect, useState } from "react";
import { fetchAuctionList } from "../../../services/api.auction";

export default function AuctionRoomList() {
  const [auctionList, setAuctionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("started"); // default: đang diễn ra

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchAuctionList(statusFilter);
        // console.log("API fetchAuctionList:", result);
        setAuctionList(result || []);
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải danh sách phòng đấu giá.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [statusFilter]);

  // helpers
  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return "-";
    }
  };

  const auctions = auctionList?.data?.data || [];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Auction Room List</h2>

          <div className="flex items-center gap-3">
            <label className="text-sm whitespace-nowrap">Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="default">All</option>
              <option value="started">On going</option>
              <option value="waiting">Waiting</option>
            </select>
          </div>
        </header>

        {/* loading */}
        {loading && (
          <div className="flex items-center gap-3 text-gray-200">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            <span>Loading auction rooms...</span>
          </div>
        )}

        {/* error */}
        {error && !loading && (
          <div className="mt-4 bg-red-700/20 border border-red-600 text-red-50 p-4 rounded">
            {error}
          </div>
        )}

        {/* empty / api-error-code */}
        {!loading && !error && auctionList?.data?.error_code !== 0 && (
          <div className="mt-6 text-gray-300">No auction room available.</div>
        )}

        {/* list */}
        {!loading && !error && auctions.length > 0 && (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {auctions.map((auction) => (
              <li
                key={auction.id}
                className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{auction.title}</h3>
                    <p className="mt-1 text-sm text-gray-300">{auction.descripition}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={auction.status} />
                    <div className="text-xs text-gray-300">ID: {auction.id}</div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-300">
                  <div>
                    <div className="font-medium text-gray-200">Start</div>
                    <div>{formatDate(auction.start_time)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-200">End</div>
                    <div>{formatDate(auction.end_time)}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-300">{auction.current_bid ? `Giá hiện tại: ${auction.current_bid}` : "Chưa có giá"}</div>
                  <button className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm">View detail</button>
                </div>
              </li>
            ))}
          </ul>
        )}
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
      return { label: "Wating", classes: "bg-yellow-500/20 text-yellow-200 border border-yellow-600" };
    case 1:
      return { label: "On going", classes: "bg-green-600/20 text-green-200 border border-green-500" };
    case -1:
      return { label: "Rejected", classes: "bg-gray-600/20 text-gray-200 border border-gray-500" };
    default:
      return { label: "Unidentified", classes: "bg-gray-600/20 text-gray-200 border border-gray-500" };
  }
}
