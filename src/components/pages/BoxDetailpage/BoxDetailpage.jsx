import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMysteryBoxDetail } from '../../../services/api.mysterybox'

export default function BoxDetailpage() {
  const { id } = useParams();
  const [box, setBox] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="container mx-auto px-4 py-8"> 
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${box.urlImage}`} alt={box.mysteryBoxName} className="w-full h-64 object-cover rounded mb-4" /> 
        <h1 className="text-3xl font-bold mb-2">{box.mysteryBoxName}</h1>
        <p className="text-gray-700 mb-4">{box.mysteryBoxDescription}</p>
        <p className="text-lg font-semibold mb-2">Collection: {box.collectionTopic}</p>
        <p className="text-xl font-bold text-blue-600 mb-4">{(box.mysteryBoxPrice / 1000).toFixed(3)} VND</p>
        {/* Add more details or actions here if needed */}
      </div>
    </div>
  )
}
