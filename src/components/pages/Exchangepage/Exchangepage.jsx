import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductOnSaleDetail } from '../../../services/api.product';
import { useSelector } from 'react-redux';
import { exchangeProduct, getAllProductsOfCollection, getCollectionOfProfile } from '../../../services/api.exchange';

export default function Exchangepage() {
  const { sellProductId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [loadingUserProducts, setLoadingUserProducts] = useState(true);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const user = useSelector(state => state.auth.user);
  const [selectedCards, setSelectedCards] = useState([]);
  
  const handleCardClick = (card) => {
    const isSelected = selectedCards.find(c => c.id === card.id);
    if (isSelected) {
      setSelectedCards(prev => prev.filter(c => c.id !== card.id));
    } else {
      setSelectedCards(prev => [...prev, { ...card, quantityExchange: 1 }]);
    }
  };
  const handleQuantityChange = (cardId, value, maxQuantity) => {
    const qty = Math.max(1, Math.min(parseInt(value) || 1, maxQuantity));
    setSelectedCards(prev =>
      prev.map(card =>
        card.id === cardId ? { ...card, quantityExchange: qty } : card
      )
    );
  };

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const res = await getProductOnSaleDetail(sellProductId);
        if (res && res.status) {
          setProduct(res.data);
        } else {
          setError('Product not found or error loading data.');
        }
      } catch (err) {
        setError('Product not found or error loading data.');
      }
      setLoading(false);
    }
    fetchProduct();
  }, [sellProductId]);

  // Lấy danh sách collection của user
  useEffect(() => {
    async function fetchCollections() {
      try {
        if (!user || !user.user_id) {
          setCollections([]);
          setSelectedCollectionId(null);
          return;
        }
        const collectionRes = await getCollectionOfProfile();
        const collectionsData = collectionRes?.data || [];
        setCollections(collectionsData);
        if (collectionsData.length > 0) {
          setSelectedCollectionId(collectionsData[0].id);
        }
      } catch (err) {
        setCollections([]);
        setSelectedCollectionId(null);
      }
    }
    fetchCollections();
  }, [user]);

  // Lấy danh sách thẻ của collection được chọn
  useEffect(() => {
    async function fetchUserProducts() {
      setLoadingUserProducts(true);
      try {
        if (!selectedCollectionId) {
          setUserProducts([]);
          setLoadingUserProducts(false);
          return;
        }
        const productRes = await getAllProductsOfCollection(selectedCollectionId);
        const products = productRes?.data;
        if (Array.isArray(products)) {
          setUserProducts(products);
        } else {
          setUserProducts([]);
        }
      } catch (err) {
        setUserProducts([]);
      }
      setLoadingUserProducts(false);
    }
    fetchUserProducts();
    // Reset selectedCards khi đổi collection
    setSelectedCards([]);
  }, [selectedCollectionId]);
  if (loading) return <div>Loading product info...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  const handleExchange = async () => {
    try {
      const payload = {
        itemReciveId: sellProductId,
        session: {
          feedbackId: "string",
        },
        products: selectedCards.map(card => ({
          productExchangeId: card.id,
          quantityProductExchange: card.quantityExchange,
        })),
      };
      const res = await exchangeProduct(payload);
      alert("Exchange thành công!");
    } catch (err) {
      alert("Đã có lỗi xảy ra khi trao đổi.");
    }
  };
  return (
    <div className="max-w-xl mx-auto mt-8 p-4 border rounded text-white">
      <h2 className="text-2xl font-bold mb-4">Exchange for: {product?.name}</h2>

      {/* Dropdown menu chọn collection */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Choose your collection:</label>
        <div className="relative inline-block w-full">
          <select
            className="block w-full text-black rounded px-2 py-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCollectionId || ''}
            onChange={e => setSelectedCollectionId(e.target.value)}
          >
            {collections.length === 0 && <option value="">No collections</option>}
            {collections.map(col => (
              <option key={col.id} value={col.id}>{col.collectionTopic}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        {/* Ảnh chính */}
        <img
          src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${product?.urlImage}`}
          alt={product?.name}
          className="w-48 h-48 object-cover rounded"
        />

        {/* Dãy ảnh từ selected cards */}
        <div className="flex flex-wrap gap-4">
          {selectedCards.map(card => (
            <div key={card.id} className="flex flex-col items-center">
              <img
                src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${card.urlImage}`}
                alt={card.name}
                className="w-16 h-16 object-cover rounded border"
              />
              <input
                type="number"
                min={1}
                max={card.quantity}
                value={card.quantityExchange}
                onChange={(e) =>
                  handleQuantityChange(card.id, e.target.value, card.quantity)
                }
                className="w-16 mt-1 text-white border border-white bg-transparent text-center rounded"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mb-4"
        onClick={handleExchange}
        disabled={selectedCards.length === 0}
      >
        Confirm Exchange
      </button>

      <p className="mb-2">Price: <span className="font-semibold">{product?.price}</span></p>
      <p className="mb-2">Seller: <span className="font-semibold">{product?.username}</span></p>
      <p className="mb-2">Description: {product?.description}</p>

      <h3 className="text-lg font-semibold mt-6 mb-2">Your Cards (UserProduct)</h3>

      {loadingUserProducts ? (
        <div>Loading your cards...</div>
      ) : userProducts.length === 0 ? (
        <div className="text-gray-300">You have no cards to exchange.</div>
      ) : (
        <ul className="grid grid-cols-2 gap-4">
          {userProducts.map(card => {
            const isSelected = selectedCards.find(c => c.id === card.id);
            return (
              <li
                key={card.id}
                onClick={() => {
                  if (card.quantity > 0) handleCardClick(card);
                }}
                className={`border rounded p-2 flex flex-col items-center transition
    ${card.quantity === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${isSelected ? 'ring-2 ring-blue-500' : ''}
  `}
              >
                <img
                  src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${card.urlImage}`}
                  alt={card.name}
                  className="w-20 h-20 object-cover rounded mb-2"
                />
                <div className="font-semibold text-center">{card.name}</div>
                <div>Quantity: {card.quantity}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
