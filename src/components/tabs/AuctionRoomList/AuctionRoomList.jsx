import React, { useEffect, useState } from "react";
import { fetchAuctionList } from "../../../services/api.auction";

export default function AuctionRoomList() {
  const [auctionList, setAuctionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchAuctionList();
        setAuctionList(result.data); // result.data là mảng 1 chiều
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải danh sách phòng đấu giá.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Đang tải danh sách phòng đấu giá...</div>;
  if (error) return <div>{error}</div>;
  if (auctionList.length === 0) return <div>Hiện không có phòng đấu giá nào.</div>;

  return (
    <div>
      <h2>Danh sách phòng đấu giá</h2>
      <ul>
        {auctionList.map((auction) => (
          <li key={auction._id}>
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

// Hàm chuyển đổi trạng thái
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
