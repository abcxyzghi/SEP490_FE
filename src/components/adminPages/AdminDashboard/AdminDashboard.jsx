import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, XAxis, YAxis, Bar,
  LineChart, Line, CartesianGrid
} from "recharts";
import moment from "moment";
import { getDashboardUserStats, getDashboardAuctionStats, getAllTransaction, getAllTransactionFee } from "../../../services/api.admin";
import "./AdminDashboard.css";

// --- Components ---
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);
  return (
    <div className="admindashboard-live-clock">
      {time.toLocaleDateString('en-GB')} | {time.toLocaleTimeString('en-US')}
    </div>
  );
};

const StatCard = ({ title, value, unit, color }) => (
  <div className="admindashboard-card">
    <div className="admindashboard-card-content">
      <h4 className="admindashboard-card-title">{title}</h4>
      <p className="admindashboard-card-value" style={{ color }}>
        {value.toLocaleString()} {unit}
      </p>
    </div>
  </div>
);

const RecentActivity = ({ transactions, fees }) => {
  const [activeTab, setActiveTab] = useState('transactions');
  const recentTransactions = transactions.filter(tx => tx.status?.toLowerCase() === 'success').slice(0, 5);
  const recentFees = fees.slice(0, 5);

  return (
    <div className="admindashboard-chart-container">
      <div className="admindashboard-chart-header">
        <h3 className="admindashboard-chart-title">Recent Activity</h3>
        <div className="admindashboard-filter-group">
          <button onClick={() => setActiveTab('transactions')} className={`admindashboard-filter-btn ${activeTab === 'transactions' ? 'active' : ''}`}>Transactions</button>
          <button onClick={() => setActiveTab('fees')} className={`admindashboard-filter-btn ${activeTab === 'fees' ? 'active' : ''}`}>Fees</button>
        </div>
      </div>
      <table className="admindashboard-recent-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {(activeTab === 'transactions' ? recentTransactions : recentFees).map((item, index) => (
            <tr key={index}>
              <td>{item.username}</td>
              <td>
                <span className={`admindashboard-tag ${activeTab === 'transactions' ? (item.type?.toLowerCase().includes('recharge') ? 'deposit' : 'withdraw') : 'fee'}`}>
                  {item.type}
                </span>
              </td>
              <td style={{ fontWeight: 'bold', color: activeTab === 'fees' ? '#3498db' : (item.type?.toLowerCase().includes('recharge') ? '#56ab2f' : '#ff4b2b') }}>
                {(item.amount ?? item.feeAmount)?.toLocaleString()} VND
              </td>
              <td>{moment(item.dataTime || item.createdAt).format('DD/MM/YYYY HH:mm')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="admindashboard-custom-tooltip">
        <p className="admindashboard-tooltip-label">{label}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.color, margin: 0, fontSize: '14px' }}>
            {`${pld.name}: ${pld.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- Main Dashboard Component ---
export default function AdminDashboard() {
  const [userStats, setUserStats] = useState(null);
  const [auctionStats, setAuctionStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('day');

  const COLORS = ["#06b6d4", "#ec4899", "#f59e0b", "#10b981"];

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRes, auctionRes, transactionRes, feeRes] = await Promise.all([
        getDashboardUserStats(), getDashboardAuctionStats(), getAllTransaction(), getAllTransactionFee()
      ]);
      setUserStats(userRes.data?.[0] || null);
      setAuctionStats(auctionRes.data?.[0] || null);

      const allTx = (transactionRes.data || []).flatMap(u => (u.transactions || []).map(tx => ({ ...tx, username: u.username })));
      allTx.sort((a, b) => new Date(b.dataTime) - new Date(a.dataTime));
      setTransactions(allTx);

      const allFees = (feeRes.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFees(allFees);
    } catch {
      setError("Error while fetching statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const financialSummary = useMemo(() => {
    const successfulTx = Array.isArray(transactions) ? transactions.filter(tx => tx.status?.toLowerCase() === 'success') : [];

    // FINAL CHANGE: Calculate net flow (deposits - withdrawals)
    const totalDeposits = successfulTx.reduce((acc, tx) => (tx.type?.toLowerCase().includes('recharge') || tx.type?.toLowerCase().includes('deposit')) ? acc + tx.amount : acc, 0);
    const totalWithdrawals = successfulTx.reduce((acc, tx) => tx.type?.toLowerCase().includes('withdraw') ? acc + tx.amount : acc, 0);
    const netUserFundFlow = totalDeposits - totalWithdrawals;

    const totalFees = Array.isArray(fees) ? fees.reduce((acc, fee) => acc + fee.feeAmount, 0) : 0;
    const validFees = Array.isArray(fees) ? fees : [];

    return {
      totalFees,
      successfulTxCount: successfulTx.length,
      netUserFundFlow,
      averageFee: validFees.length > 0 ? (totalFees / validFees.length) : 0,
    };
  }, [transactions, fees]);

  const userData = useMemo(() => userStats ? [{ name: "Total", value: userStats.total_user }, { name: "Mod", value: userStats.total_moderator }, { name: "Active", value: userStats.total_active_user }, { name: "Banned", value: userStats.total_inactive_user },] : [], [userStats]);
  const auctionBreakdownData = useMemo(() => auctionStats ? [{ name: "Approved", value: auctionStats.total_approved_auction, fill: COLORS[1] }, { name: "Denied", value: auctionStats.total_denied_auction, fill: COLORS[2] }, { name: "Pending", value: auctionStats.total_pending_auction, fill: COLORS[3] },] : [], [auctionStats]);
  const processDataForChart = (data, dateKey, amountKey) => { const format = timeFilter === 'day' ? 'YYYY-MM-DD' : timeFilter === 'month' ? 'YYYY-MM' : 'YYYY'; const groupedData = data.reduce((acc, item) => { const date = moment(item[dateKey]).format(format); if (!acc[date]) acc[date] = 0; acc[date] += item[amountKey]; return acc; }, {}); return Object.keys(groupedData).map(date => ({ date, amount: groupedData[date] })).sort((a, b) => new Date(a.date) - new Date(b.date)); };
  const userDepositChartData = useMemo(() => { const successfulDeposits = transactions.filter(tx => tx.status?.toLowerCase() === 'success' && (tx.type?.toLowerCase().includes('recharge') || tx.type?.toLowerCase().includes('deposit'))); return processDataForChart(successfulDeposits, 'dataTime', 'amount'); }, [transactions, timeFilter]);
  const feeChartData = useMemo(() => processDataForChart(fees, 'createdAt', 'feeAmount'), [fees, timeFilter]);

  if (loading && transactions.length === 0) return <div className="admindashboard-status">Loading Dashboard...</div>;
  if (error) return <div className="admindashboard-status error">{error}</div>;

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => { if (value === 0) return null; const radius = innerRadius + (outerRadius - innerRadius) / 2; const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180)); const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180)); return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">{value}</text>; };

  return (
    <div className="admindashboard-container">
      <div className="admindashboard-header">
        <h2 className="admindashboard-title">System Dashboard</h2>
        <div className="admindashboard-header-controls">
          <LiveClock />
          <button className="admindashboard-refresh-btn" onClick={fetchStats} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* FINAL CHANGE: All text translated to English, units unified */}
      <div className="admindashboard-grid summary">
        <StatCard title="System Revenue (Fees)" value={financialSummary.totalFees} unit="VND" color="#3498db" />
        <StatCard title="Net User Fund Flow" value={financialSummary.netUserFundFlow} unit="VND" color={financialSummary.netUserFundFlow >= 0 ? "#56ab2f" : "#ff4b2b"} />
        <StatCard title="Successful Transactions" value={financialSummary.successfulTxCount} unit="Transactions" color="#f59e0b" />
        <StatCard title="Average Fee" value={Math.round(financialSummary.averageFee)} unit="VND" color="#ec4899" />
      </div>

      <div className="admindashboard-grid">
        <div className="admindashboard-chart-container">
          <h3 className="admindashboard-chart-title">User Statistics</h3>
          <ResponsiveContainer width="100%" height={300}><BarChart data={userData} layout="vertical" margin={{ left: 10, right: 30 }}><XAxis type="number" stroke="#888" /><YAxis dataKey="name" type="category" stroke="#888" width={80} /><Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} content={<CustomTooltip />} /><Bar dataKey="value" barSize={30}>{userData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer>
        </div>
        <div className="admindashboard-chart-container">
          <h3 className="admindashboard-chart-title">Auction Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={auctionBreakdownData} cx="50%" cy="50%" outerRadius={110} dataKey="value" labelLine={false} label={renderLabel}>{auctionBreakdownData.map((entry, index) => <Cell key={`cell-breakdown-${index}`} fill={entry.fill} />)}</Pie><Tooltip content={<CustomTooltip />} /><Legend /></PieChart></ResponsiveContainer>
        </div>
      </div>

      <div className="admindashboard-grid full-width">
        <RecentActivity transactions={transactions} fees={fees} />
      </div>

      <div className="admindashboard-chart-container">
        <div className="admindashboard-chart-header">
          <h3 className="admindashboard-chart-title">Financial Overview</h3>
          <div className="admindashboard-filter-group">
            <button onClick={() => setTimeFilter('day')} className={`admindashboard-filter-btn ${timeFilter === 'day' ? 'active' : ''}`}>Day</button>
            <button onClick={() => setTimeFilter('month')} className={`admindashboard-filter-btn ${timeFilter === 'month' ? 'active' : ''}`}>Month</button>
            <button onClick={() => setTimeFilter('year')} className={`admindashboard-filter-btn ${timeFilter === 'year' ? 'active' : ''}`}>Year</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}><LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#444" /><XAxis dataKey="date" stroke="#888" /><YAxis stroke="#888" tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} /><Tooltip content={<CustomTooltip />} /><Legend /><Line type="monotone" data={userDepositChartData} dataKey="amount" name="User Deposits" stroke="#56ab2f" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} /><Line type="monotone" data={feeChartData} dataKey="amount" name="Fee Revenue" stroke="#3498db" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer>
      </div>
    </div>
  );
}