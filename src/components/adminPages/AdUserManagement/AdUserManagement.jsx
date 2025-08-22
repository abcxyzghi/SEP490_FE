


import React, { useEffect, useState } from 'react';
import { getAllUsers, getAllModerators, promoteToModerator, demoteModerator, toggleUserActivation } from '../../../services/api.admin';

export default function AdUserManagement() {
  const [tab, setTab] = useState('user'); // 'user' or 'moderator'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionLoading, setActionLoading] = useState(null); // userId đang thao tác

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (tab === 'user') {
        res = await getAllUsers();
      } else {
        res = await getAllModerators();
      }
      setData(res.data || []);
    } catch {
      setError('Lỗi khi lấy danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [tab]);

  // Promote user to moderator
  const handlePromote = async (userId) => {
    setActionLoading(userId);
    try {
      await promoteToModerator(userId);
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle lock/unlock user
  const handleToggleLock = async (userId) => {
    setActionLoading(userId);
    try {
      await toggleUserActivation(userId);
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  // Demote moderator to user
  const handleDemote = async (userId) => {
    setActionLoading(userId);
    try {
      await demoteModerator(userId);
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setTab('user')}
          style={{
            padding: '8px 16px',
            marginRight: 8,
            background: tab === 'user' ? '#1976d2' : '#eee',
            color: tab === 'user' ? '#fff' : '#333',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          User
        </button>
        <button
          onClick={() => setTab('moderator')}
          style={{
            padding: '8px 16px',
            background: tab === 'moderator' ? '#1976d2' : '#eee',
            color: tab === 'moderator' ? '#fff' : '#333',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Moderator
        </button>
      </div>
      <h2>Danh sách {tab === 'user' ? 'User' : 'Moderator'}</h2>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Username</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Role</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Trạng thái</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.map(user => (
              <tr key={user._id}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{user.username}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{user.role_id}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{user.is_active ? 'Hoạt động' : 'Bị khóa'}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px', minWidth: 180 }}>
                  {tab === 'user' ? (
                    <>
                      <button
                        onClick={() => handlePromote(user._id)}
                        disabled={actionLoading === user._id}
                        style={{ marginRight: 8, padding: '4px 12px', background: '#43a047', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                      >
                        Promote
                      </button>
                      <button
                        onClick={() => handleToggleLock(user._id)}
                        disabled={actionLoading === user._id}
                        style={{ padding: '4px 12px', background: user.is_active ? '#e53935' : '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                      >
                        {user.is_active ? 'Lock' : 'Unlock'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDemote(user._id)}
                      disabled={actionLoading === user._id}
                      style={{ padding: '4px 12px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                    >
                      Demote
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
