/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProductOnSaleDetail } from '../../../services/api.product'
import CommentSection from '../../libs/CommentSection/CommentSection'
import { getAllRatingsBySellProduct } from '../../../services/api.comment'

export default function ProductDetailpage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);

  
  const fetchDetail = async () => {
    const result = await getProductOnSaleDetail(id);
    if (result && result.status) {
      setProduct(result.data);
    }
    setLoading(false);
  };

  
  const fetchRatings = async () => {
    setRatingsLoading(true);
    try {
      const result = await getAllRatingsBySellProduct(id);
      if (result && result.status) {
        setRatings(result.data);
      } else {
        setRatings([]);
      }
    } catch (error) {
      setRatings([]);
    }
    setRatingsLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    fetchRatings();
  }, [id]);

  // Calculate average rating
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>;
  }

  if (!product) {
    return <div className="text-center mt-10 text-red-500">Product not found or error loading data.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${product.urlImage}`} alt={product.name} className="w-full h-64 object-cover rounded mb-4" />
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-700 mb-4">{product.description}</p>
        <p className="text-lg font-semibold mb-2">Topic: {product.topic}</p>
        <p className="text-gray-500 mb-2">Seller: {product.username}</p>
        <p className="text-lg font-semibold mb-2">Rate: {product.rateName}</p>
        <p className="text-xl font-bold text-green-600 mb-4">{(product.price / 1000).toFixed(3)} VND</p>
        {/* Ratings Section */}
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Ratings</h2>
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-500 text-xl">
                {i < Math.round(averageRating) ? '★' : '☆'}
              </span>
            ))}
          </div>
          {ratingsLoading ? (
            <div>Loading ratings...</div>
          ) : ratings.length === 0 ? (
            <div>No ratings yet.</div>
          ) : (
            <div className="space-y-2">
              {ratings.map(rating => (
                <div key={rating.id} className="border rounded p-2 flex items-center justify-between">
                  <span className="font-semibold">{rating.username}</span> 
                  <span className="text-yellow-500 font-bold">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < rating.rating ? '★' : '☆'}</span>
                    ))}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(rating.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="max-w-2xl mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        <CommentSection sellProductId={product.id} />
      </div>
    </div>
  )
}
