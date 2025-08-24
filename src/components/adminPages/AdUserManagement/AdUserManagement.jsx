import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getAllUsers, getAllModerators, promoteToModerator, demoteModerator, toggleUserActivation } from '../../../services/api.admin';
import "./AdUserManagement.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="aduser-pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>&laquo; Previous</button>
      {pages.map((page) => (<button key={page} onClick={() => onPageChange(page)} className={currentPage === page ? "active" : ""}>{page}</button>))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={totalPages === currentPage}>Next &raquo;</button>
    </div>
  );
};

export default function AdUserManagement() {
  const [tab, setTab] = useState('user');
  const [allUsers, setAllUsers] = useState([]);
  const [allModerators, setAllModerators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchUsers = useCallback(async () => {
    const res = await getAllUsers();
    setAllUsers(res.data || []);
  }, []);

  const fetchModerators = useCallback(async () => {
    const res = await getAllModerators();
    setAllModerators(res.data || []);
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchUsers(), fetchModerators()]);
    } catch {
      setError('Lỗi khi lấy danh sách');
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, fetchModerators]);


  useEffect(() => {
    if (allUsers.length === 0 && allModerators.length === 0) {
      fetchAllData();
    }
  }, []);

  const filteredData = useMemo(() => {
    const dataToFilter = tab === 'user' ? allUsers : allModerators;
    if (!searchTerm) return dataToFilter;
    const lowercasedSearch = searchTerm.toLowerCase();

    return dataToFilter.filter(user => {
      const statusString = user.is_active ? 'active' : 'locked';

      return (
        user.username?.toLowerCase().includes(lowercasedSearch) ||
        statusString.includes(lowercasedSearch)
      );
    });
  }, [searchTerm, tab, allUsers, allModerators]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePromote = async (userId) => {
    setActionLoading(userId);
    try {
      await promoteToModerator(userId);
      await fetchAllData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleLock = async (userId) => {
    setActionLoading(userId);
    try {
      await toggleUserActivation(userId);
      const setDataFunction = tab === 'user' ? setAllUsers : setAllModerators;
      setDataFunction(prevData =>
        prevData.map(user => user._id === userId ? { ...user, is_active: !user.is_active } : user)
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDemote = async (userId) => {
    setActionLoading(userId);
    try {
      await demoteModerator(userId);
      await fetchAllData();
      setTab('user');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="aduser-container">
      <h2 className="aduser-title">User & Moderator Management</h2>
      <div className="aduser-tabButtons">
        <button onClick={() => setTab("user")} className={`aduser-tabButton ${tab === "user" ? "active" : ""}`}>User</button>
        <button onClick={() => setTab("moderator")} className={`aduser-tabButton ${tab === "moderator" ? "active" : ""}`}>Moderator</button>
      </div>

      <div className="aduser-filters">
        <input type="text" placeholder="Search by username or status..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>


      {loading ? <div className="aduser-status">Loading...</div> :
        error ? <div className="aduser-status">{error}</div> : (
          <>
            <table className="aduser-table">
              <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {currentData.map((user) => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td><span className={`aduser-role-badge aduser-role-${user.role_id?.toLowerCase()}`}>{user.role_id}</span></td>
                    <td><span className={`aduser-status-badge ${user.is_active ? 'active' : 'locked'}`}>{user.is_active ? "Active" : "Locked"}</span></td>
                    <td>
                      {tab === "user" ? (
                        <>
                          <button onClick={() => handlePromote(user._id)} disabled={actionLoading === user._id} className="aduser-actionBtn aduser-promoteBtn">Promote</button>
                          <button onClick={() => handleToggleLock(user._id)} disabled={actionLoading === user._id} className={`aduser-actionBtn ${user.is_active ? "aduser-lockBtn" : "aduser-unlockBtn"}`}>{user.is_active ? "Lock" : "Unlock"}</button>
                        </>
                      ) : (
                        <button onClick={() => handleDemote(user._id)} disabled={actionLoading === user._id} className="aduser-actionBtn aduser-demoteBtn">Demote</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
    </div>
  );
}