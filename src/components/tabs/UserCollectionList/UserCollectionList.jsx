import React, { useEffect, useState } from 'react';
import { getAllCollectionOfProfile } from '../../../services/api.user';
import CollectionDetail from '../../pages/CollectionDetail/CollectionDetail';
import { getAllProductOfUserCollection, createSellProduct } from '../../../services/api.user';

export default function UserCollectionList({ refreshOnSaleProducts }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [products, setProducts] = useState([]);
  const [showProducts, setShowProducts] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);
  const [sellResult, setSellResult] = useState(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellModalProduct, setSellModalProduct] = useState(null);
  const [sellForm, setSellForm] = useState({ quantity: 1, description: '', price: 100000 });

  useEffect(() => {
    const fetchCollections = async () => {
      const res = await getAllCollectionOfProfile();
      if (res.status && Array.isArray(res.data)) {
        setCollections(res.data);
      } else {
        setCollections([]);
      }
    };
    fetchCollections();
  }, []);

  // Fetch products of selected collection
  const handleShowProducts = async (collectionId) => {
    setSelectedCollectionId(collectionId);
    setShowProducts(true);
    setSellResult(null);
    const res = await getAllProductOfUserCollection(collectionId);
    if (res.status && Array.isArray(res.data)) {
      setProducts(res.data);
    } else {
      setProducts([]);
    }
  };

  // Open sell modal
  const openSellModal = (product) => {
    setSellModalProduct(product);
    setSellForm({ quantity: 1, description: '', price: 100000 });
    setSellModalOpen(true);
    setSellResult(null);
  };

  // Handle sell product from modal
  const handleSellProduct = async (e) => {
    e.preventDefault();
    // Validation: all fields required
    if (!sellForm.quantity || !sellForm.description.trim() || !sellForm.price) {
      alert('Please enter all fields to sell.');
      return;
    }
    // Validation: quantity must not exceed owned
    if (sellForm.quantity > (sellModalProduct?.quantity || 0)) {
      alert('Your quantity is not enough to sell.');
      return;
    }
    // Try to get userProductId from multiple possible fields for robustness
    let userProductId = sellModalProduct?.userProductId || sellModalProduct?.UserProductId || sellModalProduct?.id;
    if (!userProductId) {
      // Try to find any key that looks like userProductId (case-insensitive)
      const possibleIdKey = Object.keys(sellModalProduct || {}).find(k => k.toLowerCase().includes('userproductid'));
      if (possibleIdKey) {
        userProductId = sellModalProduct[possibleIdKey];
      }
    }
    if (!userProductId) {
      alert('Product ID is missing. Cannot sell this product.');
      console.error('Sell modal product object:', sellModalProduct);
      return;
    }
    setSellLoading(true);
    setSellResult(null);
    const { quantity, description, price } = sellForm;
    // Debug log
    console.log('Selling with UserProductId:', userProductId, 'Full product:', sellModalProduct);
    const res = await createSellProduct({ userProductId, quantity, description, price });
    setSellLoading(false);
    setSellResult(res);
    if (res && res.status) {
      // Refetch on-sale products for UI update
      if (typeof refreshOnSaleProducts === 'function') {
        refreshOnSaleProducts();
      }
      // Show user a confirmation and refetch their on-sale products
      alert('Sell successful! Your product is now on sale.');
      setSellModalOpen(false);
    }
  };

  return (
    <div>
      <h3>User Collections</h3>
      {collections.length === 0 ? (
        <div>No collections found.</div>
      ) : (
        <ul>
          {collections.map(col => (
            <li key={col.id}>
              <strong>{col.collectionTopic}</strong> (Count: {col.count})
              <button style={{ marginLeft: 8 }} onClick={() => handleShowProducts(col.id)}>
                View Products
              </button>
            </li>
          ))}
        </ul>
      )}

      {showProducts && (
        <div style={{ marginTop: 16 }}>
          <button style={{ marginBottom: 8 }} onClick={() => { setShowProducts(false); setSelectedCollectionId(null); setProducts([]); }}>Close Products</button>
          <h4>Products in Collection</h4>
          {products.length === 0 ? (
            <div>No products found in this collection.</div>
          ) : (
            <ul>
              {products.map(prod => (
                <li key={prod.userProductId} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <img
                    src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${prod.urlImage}`}
                    alt={prod.productName}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginRight: 12 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div><b>{prod.productName}</b></div>
                    <div>Quantity: <span style={{ fontWeight: 500 }}>{prod.quantity}</span></div>
                  </div>
                  <button style={{ marginLeft: 8 }} onClick={() => openSellModal(prod)}>
                    Sell
                  </button>
                </li>
              ))}
      {/* Sell Modal */}
      {sellModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setSellModalOpen(false)}>
          <div style={{ background: '#fff', color: '#222', borderRadius: 12, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.3)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: 8, right: 12, background: 'none', border: 'none', color: '#222', fontSize: 22, cursor: 'pointer' }} onClick={() => setSellModalOpen(false)}>&times;</button>
            <h4>Sell Product</h4>
            <div style={{ marginBottom: 12 }}><b>{sellModalProduct?.productName}</b></div>
            <form onSubmit={handleSellProduct}>
              <div style={{ marginBottom: 8 }}>
                
                <label>Quantity: </label>
                <input type="number" min={1} value={sellForm.quantity} onChange={e => setSellForm(f => ({ ...f, quantity: Number(e.target.value) }))} required style={{ width: 60 }} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>Description: </label>
                <input type="text" value={sellForm.description} onChange={e => setSellForm(f => ({ ...f, description: e.target.value }))} required style={{ width: '90%' }} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>Price: </label>
                <input type="number" min={1000} step={1000} value={sellForm.price} onChange={e => setSellForm(f => ({ ...f, price: Number(e.target.value) }))} required style={{ width: 100 }} />
              </div>
              <button type="submit" disabled={sellLoading} style={{ marginTop: 8 }}>
                {sellLoading ? 'Selling...' : 'Confirm Sell'}
              </button>
            </form>
            {sellResult && (
              <div style={{ marginTop: 8, color: sellResult.status ? 'green' : 'red' }}>
                {sellResult.status ? sellResult.data?.message : (sellResult.error || 'Failed to sell product.')}
                {sellResult.status && sellResult.data?.exchangeCode && (
                  <div>Exchange Code: <b>{sellResult.data.exchangeCode}</b></div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
            </ul>
          )}
          {sellResult && (
            <div style={{ marginTop: 8, color: sellResult.status ? 'green' : 'red' }}>
              {sellResult.status ? sellResult.data?.message : (sellResult.error || 'Failed to sell product.')}
              {sellResult.status && sellResult.data?.exchangeCode && (
                <div>Exchange Code: <b>{sellResult.data.exchangeCode}</b></div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
