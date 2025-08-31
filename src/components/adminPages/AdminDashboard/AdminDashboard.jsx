import React, { useEffect, useState } from "react";
import {
  getDashboardUserStats,
  getDashboardAuctionStats,
} from "../../../services/api.admin";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar,
} from "recharts";

export default function AdminDashboard() {
  const [userStats, setUserStats] = useState(null);
  const [auctionStats, setAuctionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ["#06b6d4", "#ec4899", "#f59e0b", "#10b981"]; // cyan, pink, amber, green

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [userRes, auctionRes] = await Promise.all([
          getDashboardUserStats(),
          getDashboardAuctionStats(),
        ]);
        setUserStats(userRes.data?.[0] || null);
        setAuctionStats(auctionRes.data?.[0] || null);
      } catch {
        setError("Error while fetching statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ color: "#fff" }}>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  const userData = userStats
    ? [
      { name: "Total User", value: userStats.total_user },
      { name: "Moderator", value: userStats.total_moderator },
      { name: "Active", value: userStats.total_active_user },
      { name: "Banned", value: userStats.total_inactive_user },
    ]
    : [];



  // const auctionTotalData = auctionStats
  //   ? [
  //     { name: "Total Auction", value: auctionStats.total_auction, fill: COLORS[0] },
  //   ]
  //   : [];

  const auctionBreakdownData = auctionStats
    ? [
      { name: "Approved", value: auctionStats.total_approved_auction, fill: COLORS[1] },
      { name: "Denied", value: auctionStats.total_denied_auction, fill: COLORS[2] },
      { name: "Pending", value: auctionStats.total_pending_auction, fill: COLORS[3] },
    ]
    : [];

  // Custom label để hiện số trực tiếp trên chart
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
      >
        {value}
      </text>
    );
  };
  return (
    <div style={{ color: "#fff" }}>
      <h2 className="text-xl font-bold mb-4">System Statistics</h2>
      <div style={{ display: "flex", gap: 32 }}>
        {/* User Stats */}
        <div
          style={{
            flex: 1,
            background: "#1e1e2d",
            padding: 24,
            borderRadius: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          }}
        >
          <h3 className="mb-4">User Statistics</h3>
          {userData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={userData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />

                <Bar dataKey="value" barSize={30}>
                  {userData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div>No user data</div>
          )}
        </div>
        {/* Auction Breakdown (Approved/Denied/Pending) */}
        <div
          style={{
            flex: 1,
            background: "#1e1e2d",
            padding: 24,
            borderRadius: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          }}
        >
          <h3 className="mb-4">Auction Breakdown</h3>
          {auctionBreakdownData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={auctionBreakdownData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={renderLabel}
                >
                  {auctionBreakdownData.map((entry, index) => (
                    <Cell key={`cell-breakdown-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div>No auction breakdown data</div>
          )}
        </div>
      </div>
    </div>
  );
}
