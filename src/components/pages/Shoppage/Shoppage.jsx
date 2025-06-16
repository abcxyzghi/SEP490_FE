import React, { useEffect, useState } from 'react'
import { getAllMysteryBoxes } from '../../../services/api.mysterybox'
import { getAllProductsOnSale } from '../../../services/api.product'
import { useNavigate } from 'react-router-dom'

export default function Shoppage() {
  const [boxes, setBoxes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const result = await getAllMysteryBoxes();
        if (result && result.status) {
          setBoxes(result.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBoxes();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await getAllProductsOnSale();
        if (result && result.status) {
          setProducts(result.data);
        }
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading || loadingProducts) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mystery Boxes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {boxes.map((box) => (
          <div key={box.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img 
              src={box.urlImage} 
              alt={box.mysteryBoxName}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{box.mysteryBoxName}</h2>
              <p className="text-gray-600 mb-2">{box.collectionTopic}</p>
              <p className="text-lg font-bold text-blue-600">
                {(box.mysteryBoxPrice / 1000).toFixed(3)} VND
              </p>
              <button 
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                onClick={() => {/* Add to cart functionality here */}}
              >
                Add to Cart
              </button>
              <button
                className="mt-2 w-full bg-gray-200 text-blue-700 py-2 px-4 rounded hover:bg-blue-100 transition-colors"
                onClick={() => navigate(`/boxdetailpage/${box.id}`)}
              >
                View Detail
              </button>
            </div>
          </div>
        ))}
      </div>

      <h1 className="text-3xl font-bold mb-8">Products On Sale</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img
              src={product.urlImage}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-2">{product.topic}</p>
              <p className="text-gray-500 mb-2">Seller: {product.username}</p>
              <p className="text-lg font-bold text-green-600">
                {(product.price / 1000).toFixed(3)} VND
              </p>
              <button
                className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                onClick={() => {/* Add to cart functionality here */}}
              >
                Add to Cart
              </button>
              <button
                className="mt-2 w-full bg-gray-200 text-blue-700 py-2 px-4 rounded hover:bg-blue-100 transition-colors"
                onClick={() => navigate(`/productdetailpage/${product.id}`)}
              >
                View Detail
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


