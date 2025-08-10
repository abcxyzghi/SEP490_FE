import React, { useEffect, useState } from 'react';
import './Exchangepage.css';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductOnSaleDetail } from '../../../services/api.product';
import { useSelector } from 'react-redux';
import { exchangeProduct, getAllProductsOfCollection, getCollectionOfProfile } from '../../../services/api.exchange';
import { buildImageUrl } from '../../../services/api.imageproxy';
import { Pathname } from '../../../router/Pathname';
import MessageModal from '../../libs/MessageModal/MessageModal';

export default function Exchangepage() {
  const { sellProductId } = useParams();
  const [product, setProduct] = useState(null);
  const [useBackupImg, setUseBackupImg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('all');
  const [allUserProducts, setAllUserProducts] = useState([]);
  const [loadingUserProducts, setLoadingUserProducts] = useState(true);
  const [isExchanging, setIsExchanging] = useState(false);
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });

  const [selectedCards, setSelectedCards] = useState([]);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  // Fetch product info
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

  // Fetch all collections and products of each collection
  useEffect(() => {
    async function fetchCollectionsAndProducts() {
      setLoadingUserProducts(true);
      try {
        if (!user || !user.user_id) {
          setCollections([]);
          setAllUserProducts([]);
          return;
        }

        const collectionRes = await getCollectionOfProfile();
        const collectionsData = collectionRes?.data || [];
        setCollections(collectionsData);

        let allProducts = [];
        for (let col of collectionsData) {
          const productRes = await getAllProductsOfCollection(col.id);
          if (Array.isArray(productRes?.data)) {
            allProducts = [
              ...allProducts,
              ...productRes.data.map((p) => ({ ...p, collectionId: col.id }))
            ];
          }
        }
        setAllUserProducts(allProducts);
      } catch (err) {
        setCollections([]);
        setAllUserProducts([]);
      }
      setLoadingUserProducts(false);
    }

    fetchCollectionsAndProducts();
  }, [user]);

  // Handle card click
  const handleCardClick = (card) => {
    const isSelected = selectedCards.find((c) => c.id === card.id);
    if (isSelected) {
      setSelectedCards((prev) => prev.filter((c) => c.id !== card.id));
    } else {
      setSelectedCards((prev) => [...prev, { ...card, quantityExchange: 1 }]);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (cardId, value, maxQuantity) => {
    const qty = Math.max(1, Math.min(parseInt(value) || 1, maxQuantity));
    setSelectedCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, quantityExchange: qty } : card
      )
    );
  };

  // Filter products based on selected collection
  const displayedProducts =
    selectedCollectionId === 'all'
      ? allUserProducts
      : allUserProducts.filter(
        (p) => p.collectionId === selectedCollectionId
      );

  // Loader whole page while fetching data
  if (loading) {
    return (
      <div className="exchangepage-container min-h-screen flex flex-col items-center justify-start py-10">
        {/* Header skeleton */}
        <div className="exchangepage-header w-full max-w-5xl text-center mb-6">
          <div className="skeleton h-7 w-[45%] mx-auto mb-2 bg-gray-700/40 rounded"></div>
          <div className="skeleton h-4 w-40 mx-auto bg-gray-700/40 rounded"></div>
        </div>

        {/* Layout */}
        <div className="exchangepage-layout w-full max-w-5xl flex gap-8 items-start">
          {/* LEFT: product image skeleton */}
          <div className="exchangepage-left flex-shrink-0 w-1/3">
            <div className="productdetailP-image-grandWrapper">
              <div className="productdetailP-image-wrapper">
                <div className="skeleton w-full h-100 rounded-lg bg-gray-700/40"></div>
              </div>
            </div>
          </div>

          {/* RIGHT: selected container + products skeleton */}
          <div className="exchangepage-right flex-1 space-y-4">
            {/* selected cards skeleton */}
            <div className="exchangepage-selected-container">
              <div className="skeleton h-5 w-36 mb-3 bg-gray-700/40 rounded"></div>
              <div className="flex flex-wrap gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="skeleton w-24 h-24 rounded bg-gray-700/40"></div>
                    <div className="skeleton w-16 h-8 rounded bg-gray-700/40"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* confirm button skeleton */}
            <div className="skeleton h-10 w-[70%] mt-4 mx-auto bg-gray-700/40 rounded mx-auto"></div>

            {/* collection select skeleton */}
            <div className="exchangepage-collection">
              <div className="skeleton h-4 w-48 mb-2 bg-gray-700/40 rounded"></div>
              <div className="skeleton h-10 w-full bg-gray-700/40 rounded"></div>
            </div>

            {/* products grid skeleton */}
            <div className="exchangepage-products-container">
              <div className="grid grid-cols-4 gap-4">
                {[...Array(8)].map((_, idx) => (
                  <div key={idx} className="skeleton h-36 rounded bg-gray-700/40"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-500 mt-10 text-center text-lg oxanium-regular">{error}</div>;

  // Handle exchange API call
  const handleExchange = async () => {
    try {
      setIsExchanging(true);

      const payload = {
        itemReciveId: sellProductId,
        session: {
          feedbackId: 'string'
        },
        products: selectedCards.map((card) => ({
          productExchangeId: card.id,
          quantityProductExchange: card.quantityExchange
        }))
      };
      const res = await exchangeProduct(payload);
      showModal('default', 'Exchange sent', 'Your exchange request has been sent successfully! What you should do next is wait.');
    } catch (err) {
      showModal('error', 'Oops!', 'Something went wrong in exchange process. Please try again later.');
    } finally {
      setIsExchanging(false);
    }
  };

  return (
    <div className="exchangepage-container">
      {/* Title */}
      <div className="exchangepage-header">
        <h2 className="exchangepage-title oleo-script-bold">
          Exchange for: <span>{product?.name}</span>
        </h2>
        <p className="exchangepage-seller oxanium-semibold">Collecion owner:
          <span onClick={() => navigate(Pathname("PROFILE").replace(":id", product?.userId))}>
            {product?.username}
          </span>
        </p>
      </div>

      <div className="exchangepage-layout">
        {/* LEFT SIDE - Product Info */}
        <div className="exchangepage-left">
          {/* Reuse component + style from ProductDetailpage  d=====(￣▽￣*)b */}
          <div className="productdetailP-image-grandWrapper">
            <div className="productdetailP-image-wrapper">
              <div className="productdetailP-box-imgBG">
                <img src={buildImageUrl(product?.urlImage, useBackupImg)} onError={() => setUseBackupImg(true)} alt={`${product?.name} background`} />
              </div>
              <div className="productdetailP-box-img-wrapper">
                <img src={buildImageUrl(product?.urlImage, useBackupImg)} onError={() => setUseBackupImg(true)} alt={product?.name}
                  className="productdetailP-box-img" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Exchange Area */}
        <div className="exchangepage-right">
          {/* Selected Cards */}
          <div className="exchangepage-selected-container">
            <h3 className='mb-2 oxanium-regular'>Selected Cards</h3>
            <div className="exchangepage-selected-list">
              {selectedCards.length > 0 ? (
                selectedCards.map((card) => (
                  <div key={card.id} className="exchangepage-selected-card">
                    <img
                      src={buildImageUrl(card.urlImage, useBackupImg)}
                      onError={() => setUseBackupImg(true)}
                      alt={card.name}
                      className="exchangepage-card-image"
                    />

                    <div className="exchangepage-quantity-wrapper">
                      <button
                        type="button"
                        className="exchangepage-quantity-btn"
                        onClick={() =>
                          handleQuantityChange(
                            card.id,
                            Math.max(1, card.quantityExchange - 1),
                            card.quantity
                          )
                        }
                      >
                        −
                      </button>

                      <input
                        type="text"
                        value={card.quantityExchange}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (!isNaN(value)) {
                            handleQuantityChange(card.id, value, card.quantity);
                          }
                        }}
                        className="exchangepage-quantity-input"
                      />

                      <button
                        type="button"
                        className="exchangepage-quantity-btn"
                        onClick={() =>
                          handleQuantityChange(
                            card.id,
                            Math.min(card.quantity, card.quantityExchange + 1),
                            card.quantity
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className='exchangepage-no-card text-gray-300 opacity-50 oxanium-regular'>No cards selected</p>
              )}
            </div>
          </div>

          {/* Collection Confirm button */}
          <button
            className="exchangepage-confirm-btn oxanium-bold"
            onClick={handleExchange}
            disabled={selectedCards.length === 0 || isExchanging}
          >
            {isExchanging && <span className="loading loading-bars loading-md"></span>}
            {isExchanging ? ' Processing...' : 'Confirm Exchange'}
          </button>

          {/* Collection Dropdown */}
          <div className="exchangepage-collection oxanium-regular">
            <label>Choose your collection:</label>
            <select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
            >
              <option value="all">All Collections</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.collectionTopic}
                </option>
              ))}
            </select>
          </div>

          {/* Displayed Products */}
          <div className="exchangepage-products-container">
            {loadingUserProducts ? (
              <div className="grid grid-cols-4 gap-4">
                {[...Array(8)].map((_, idx) => (
                  <div key={idx} className="skeleton h-36 rounded bg-gray-700/40"></div>
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="exchangepage-no-card text-gray-300 opacity-50 oxanium-regular">You have no cards to exchange.</div>
            ) : (
              <ul className="exchangepage-products-list">
                {displayedProducts.map((card) => {
                  const isSelected = selectedCards.find((c) => c.id === card.id);
                  return (
                    <li
                      key={card.id}
                      onClick={() => {
                        if (card.quantity > 0) handleCardClick(card);
                      }}
                      className={`exchangepage-card ${card.quantity === 0 ? 'disabled' : ''
                        } ${isSelected ? 'selected' : ''}`}
                    >
                      <img
                        src={buildImageUrl(card.urlImage, useBackupImg)}
                        onError={() => setUseBackupImg(true)}
                        alt='card name'
                        className="exchangepage-card-image"
                      />
                      {/* <div className="exchangepage-card-name">{card.name}</div> */}
                      <div className="exchangepage-card-quantity oxanium-light">
                        Qty: {card.quantity}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Message Modal */}
      <MessageModal
        open={modal.open}
        onClose={() => setModal(prev => ({ ...prev, open: false }))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
}