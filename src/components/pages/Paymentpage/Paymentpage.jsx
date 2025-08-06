import React, { useState } from "react";
import "./Paymentpage.css";
import { createPayment } from "../../../services/api.payOS";


export default function Paymentpage() {
  const [selectedPrice, setSelectedPrice] = useState(5000);
  const [loading, setLoading] = useState(false);

  const handleTopUp = async () => {
    setLoading(true);
    try {
      const result = await createPayment([
        {
          name: `${selectedPrice / 1000}k`,
          price: selectedPrice,
        },
      ]);

      if (result?.status && result.data?.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      } else {
        alert("Lỗi khi tạo thanh toán!");
      }
    } catch (error) {
      console.error("❌ Lỗi nạp tiền:", error);
      alert("Có lỗi xảy ra khi nạp tiền.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <h2 className="title">Chọn gói nạp tiền</h2>

      <select
        value={selectedPrice}
        onChange={(e) => setSelectedPrice(parseInt(e.target.value))}
        className="select"
      >
        <option value={5000}>5k</option>
        <option value={10000}>10k</option>
        <option value={20000}>20k</option>
      </select>

      <button
        onClick={handleTopUp}
        disabled={loading}
        className="button"
      >
        {loading ? "Đang xử lý..." : "Nạp tiền"}
      </button>
    </div>

  );
}
