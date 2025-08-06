import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getUserSale } from "../../../services/api.user";

export default function UserSaleReport() {
  const [byDay, setByDay] = useState([]);
  const [byMonth, setByMonth] = useState([]);
  const [byYear, setByYear] = useState([]);

  useEffect(() => {
    const fetchUserSale = async () => {
      try {
        const res = await getUserSale();
        const data = res.data;

        // Chuẩn hóa dữ liệu nếu cần
        const format = (arr) =>
          arr.map((item) => ({
            ...item,
            name: item.time, // để hiện trên trục X
          }));

        setByDay(format(data.byDay));
        setByMonth(format(data.byMonth));
        setByYear(format(data.byYear));
      } catch (err) {
        console.error("Failed to fetch user sale report:", err);
      }
    };

    fetchUserSale();
  }, []);

  const renderChart = (title, data, timeLabel) => (
  <div style={{ width: "100%", height: 350, marginBottom: 40 }}>
    <h3 style={{ textAlign: "center", marginBottom: 12 }}>{title}</h3>
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" label={{ value: timeLabel, position: "insideBottom", offset: -5 }} />
        <YAxis />
        <Tooltip
          formatter={(value, name) => {
            if (name === "Doanh thu") {
              return new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(value);
            }
            return value;
          }}
        />
        <Legend />
        {/* Thứ tự như bạn yêu cầu */}
        <Bar dataKey="orders" fill="#82ca9d" name="Số đơn hàng" />
        <Bar dataKey="productsSold" fill="#ffc658" name="Sản phẩm đã bán" />
        <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

  return (
    <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", paddingTop: 24 }}>
      {renderChart("📅 Thống kê theo ngày", byDay, "Ngày")}
      {renderChart("🗓️ Thống kê theo tháng", byMonth, "Tháng")}
      {renderChart("📈 Thống kê theo năm", byYear, "Năm")}
    </div>
  );
}
