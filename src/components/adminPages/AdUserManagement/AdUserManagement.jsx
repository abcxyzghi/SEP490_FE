import React, { useEffect, useState } from 'react';
import { getAllUsers, getAllModerators, promoteToModerator, demoteModerator, toggleUserActivation } from '../../../services/api.admin';
import "./AdUserManagement.css";
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
      console.log(res.data)
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
      setData((prev) =>
        prev.filter((u) => u._id !== userId)
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle lock/unlock user
  const handleToggleLock = async (userId) => {
    setActionLoading(userId);
    try {
      await toggleUserActivation(userId);
      setData((prevData) =>
        prevData.map((user) =>
          user._id === userId ? { ...user, is_active: !user.is_active } : user
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Demote moderator to user
  const handleDemote = async (userId) => {
    setActionLoading(userId);
    try {
      await demoteModerator(userId);
      setData((prev) =>
        prev.filter((u) => u._id !== userId)
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="aduser-container">
      <div className="aduser-tabButtons">
        <button
          onClick={() => setTab("user")}
          className={`aduser-tabButton ${tab === "user" ? "active" : ""}`}
        >
          User
        </button>
        <button
          onClick={() => setTab("moderator")}
          className={`aduser-tabButton ${tab === "moderator" ? "active" : ""}`}
        >
          Moderator
        </button>
      </div>

      <h2 className="aduser-title">
        Danh sách {tab === "user" ? "User" : "Moderator"}
      </h2>

      {loading ? (
        <div className="aduser-status">Đang tải...</div>
      ) : error ? (
        <div className="aduser-status">{error}</div>
      ) : (
        <table className="aduser-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.role_id}</td>
                <td>{user.is_active ? "Hoạt động" : "Bị khóa"}</td>
                <td>
                  {tab === "user" ? (
                    <>
                      <button
                        onClick={() => handlePromote(user._id)}
                        disabled={actionLoading === user._id}
                        className="aduser-actionBtn aduser-promoteBtn"
                      >
                        Promote
                      </button>
                      <button
                        onClick={() => handleToggleLock(user._id)}
                        disabled={actionLoading === user._id}
                        className={`aduser-actionBtn ${user.is_active
                          ? "aduser-lockBtn"
                          : "aduser-unlockBtn"
                          }`}
                      >
                        {user.is_active ? "Lock" : "Unlock"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDemote(user._id)}
                      disabled={actionLoading === user._id}
                      className="aduser-actionBtn aduser-demoteBtn"
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
