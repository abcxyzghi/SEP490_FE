import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCartFromServer, clearCart, removeItemFromCart, updateQuantity } from '../../../redux/features/cartSlice';
import { viewCart, clearAllCart, removeFromCart, updateCartQuantity } from '../../../services/api.cart';
import './CartProductList.css';
//import icons
import AddQuantity from "../../../assets/Icon_line/add-01.svg";
import ReduceQuantity from "../../../assets/Icon_line/remove-01.svg";

export default function CartProductList({ searchText, priceRange, selectedRarities, onSelectedItemsChange }) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items || []);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Only products
  const products = cartItems.filter((item) => item.type === 'product');

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const result = await viewCart();
        if (result?.status) {
          const formattedItems = [];
          result.data.products?.forEach((productItem) => {
            formattedItems.push({
              id: productItem.product.id,
              name: productItem.product.name,
              image: productItem.product.urlImage,
              price: productItem.product.price,
              rarity: productItem.product.rateName,
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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(products.map(item => item.id + '-' + item.type));
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

  const handleRemoveItem = async (item) => {
    try {
      await removeFromCart({ sellProductId: item.id });
      dispatch(removeItemFromCart({ id: item.id, type: item.type }));
      alert('🗑️ Remove Item!');
    } catch (error) {
      alert('❌ Failed to remove item from cart.');
      console.error(error);
    }
  };

  // Handle quantity change for product items
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

  const handleClearAll = async () => {
    setIsClearing(true);


    const selectedFilteredItems = filteredProducts.filter(item =>
      selectedItems.includes(item.id + '-' + item.type)
    );

    try {
      // Nếu đã chọn hết tất cả item
      if (selectedFilteredItems.length === filteredProducts.length) {
        await clearAllCart("product");
        dispatch(clearCart({ type: 'product' }));
        alert('🗑️ Cleared all items!');
      } else if (selectedFilteredItems.length > 0) {
        // Nếu chỉ chọn vài item thì xoá từng cái
        for (const item of selectedFilteredItems) {
          await removeFromCart({ sellProductId: item.id }); // gọi API
          dispatch(removeItemFromCart({ id: item.id, type: item.type })); // cập nhật Redux
        }

        alert(`🗑️ Removed ${selectedFilteredItems.length} item(s)!`);
      } else if (selectedFilteredItems.length === 0) {
        await clearAllCart("all");
        dispatch(clearCart());
        alert("🗑️ Cleared all items!");
      }
      else {
        alert("⚠️ Please select items to remove.");
      }
    } catch (err) {
      alert('❌ Failed to remove items from cart.');
      console.error(err);
    } finally {
      setIsClearing(false);
    }
  };


  // Make it case-insensitive and defensive
  const normalizeRarity = (rarity) =>
    rarity ? rarity.trim().toLowerCase().replace(/^\w/, c => c.toUpperCase()) : '';

  // Filter products based on search text, price range, rarities
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesPrice = priceRange >= 500 || item.price <= priceRange * 1000;
      const matchesRarity = selectedRarities.length === 0 || selectedRarities.includes(normalizeRarity(item.rarity));
      return matchesSearch && matchesPrice && matchesRarity;
    });
  }, [products, searchText, priceRange, selectedRarities]);


  // Calculate summary
  const totalPrice = products.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const totalQuantity = products.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const prevSelectedRef = useRef([]);

  useEffect(() => {
    const selected = filteredProducts.filter(item =>
      selectedItems.includes(item.id + '-' + item.type)
    );


                {/* Product list */}
                <div className="cartpage-product-list">
                    {loading
                        ? Array.from({ length: 3 }).map((_, idx) => (
                            <div className="cartpage-product-item" key={idx}>
                                <div className="cartpage-product-wrapper">
                                    <div className="cartpage-product-box">
                                        <div className="skeleton w-20 h-20 rounded-lg bg-slate-300" />
                                        <div className="cartpage-product-text">
                                            <div className="skeleton h-4 w-32 mb-2 rounded bg-slate-300" />
                                            <div className="skeleton h-4 w-20 rounded bg-slate-300" />
                                        </div>
                                    </div>
                                </div>
                                <div className="cartpage-quantity">
                                    <div className="skeleton h-8 w-26 rounded bg-slate-300" />
                                </div>
                            </div>
                        ))
                        : filteredProducts.map((item) => (
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
                <div className="cartpage-summary-price">
                    <div className="cartpage-summary-title oxanium-light">Total Price</div>
                    <div className="cartpage-summary-value oxanium-semibold">
                        {loading ? (
                            <div className="skeleton h-6 w-24 rounded bg-slate-300" />
                        ) : (
                            <>
                                {totalPrice.toLocaleString('vi-VN')}
                                <br />
                                VND
                            </>
                        )}

                    </div>
                  </div>
                </div>

                <div className="cartpage-summary-quantity">
                    <div className="cartpage-summary-title oxanium-light">Total Quantity</div>
                    <div className="cartpage-summary-value oxanium-semibold">
                        {loading ? <div className="skeleton h-6 w-12 rounded bg-slate-300" /> : totalQuantity}


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
        <div className="cartpage-summary-price">
          <div className="cartpage-summary-title oxanium-light">Total Price</div>
          <div className="cartpage-summary-value oxanium-semibold">
            {loading ? (
              <div className="skeleton h-6 w-24 rounded" />
            ) : (
              <>
                {totalPrice.toLocaleString('vi-VN')}
                <br />
                VND
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