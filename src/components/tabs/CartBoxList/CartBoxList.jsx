import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCartFromServer, clearCart, removeItemFromCart} from '../../../redux/features/cartSlice';
import { viewCart, removeFromCart, clearAllCart, updateCartQuantity } from '../../../services/api.cart';
import './CartBoxList.css';
//import icons
import AddQuantity from "../../../assets/Icon_line/add-01.svg";
import ReduceQuantity from "../../../assets/Icon_line/remove-01.svg";

export default function CartBoxList({ searchText, priceRange, onSelectedItemsChange }) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items || []);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Only boxes
  const boxes = cartItems.filter((item) => item.type === 'box');

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

  const handleToggleItem = (item) => {
    const key = item.id + '-' + item.type;
    setSelectedItems((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    );
  };

  const handleRemoveItem = async (item) => {
    try {
      await removeFromCart({ mangaBoxId: item.id });
      dispatch(removeItemFromCart({ id: item.id, type: item.type }));
      alert('🗑️ Remove Item!');
    } catch (error) {
      alert('❌ Failed to remove item from cart.');
      console.error(error);
    }
  };

  // Handle quantity change for box items
  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(item);
      return;
    }

    try {
      await updateCartQuantity({ Id: item.id, quantity: newQuantity });
      dispatch({
        type: "cart/updateQuantity",
        payload: {
          id: item.id,
          type: item.type,
          quantity: newQuantity,
        },
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to update quantity.";
      alert(errorMessage);
      console.error("❌ Failed to update quantity:", errorMessage);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredBoxes.map(item => item.id + '-' + item.type));
    } else {
      setSelectedItems([]);
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);

    // Lọc các item được chọn
    const selectedFilteredItems = filteredBoxes.filter(item =>
      selectedItems.includes(item.id + '-' + item.type)
    );

    try {
      if (selectedFilteredItems.length === 0) {

        await clearAllCart("all");
        dispatch(clearCart());
        alert("🗑️ Cleared all items!");
      } else if (selectedFilteredItems.length === filteredBoxes.length) {
        // ✅ Chọn tất cả
        await clearAllCart("box");
        dispatch(clearCart({ type: 'box' }));
        alert("🗑️ Cleared all items!");
      } else {
        // 🔵 Chỉ chọn một phần
        for (const item of selectedFilteredItems) {
          await removeFromCart({ mangaBoxId: item.id });
          dispatch(removeItemFromCart({ id: item.id, type: item.type }));
        }
        alert(`🗑️ Removed ${selectedFilteredItems.length} item(s)!`);
      }
    } catch (err) {
      alert("❌ Failed to remove items from cart.");
      console.error(err);
    } finally {
      setIsClearing(false);
    }
  };



  // Filter based on search text and price range (no rarity)
  const filteredBoxes = useMemo(() => {
    return boxes.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesPrice = priceRange >= 500 || item.price <= priceRange * 1000;
      return matchesSearch && matchesPrice;
    });
  }, [boxes, searchText, priceRange]);

  const totalPrice = boxes.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const totalQuantity = boxes.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const prevSelectedRef = useRef([]);

  // // Handle buy action for selected boxes
  // const handleBuySelected = async () => {
  //   const selectedBoxes = filteredBoxes.filter(item => selectedItems.includes(item.id + '-' + item.type));
  //   if (selectedBoxes.length === 0) {
  //     alert('Please select at least one box to buy.');
  //     return;
  //   }
  //   let boughtCount = 0;
  //   for (const item of selectedBoxes) {
  //     const result = await buyMysteryBox({ mangaBoxId: item.id, quantity: item.quantity });
  //     if (result?.status) {
  //       dispatch(removeItemFromCart({ id: item.id, type: item.type }));
  //       boughtCount++;
  //     } else {
  //       alert(result?.error || `Failed to buy mystery box: ${item.name}`);
  //     }
  //   }
  //   if (boughtCount > 0) {
  //     // Refetch user info to update wallet amount
  //     const token = localStorage.getItem('token');
  //     if (token) {
  //       const res = await fetchUserInfo(token);
  //       if (res.status && res.data) {
  //         dispatch(setUser(res.data));
  //       }
  //     }
  //     // Clear all boxes from cart after successful buy
  //     dispatch(clearCart({ type: 'box' }));
  //     alert(`Successfully bought ${boughtCount} box(es)!`);
  //   }
  //   setSelectedItems([]);
  // };

  useEffect(() => {
    const selected = filteredBoxes.filter(item =>
      selectedItems.includes(item.id + '-' + item.type)
    );

    // Convert to string to compare shallow arrays (or use lodash isEqual if needed)
    const prevSelectedStr = JSON.stringify(prevSelectedRef.current);
    const currentSelectedStr = JSON.stringify(selected);

    if (prevSelectedStr !== currentSelectedStr) {
      prevSelectedRef.current = selected;
      onSelectedItemsChange?.(selected);
    }
  }, [selectedItems, filteredBoxes, onSelectedItemsChange]);

  return (
    <div className="cartpage-card-grid">
      <div className="cartpage-left-section">
        {/* Selecting & Clear */}
        <div className="cartpage-select-all">
          <button
            className="cartpage-clear-button oleo-script-bold"
            onClick={handleClearAll}
            disabled={isClearing}
          >
            {isClearing ? (
              <span className="loader" style={{ fontSize: '12px' }}>⏳ Clearing...</span>
            ) : (
              'Clear'
            )}
          </button>

          <div className='cartpage-select-all-checkbox-wrapper'>
            <input
              type="checkbox"
              id="cartpage-select-all-checkbox"
              className="custom-checkbox"
              checked={
                filteredBoxes.length > 0 &&
                selectedItems.filter(id => filteredBoxes.some(item => id === item.id + '-' + item.type)).length === filteredBoxes.length
              }
              onChange={handleSelectAll}
            />
            <label htmlFor="cartpage-select-all-checkbox" className="oxanium-regular">ALL</label>
          </div>

          {selectedItems.filter(id => filteredBoxes.some(item => id === item.id + '-' + item.type)).length > 0 && (
            <div className="oxanium-regular cartpage-select-numCheck">
              {selectedItems.filter(id => filteredBoxes.some(item => id === item.id + '-' + item.type)).length}
              {' / '}
              {filteredBoxes.length} Selected

            </div>
          )}
        </div>


            <div className="cartpage-summary">
                <div className="cartpage-summary-price">
                    <div className="cartpage-summary-title oxanium-light">Total Price</div>
                    <div className="cartpage-summary-value oxanium-semibold">
                        {loading ? (
                            <div className="skeleton h-6 w-24 rounded bg-slate-300" />
                        ) : (
                            <>
                                {totalPrice.toLocaleString('vi-VN')}<br />VND
                            </>
                        )}



                    </div>
                  </div>
                </div>
                <div className="cartpage-quantity">
                  <div className="skeleton h-8 w-26 rounded" />
                </div>

                <div className="cartpage-summary-quantity">
                    <div className="cartpage-summary-title oxanium-light">Total Quantity</div>
                    <div className="cartpage-summary-value oxanium-semibold">
                        {loading ? <div className="skeleton h-6 w-12 rounded bg-slate-300" /> : totalQuantity}

              </div>
            ))
            : filteredBoxes.map((item) => (
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
                    onClick={() => handleQuantityChange(item, (item.quantity || 1) - 1)}
                  >
                    <img src={ReduceQuantity} style={{ width: "20px", height: "20px" }} alt="-" />
                  </button>
                  <span className='oxanium-regular'>{item.quantity || 1}</span>
                  <button
                    onClick={() => handleQuantityChange(item, (item.quantity || 1) + 1)}
                  >
                    <img src={AddQuantity} style={{ width: "20px", height: "20px" }} alt="+" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="cartpage-summary">
        {/* <button
          className="cartpage-buy-button oxanium-bold"
          style={{ marginBottom: 16, padding: '10px 24px', background: '#1e90ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 18 }}
          onClick={handleBuySelected}
          disabled={loading || filteredBoxes.length === 0 || selectedItems.filter(id => filteredBoxes.some(item => id === item.id + '-' + item.type)).length === 0}
        >
          Buy Selected
        </button> */}
        <div className="cartpage-summary-price">
          <div className="cartpage-summary-title oxanium-light">Total Price</div>
          <div className="cartpage-summary-value oxanium-semibold">
            {loading ? (
              <div className="skeleton h-6 w-24 rounded" />
            ) : (
              <>
                {totalPrice.toLocaleString('vi-VN')}<br/>VND
              </>
            )}
          </div>
        </div>
        <div className="cartpage-summary-quantity">
          <div className="cartpage-summary-title oxanium-light">Total Quantity</div>
          <div className="cartpage-summary-value oxanium-semibold">
            {loading ? <div className="skeleton h-6 w-12 rounded" /> : totalQuantity}
          </div>
        </div>
      </div>
    </div>
  );
}
