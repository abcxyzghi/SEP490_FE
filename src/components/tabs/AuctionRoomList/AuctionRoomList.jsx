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
        console.log("API fetchAuctionList:", result);
        setAuctionList(result);
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải danh sách phòng đấu giá.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [statusFilter]);

  if (loading) return <div>Đang tải danh sách phòng đấu giá...</div>;
  if (error) return <div>{error}</div>;
  if (auctionList.data?.error_code !== 0) return <div>Hiện không có phòng đấu giá nào.</div>;

  return (
    <div>
      <h2>Danh sách phòng đấu giá</h2>

      {/* Chọn filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        style={{ marginBottom: "10px" }}
      >
        <option value="default">Tất cả</option>
        <option value="started">Đang diễn ra</option>
        <option value="waiting">Sắp diễn ra</option>
      </select>

      <ul>
        {auctionList.data.data.map((auction) => (
          <li key={auction.id}>
            <strong>{auction.title}</strong>
            <p>{auction.descripition}</p>
            <p>Bắt đầu: {new Date(auction.start_time).toLocaleString()}</p>
            <p>Kết thúc: {new Date(auction.end_time).toLocaleString()}</p>
            <p>Trạng thái: {getStatusLabel(auction.status)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getStatusLabel(status) {
  switch (status) {
    case 0:
      return "Đang chờ";
    case 1:
      return "Đang diễn ra";
    case 2:
      return "Đã kết thúc";
    default:
      return "Không xác định";
  }
}
