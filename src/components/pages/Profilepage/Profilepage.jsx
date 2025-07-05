import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getProfile, getOtherProfile, getAllProductOnSaleOfUser } from '../../../services/api.user';
import UserOnSale from '../../tabs/UserOnSale/UserOnSale';
import UserBox from '../../tabs/UserBox/UserBox';
import UserCollectionList from '../../tabs/UserCollectionList/UserCollectionList';


export default function Profilepage() {
  const { id } = useParams();
  const currentUserId = useSelector(state => state.auth.user?.user_id);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

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

  useEffect(() => {
    const fetchProducts = async () => {
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
    };
    if (id || currentUserId) {
      fetchProducts();
    }
  }, [id, currentUserId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>No profile data found.</div>;

  const isMyProfile = currentUserId && (id === currentUserId || !id);

  return (
    <div>
      <h2>{isMyProfile ? 'My Profile' : `User Profile: ${profile.username || id}`}</h2>
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <button onClick={() => alert('Copy link feature coming soon!')}>Copy link</button>
      {/* Add more fields as needed */}
      {!isMyProfile && (
        <button onClick={() => alert('Report feature coming soon!')}>Report</button>        
      )}
      <UserOnSale products={products} productsLoading={productsLoading} />
      <UserBox />
      <UserCollectionList />
    </div>
  );
}
