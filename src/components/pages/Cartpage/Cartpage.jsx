/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCartFromServer, clearCart, removeItemFromCart } from '../../../redux/features/cartSlice';
import { viewCart, clearAllCart, removeFromCart } from '../../../services/api.cart';
import './Cartpage.css';

export default function Cartpage() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items || []);
  const [selectedTab, setSelectedTab] = useState('Mystery Boxes');
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const boxes = cartItems.filter((item) => item.type === 'box');
  const products = cartItems.filter((item) => item.type === 'product');
  const currentItems = selectedTab === 'Mystery Boxes' ? boxes : products;
  const [selectedItems, setSelectedItems] = useState([]);
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(currentItems.map(item => item.id + '-' + item.type));
    } else {
      setSelectedItems([]);
    }
  };
  const handleToggleItem = (item) => {
    const key = item.id + '-' + item.type;
    setSelectedItems((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    );
  };
  const selectedTotal = currentItems
    .filter(item => selectedItems.includes(item.id + '-' + item.type))
    .reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  // Không cần kiểm tra cartItems.length > 0
  // Luôn gọi API để đảm bảo sync
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const result = await viewCart();
        if (result?.status) {
          const formattedItems = [];

          result.data.boxes?.forEach((boxItem) => {
            formattedItems.push({
              id: boxItem.box.id,
              name: boxItem.box.mysteryBoxName,
              image: boxItem.box.urlImage,
              price: boxItem.box.mysteryBoxPrice,
              type: 'box',
              quantity: boxItem.quantity || 1,
            });
          });

          result.data.products?.forEach((productItem) => {
            formattedItems.push({
              id: productItem.product.id,
              name: productItem.product.name,
              image: productItem.product.urlImage,
              price: productItem.product.price,
              type: 'product',
              quantity: productItem.quantity || 1,
            });
          });

          dispatch(setCartFromServer(formattedItems));
        }
      } catch (error) {
        console.error('❌ Failed to fetch cart', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [dispatch]);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  const handleRemoveItem = async (item) => {
    try {
      if (item.type === 'box') {
        await removeFromCart({ mangaBoxId: item.id });
      } else if (item.type === 'product') {
        await removeFromCart({ sellProductId: item.id });
      }
      dispatch(removeItemFromCart({ id: item.id, type: item.type }));
      alert('🗑️ Remove Item!');
    } catch (error) {
      alert('❌ Failed to remove item from cart.');
      console.error(error);
    }
  };
  const handleClearAll = async () => {
    setIsClearing(true); // 👉 Hiển thị loading

    try {
      await clearAllCart(); // Gọi API
      dispatch(clearCart()); // Xóa redux
      alert('🗑️ Cart cleared!');
    } catch (err) {
      alert('❌ Failed to clear cart.');
      console.error(err);
    } finally {
      setIsClearing(false); // 👉 Tắt loading
    }
  };
  return (
    <div>
      <div className="cartpage-content">
        <div className="cartpage-tab-container">
          <div className="cartpage-tab-wrapper">
            <div
              className={`cartpage-tab ${selectedTab === 'Mystery Boxes' ? 'active' : ''}`}
              onClick={() => {
                setSelectedTab('Mystery Boxes');
                setExpandedCardIndex(null);
              }}
            >
              Mystery Boxes
            </div>
            <div
              className={`cartpage-tab ${selectedTab === 'Collection Store' ? 'active' : ''}`}
              onClick={() => {
                setSelectedTab('Collection Store');
                setExpandedCardIndex(null);
              }}
            >
              Collection Store
            </div>
          </div>
        </div>

        <div className="cartpage-card-container">
          <div className="cartpage-card-label">
            <span className="cartpage-card-label-inner">
              {selectedTab === 'Mystery Boxes' ? 'Mystery Box' : 'Products'}
            </span>
          </div>

          <div className="cartpage-card-grid">
            <div className="cartpage-left-section">
              <div className="cartpage-select-all">
                <button
                  className="cartpage-clear-button"
                  onClick={handleClearAll}
                  disabled={isClearing}
                >
                  {isClearing ? (
                    <span className="loader" style={{ fontSize: '12px' }}>⏳ Clearing...</span>
                  ) : (
                    'Clear'
                  )}
                </button>
                <input
                  type="checkbox"
                  id="cartpage-select-all-checkbox"
                  className="custom-checkbox"
                  checked={
                    currentItems.length > 0 &&
                    selectedItems.length === currentItems.length
                  }
                  onChange={handleSelectAll}
                />
                <label htmlFor="cartpage-select-all-checkbox">ALL</label>

              </div>

              <div className="cartpage-product-list">
                {currentItems.map((item, index) => (
                  <div className="cartpage-product-item" key={item.id + item.type}>
                    <div className="cartpage-product-wrapper">
                      <input
                        type="checkbox"
                        className="cartpage-product-checkbox"
                        checked={selectedItems.includes(item.id + '-' + item.type)}
                        onChange={() => handleToggleItem(item)}
                      />
                      <div className="cartpage-product-box">
                        <img
                          src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${item.image}`}
                          alt="product"
                          className="cartpage-product-image"
                        />
                        <div className="cartpage-product-text">
                          <div className="cartpage-product-name">{item.name}</div>
                          <div className="cartpage-product-price">
                            {(item.price || 0).toLocaleString('vi-VN')} VND
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="cartpage-quantity">
                      <button
                        onClick={() => {
                          if (item.quantity === 1) {
                            handleRemoveItem(item);
                          }
                        }}
                      >
                        -
                      </button>
                      <span>{item.quantity || 1}</span>
                      <button>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cartpage-summary">
              <div className="cartpage-summary-price">
                <div className="cartpage-summary-title">Total Price</div>
                <div className="cartpage-summary-value">
                  {currentItems
                    .reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
                    .toLocaleString('vi-VN')}
                  <br />
                  VND
                </div>
              </div>
              <div className="cartpage-summary-quantity">
                <div className="cartpage-summary-title">Total Quantity</div>
                <div className="cartpage-summary-value">
                  {currentItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="cartpage-footer">
        <div className="cartpage-footer-content">
          <div className="cartpage-total">
            Total: {selectedTotal.toLocaleString('vi-VN')} VND
          </div>
          <button className="cartpage-buy-button">Buy</button>
        </div>
      </div>
    </div>
  );
}
