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
import "./UserSaleReport.css";
import { getUserSale } from "../../../services/api.user";

export default function UserSaleReport() {
  const [activeTab, setActiveTab] = useState("day");
  const [byDay, setByDay] = useState([]);
  const [byMonth, setByMonth] = useState([]);
  const [byYear, setByYear] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
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
        setTopProducts(data.topProducts);
      } catch (err) {
        console.error("Failed to fetch user sale report:", err);
      }
    };

    fetchUserSale();
  }, []);
  

  const renderBarChart = (title, data, timeLabel) => (
    <div className="chart-container bar-chart">
      <h3 className="chart-title">{title} - Đơn hàng & Sản phẩm</h3>
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
    <div className="chart-container line-chart">
      <h3 className="chart-title">{title} - Doanh thu</h3>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" label={{ value: timeLabel, position: "insideBottom", offset: -5 }} />
          <YAxis />
          <Tooltip formatter={(value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)} />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Doanh thu" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
  const renderTopProductsChart = (data) => (
  <div className="chart-container top-products-chart">
    <h3 className="chart-title">🔥 Top sản phẩm bán chạy</h3>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 90 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="productName"
          angle={-25}
          textAnchor="end"
          interval={0}
          height={100}
        />
        <YAxis yAxisId="left" />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) =>
            new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)
          }
        />
        <Tooltip
          formatter={(value, name) =>
            name === "Doanh thu"
              ? new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(value)
              : value
          }
        />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="totalSold"
          fill="#82ca9d"
          name="Số lượng đã bán"
        />
        <Bar
          yAxisId="right"
          dataKey="totalRevenue"
          fill="#8884d8"
          name="Doanh thu"
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
  return (
    <div className="statistics-wrapper">
      <div className="tab-buttons-chart">
        <button
          className={activeTab === "day" ? "active" : ""}
          onClick={() => setActiveTab("day")}
        >
          📅 Ngày
        </button>
        <button
          className={activeTab === "month" ? "active" : ""}
          onClick={() => setActiveTab("month")}
        >
          🗓️ Tháng
        </button>
        <button
          className={activeTab === "year" ? "active" : ""}
          onClick={() => setActiveTab("year")}
        >
          📈 Năm
        </button>
        <button
    className={activeTab === "top" ? "active" : ""}
    onClick={() => setActiveTab("top")}
  >
    🔥 Top Sản Phẩm
  </button>
      </div>

      {activeTab === "day" && (
        <>
          {renderBarChart("📅 Thống kê theo ngày", byDay)}
          {renderLineChart("📅 Thống kê theo ngày", byDay)}
        </>
      )}

      {activeTab === "month" && (
        <>
          {renderBarChart("🗓️ Thống kê theo tháng", byMonth)}
          {renderLineChart("🗓️ Thống kê theo tháng", byMonth)}
        </>
      )}

      {activeTab === "year" && (
        <>
          {renderBarChart("📈 Thống kê theo năm", byYear)}
          {renderLineChart("📈 Thống kê theo năm", byYear)}
        </>
      )}
   
      {activeTab === "top" && renderTopProductsChart(topProducts)}
    </div>
  );

}
