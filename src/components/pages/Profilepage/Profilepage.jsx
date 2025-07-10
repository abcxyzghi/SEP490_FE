/* eslint-disable no-unused-vars */
import { React, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getProfile, getOtherProfile, getAllProductOnSaleOfUser, createReport } from '../../../services/api.user';
import UserOnSale from '../../tabs/UserOnSale/UserOnSale';
import UserBox from '../../tabs/UserBox/UserBox';
import UserCollectionList from '../../tabs/UserCollectionList/UserCollectionList';

import './Profilepage.css';
export default function Profilepage() {
  const { id } = useParams();
  const currentUserId = useSelector(state => state.auth.user?.user_id);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        // If id exists and (user is guest or id !== currentUserId), show other profile
        if (id && (!currentUserId || id !== currentUserId)) {
          res = await getOtherProfile(id);
        } else if (currentUserId) {
          res = await getProfile();
        } else {
          setError('You must be logged in to view your own profile.');
          setLoading(false);
          return;
        }
        if (res && res.status) {
          setProfile(res.data);
        } else {
          setError('Profile not found');
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    // Always allow fetching other profiles, only block my profile if not logged in
    if (id || typeof currentUserId !== 'undefined') {
      fetchProfile();
    }
  }, [id, currentUserId]);

  // Refetchable fetchProducts for on-sale products
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const userId = id || currentUserId;
      if (userId) {
        const res = await getAllProductOnSaleOfUser(userId);
        if (res && res.status) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    }
    setProductsLoading(false);
  }, [id, currentUserId]);

  useEffect(() => {
    if (id || currentUserId) {
      fetchProducts();
    }
  }, [id, currentUserId, fetchProducts]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>No profile data found.</div>;

  const isMyProfile = currentUserId && (id === currentUserId || !id);

  const handleSubmitReport = async () => {
    if (!reportTitle || !reportContent) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung.');
      return;
    }

    try {
      setReportSubmitting(true);
      const res = await createReport({
        sellProductId: "null",
        sellerId: id,
        title: reportTitle,
        content: reportContent,
      });

      if (res?.success || res?.status) {
        alert('Gửi báo cáo thành công!');
        setShowReportModal(false);
        setReportTitle('');
        setReportContent('');
      } else {
        alert('Gửi không thành công (response không hợp lệ)');
      }
    } catch (err) {
      console.error("Report error:", err);
      alert('Không thể gửi báo cáo. Vui lòng thử lại.');
    } finally {
      setReportSubmitting(false);
    }

  };
  return (
    <div>
      <h2>{isMyProfile ? 'My Profile' : `User Profile: ${profile.username || id}`}</h2>
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <button onClick={() => alert('Copy link feature coming soon!')}>Copy link</button>
      {/* Add more fields as needed */}
      {!isMyProfile && (
        <button
          onClick={() => {
            console.log("Open modal");
            setShowReportModal(true);
          }}
          style={{ color: 'white', backgroundColor: '#c0392b', padding: '6px 12px', borderRadius: 4 }}
        >
          Report
        </button>
      )}
      <UserOnSale products={products} productsLoading={productsLoading} />
      <UserBox />
      <UserCollectionList refreshOnSaleProducts={fetchProducts} />
      {showReportModal && (
        <div className="modal2-overlay">
          <div className="modal2">
            <h3>Gửi báo cáo</h3>
            <input
              type="text"
              placeholder="Tiêu đề"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
            />
            <textarea
              placeholder="Nội dung"
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
            />
            <div className="modal2-actions">
              <button onClick={handleSubmitReport} disabled={reportSubmitting}>
                {reportSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
              </button>
              <button onClick={() => setShowReportModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
