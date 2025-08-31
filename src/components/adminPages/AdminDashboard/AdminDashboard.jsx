
import React, { useEffect, useState } from 'react';
import { getDashboardUserStats, getDashboardAuctionStats } from '../../../services/api.admin';

export default function AdminDashboard() {
  const [userStats, setUserStats] = useState(null);
  const [auctionStats, setAuctionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [userRes, auctionRes] = await Promise.all([
          getDashboardUserStats(),
          getDashboardAuctionStats()
        ]);
        setUserStats(userRes.data?.[0] || null);
        setAuctionStats(auctionRes.data?.[0] || null);
      } catch {
        setError('Lỗi khi lấy dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Đang tải thống kê...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Thống kê hệ thống</h2>
      <div style={{ display: 'flex', gap: 32 }}>
        {/* User Stats Chart */}
        <div style={{ flex: 1, background: '#f5f5f5', padding: 24, borderRadius: 8 }}>
          <h3>Thống kê User</h3>
          {userStats ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Tổng user</td>
                  <td style={{ padding: '8px' }}>{userStats.total_user}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Tổng moderator</td>
                  <td style={{ padding: '8px' }}>{userStats.total_moderator}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>User hoạt động</td>
                  <td style={{ padding: '8px' }}>{userStats.total_active_user}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>User bị khóa</td>
                  <td style={{ padding: '8px' }}>{userStats.total_inactive_user}</td>
                </tr>
              </tbody>
            </table>
          ) : <div>Không có dữ liệu user</div>}
        </div>

        {/* Auction Stats Chart */}
        <div style={{ flex: 1, background: '#f5f5f5', padding: 24, borderRadius: 8 }}>
          <h3>Thống kê Auction</h3>
          {auctionStats ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Tổng auction</td>
                  <td style={{ padding: '8px' }}>{auctionStats.total_auction}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Auction đã duyệt</td>
                  <td style={{ padding: '8px' }}>{auctionStats.total_approved_auction}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Auction bị từ chối</td>
                  <td style={{ padding: '8px' }}>{auctionStats.total_denied_auction}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Auction chờ duyệt</td>
                  <td style={{ padding: '8px' }}>{auctionStats.total_pending_auction}</td>
                </tr>
              </tbody>
            </table>
          ) : <div>Không có dữ liệu auction</div>}
        </div>
      </div>
    </div>
  );
}
