import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import './ModeratorDashboard.css'; // <--- IMPORT FILE CSS

// Import các hàm API
import { getAllAuctionOfMod } from "../../../services/api.auction";
import { getAllReport } from "../../../services/api.report";
import { getAllWithdrawTransactionRequest } from "../../../services/api.transaction";
import { getAllProduct } from "../../../services/api.product";
import { getOtherProfile } from "../../../services/api.user";
import { buildImageUrl } from '../../../services/api.imageproxy';

// --- Icons (SVG Components) ---
const ClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const FlagIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>);
const ProductIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>);
const RefreshIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M20 4h-5v5M4 20h5v-5" /></svg>);

// --- UI Components ---

const ProfileAvatar = ({ report }) => {
  const [useBackupImg, setUseBackupImg] = useState(false);
  if (!report.profileImage) {
    return (
      <div className="avatar-placeholder">
        <span className="avatar-placeholder-text">{report.username?.charAt(0).toUpperCase()}</span>
      </div>
    );
  }
  return (
    <img
      className="h-9 w-9 rounded-full object-cover flex-shrink-0"
      src={buildImageUrl(report.profileImage, useBackupImg)}
      alt={report.username || 'Avatar'}
      onError={() => setUseBackupImg(true)}
    />
  );
};

const StatCard = ({ icon, title, count, borderColor }) => (
  // Dùng CSS variable để truyền màu động
  <div style={{ '--border-color': borderColor }} className="stat-card">
    <div className="flex items-center justify-between">
      <div>
        <p className="stat-card-title">{title}</p>
        <p className="stat-card-count">{count}</p>
      </div>
      <div className="stat-card-icon">{icon}</div>
    </div>
  </div>
);

const WithdrawalStatusChart = ({ data }) => {
  const chartData = [
    { name: 'Pending', value: data.pending }, { name: 'Successful', value: data.successful }, { name: 'Cancelled', value: data.cancelled },
  ];

  const PIE_COLORS = ['#f59e0b', '#10b981', '#d946ef'];

  return (
    <div className="chart-container h-[400px] flex flex-col">
      <h3 className="component-title">Withdrawal Requests</h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value">
              {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#181a20', border: '1px solid #334155' }} itemStyle={{ color: '#e2e8f0' }} />
            <Legend wrapperStyle={{ color: '#e2e8f0', fontSize: '14px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const PendingReportsTable = ({ reports }) => (
  <div className="table-container col-span-1 lg:col-span-2">
    <h3 className="component-title">Latest Pending Reports</h3>
    <div className="overflow-x-auto">
      <table className="reports-table">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Reported By</th>
            <th scope="col">Date</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr key={report.id}>
              <td className="title-cell" title={report.title}> {report.title} </td>
              <td>
                <div className="flex items-center space-x-3">
                  <ProfileAvatar report={report} />
                  <span className="font-medium text-[#e2e8f0]">{report.username || 'Unknown User'}</span>
                </div>
              </td>
              <td>{new Date(report.createdAt).toLocaleDateString()}</td>
              <td>
                <Link to="/moderatorReport" className="details-link">Details</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- Main Dashboard Component ---
export default function ModeratorDashboard() {
  const [stats, setStats] = useState({ /* ... state ... */ });
  const [pendingReportsData, setPendingReportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [auctionsRes, reportsRes, withdrawalsRes, productsRes] =
        await Promise.all([
          getAllAuctionOfMod(), getAllReport(), getAllWithdrawTransactionRequest(), getAllProduct(),
        ]);

      const reports = reportsRes?.data || [];
      const pendingReports = reports.filter(r => r.status === false);

      pendingReports.reverse();
      const top5PendingReports = pendingReports.slice(0, 5);
      const enrichedReports = await Promise.all(
        top5PendingReports.map(async (report) => {
          try {
            const profileRes = await getOtherProfile(report.userId);
            if (profileRes && profileRes.status) {
              return { ...report, username: profileRes.data.username, profileImage: profileRes.data.profileImage };
            }
          } catch (e) { console.error(`Failed to fetch profile for user ${report.userId}`, e); }
          return { ...report, username: 'Unknown User' };
        })
      );
      setPendingReportsData(enrichedReports);

      const pendingAuctions = auctionsRes?.data?.filter(a => a.status === 0).length || 0;
      const withdrawals = withdrawalsRes?.data || [];
      const successfulWithdrawals = withdrawals.filter(tx => tx.status === "Success").length;
      const pendingWithdrawals = withdrawals.filter(tx => tx.status === "Pending").length;
      const cancelledWithdrawals = withdrawals.filter(tx => tx.status === "Cancel").length;
      const products = productsRes?.data || [];
      const activeProducts = products.filter(p => p.is_Block === false).length;
      const blockedProducts = products.filter(p => p.is_Block === true).length;

      setStats({
        pendingAuctions, pendingReports: pendingReports.length,
        successfulWithdrawals, pendingWithdrawals, cancelledWithdrawals,
        activeProducts, blockedProducts,
      });
      setLastUpdated(new Date());

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !lastUpdated) {
    return (
      <div className="dashboard-container flex items-center justify-center h-screen text-xl">
        <p className="text-[#e2e8f0]">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Moderator Dashboard</h1>
          <p className="dashboard-subtitle">{lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : "Welcome back!"}</p>
        </div>
        <button onClick={fetchDashboardData} disabled={loading} className="refresh-button">
          <RefreshIcon />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </header>

      <main className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<ClockIcon />} title="Pending Auctions" count={stats.pendingAuctions} borderColor="#f59e0b" />
          <StatCard icon={<FlagIcon />} title="Pending Reports" count={stats.pendingReports} borderColor="#ef4444" />
          <StatCard icon={<ProductIcon />} title="Active Products" count={stats.activeProducts} borderColor="#10b981" />
          <StatCard icon={<ProductIcon />} title="Blocked Products" count={stats.blockedProducts} borderColor="#475569" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <WithdrawalStatusChart data={{
            pending: stats.pendingWithdrawals,
            successful: stats.successfulWithdrawals,
            cancelled: stats.cancelledWithdrawals,
          }} />
          <PendingReportsTable reports={pendingReportsData} />
        </div>
      </main>
    </div>
  );
}