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
        // result.data là 2D array, bạn cần flatten nó
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

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>{error}</div>;
  if (auctionList.length === 0) return <div>Không có phiên đấu giá nào.</div>;

  return (
    <div>
      <h2>Danh sách phiên đấu giá của tôi</h2>
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

// Hàm hỗ trợ chuyển đổi trạng thái thành chữ dễ hiểu
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