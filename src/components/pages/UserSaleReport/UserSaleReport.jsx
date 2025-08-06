import React from "react";
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

const data = [
  {
    type: "byDay",
    totalRevenue: 500000,
    totalOrders: 20,
    totalProductsSold: 50,
  },
  {
    type: "byMonth",
    totalRevenue: 15000000,
    totalOrders: 120,
    totalProductsSold: 300,
  },
  {
    type: "byYear",
    totalRevenue: 200000000,
    totalOrders: 1800,
    totalProductsSold: 4500,
  },
];

export default function UserSaleReport() {
  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
      <h3 style={{ textAlign: "center", marginTop: 24 }}>📦 Đơn hàng & Sản phẩm</h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="type"
              tickFormatter={(value) => {
                switch (value) {
                  case "byDay":
                    return "By Day";
                  case "byMonth":
                    return "By Month";
                  case "byYear":
                    return "By Year";
                  default:
                    return value;
                }
              }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalOrders" fill="#82ca9d" name="Total Orders" />
            <Bar
              dataKey="totalProductsSold"
              fill="#ffc658"
              name="Products Sold"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3 style={{ textAlign: "center", marginTop: 48 }}>💰 Doanh thu</h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="type"
              tickFormatter={(value) => {
                switch (value) {
                  case "byDay":
                    return "By Day";
                  case "byMonth":
                    return "By Month";
                  case "byYear":
                    return "By Year";
                  default:
                    return value;
                }
              }}
            />
            <YAxis />
            <Tooltip
              formatter={(value) =>
                new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(value)
              }
            />
            <Legend />
            <Bar dataKey="totalRevenue" fill="#8884d8" name="Total Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
