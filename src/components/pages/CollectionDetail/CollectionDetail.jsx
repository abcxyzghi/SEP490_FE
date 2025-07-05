import React, { useEffect, useState } from 'react';
import { getAllProductOfUserCollection } from '../../../services/api.user';

export default function CollectionDetail({ collectionId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!collectionId) {
      setProducts([]);
      return;
    }
    const fetchProducts = async () => {
      try {
        const res = await getAllProductOfUserCollection(collectionId);
        if (res && res.status && Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      } catch {
        setProducts([]);
      }
    };
    fetchProducts();
  }, [collectionId]);

  if (!collectionId) {
    return <div>No collection selected.</div>;
  }

  return (
    <div>
      <h3>User Products in Collection</h3>
      {products.length === 0 ? (
        <div>No products found in this collection.</div>
      ) : (
        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 0, listStyle: 'none' }}>
          {products.map(product => (
            <li key={product.id || product._id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12, width: 220 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{product.productName || product.name || 'Unnamed Product'}</div>
              {product.urlImage && (
                <img
                  src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${product.urlImage}`}
                  alt={product.productName}
                  style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }}
                />
              )}
              <div>Quantity: {product.quantity}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
