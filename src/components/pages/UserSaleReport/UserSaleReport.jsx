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
  LineChart,
  Line,
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

        const format = (arr) =>
          arr.map((item) => ({
            ...item,
            name: item.time,
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

  const renderBarChart = (title, data, timeLabel) => (
    <div style={{ width: "100%", height: 300, marginBottom: 30 }}>
      <h3 style={{ textAlign: "center", marginBottom: 12 }}>{title} - Đơn hàng & Sản phẩm</h3>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" label={{ value: timeLabel, position: "insideBottom", offset: -5 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="orders" fill="#82ca9d" name="Số đơn hàng" />
          <Bar dataKey="productsSold" fill="#ffc658" name="Sản phẩm đã bán" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderLineChart = (title, data, timeLabel) => (
    <div style={{ width: "100%", height: 300, marginBottom: 50 }}>
      <h3 style={{ textAlign: "center", marginBottom: 12 }}>{title} - Doanh thu</h3>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" label={{ value: timeLabel, position: "insideBottom", offset: -5 }} />
          <YAxis />
          <Tooltip
            formatter={(value, name) => {
              return new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(value);
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#8884d8"
            name="Doanh thu"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", paddingTop: 24, display: "flex", gap: "20px", flexDirection: "column" }}>
      {/* Theo ngày */}
      {renderBarChart("📅 Thống kê theo ngày", byDay, "Ngày")}
      {renderLineChart("📅 Thống kê theo ngày", byDay, "Ngày")}

      {/* Theo tháng */}
      {renderBarChart("🗓️ Thống kê theo tháng", byMonth, "Tháng")}
      {renderLineChart("🗓️ Thống kê theo tháng", byMonth, "Tháng")}

      {/* Theo năm */}
      {renderBarChart("📈 Thống kê theo năm", byYear, "Năm")}
      {renderLineChart("📈 Thống kê theo năm", byYear, "Năm")}
    </div>
  );
}
