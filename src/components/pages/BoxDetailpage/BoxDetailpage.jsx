import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMysteryBoxDetail, buyMysteryBox } from '../../../services/api.mysterybox'
import { fetchUserInfo } from '../../../services/api.auth';
import { useDispatch } from 'react-redux';
import { setUser } from '../../../redux/features/authSlice';
import BoxInformation from '../../tabs/BoxInformation/BoxInformation'
import BoxRatelity from '../../tabs/BoxRatelity/BoxRatelity'
import SwitchTabs from '../../libs/SwitchTabs/SwitchTabs';

export default function BoxDetailpage() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [box, setBox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Information');

  // Fetch box details
  const fetchDetail = async () => {
    const result = await getMysteryBoxDetail(id);
    if (result && result.status) {
      setBox(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!box) {
    return <div className="text-center mt-10 text-red-500">Box not found or error loading data.</div>;
  }

  // Handle instant pay
  const handlePayInstant = async () => {
    const result = await buyMysteryBox({ mangaBoxId: box.id, quantity: 1 });
    if (result?.status) {
      // Refetch user info to update wallet amount
      const token = localStorage.getItem('token');
      if (token) {
        const res = await fetchUserInfo(token);
        if (res.status && res.data) {
          dispatch(setUser(res.data));
        }
      }
      alert(result.data?.message || 'Buy mystery box successfully!');
    } else {
      alert(result?.error || 'Failed to buy mystery box.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8"> 
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8">
        <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${box.urlImage}`} alt={box.mysteryBoxName} className="w-full h-64 object-cover rounded mb-4" /> 
        <h1 className="text-3xl font-bold mb-2">{box.mysteryBoxName}</h1>
        <p className="text-xl font-bold text-blue-600 mb-4">{(box.mysteryBoxPrice / 1000).toFixed(3)} VND</p>
        <button
          className="oxanium-bold"
          style={{ marginBottom: 16, padding: '10px 24px', background: '#1e90ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 18 }}
          onClick={handlePayInstant}
        >
          Pay Instant
        </button>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8">
          <SwitchTabs
            tabs={[
              {
                label: 'Information',
                content: <BoxInformation mysteryBoxDetail={box} />
              },
              {
                label: 'Ratelity',
                content: <BoxRatelity mysteryBoxDetail={box} />
              },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
        {/* <p className="text-gray-700 mb-4">{box.mysteryBoxDescription}</p>
        <p className="text-lg font-semibold mb-2">Collection: {box.collectionTopic}</p> */}
        {/* Add more details or actions here if needed */}
      </div>
    </div>
  )
}
