import React, { useEffect, useState } from 'react';
import { viewCart, removeFromCart, clearAllCart } from '../../../services/api.cart';

export default function Cartpage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState({});
  const [clearing, setClearing] = useState(false);

  const fetchCart = async () => {
    try {
      const result = await viewCart();
      if (result && result.status) {
        setCart(result.data);
        setError(null);
      } else {
        setCart(null);
        setError('Failed to load cart.');
      }
    } catch {
      setCart(null);
      setError('Failed to load cart.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemoveProduct = async (sellProductId) => {
    setRemoving((prev) => ({ ...prev, [sellProductId]: true }));
    try {
      await removeFromCart({ sellProductId });
      await fetchCart();
    } catch {
      alert('Failed to remove product from cart.');
    }
    setRemoving((prev) => ({ ...prev, [sellProductId]: false }));
  };

  const handleRemoveBox = async (mangaBoxId) => {
    setRemoving((prev) => ({ ...prev, [mangaBoxId]: true }));
    try {
      await removeFromCart({ mangaBoxId });
      await fetchCart();
    } catch {
      alert('Failed to remove box from cart.');
    }
    setRemoving((prev) => ({ ...prev, [mangaBoxId]: false }));
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await clearAllCart();
      await fetchCart();
    } catch {
      alert('Failed to clear cart.');
    }
    setClearing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  if (!cart) {
    return <div className="text-center mt-8">No items in cart.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Cart</h2>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          onClick={handleClearAll}
          disabled={clearing}
        >
          {clearing ? 'Clearing...' : 'Clear All'}
        </button>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Products</h3>
        {cart.products && cart.products.length > 0 ? (
          <ul className="mb-4">
            {cart.products.map((item) => (
              <li key={item.sellProductId} className="flex items-center justify-between border-b py-2">
                <div className="flex items-center gap-4">
                  <img src={item.product.urlImage} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.product.price.toLocaleString()} VND</div>
                  <button
                    className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    onClick={() => handleRemoveProduct(item.sellProductId)}
                    disabled={removing[item.sellProductId]}
                  >
                    {removing[item.sellProductId] ? 'Removing...' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500 mb-4">No products in cart.</div>
        )}
        <h3 className="text-lg font-semibold mb-2">Mystery Boxes</h3>
        {cart.boxes && cart.boxes.length > 0 ? (
          <ul>
            {cart.boxes.map((item) => (
              <li key={item.mangaBoxId} className="flex items-center justify-between border-b py-2">
                <div className="flex items-center gap-4">
                  <img src={item.box.urlImage} alt={item.box.mysteryBoxName} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <div className="font-medium">{item.box.mysteryBoxName}</div>
                    <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.box.mysteryBoxPrice.toLocaleString()} VND</div>
                  <button
                    className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    onClick={() => handleRemoveBox(item.mangaBoxId)}
                    disabled={removing[item.mangaBoxId]}
                  >
                    {removing[item.mangaBoxId] ? 'Removing...' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">No mystery boxes in cart.</div>
        )}
      </div>
    </div>
  );
}