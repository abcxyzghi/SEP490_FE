
import React from 'react';

export default function UserOnSale({ products, productsLoading }) {
  return (
    <div style={{ marginTop: 32 }}>
      <h3>Products on Sale</h3>
      {productsLoading ? (
        <div>Loading products...</div>
      ) : products.length === 0 ? (
        <div>No products on sale.</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
          {products.map(product => (
            <div key={product.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, width: 220, textAlign: 'center', background: '#fafafa' }}>
              <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${product.urlImage}`} alt={product.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }} />
              <div style={{ fontWeight: 600 }}>{product.name}</div>
              <div style={{ color: '#888', fontSize: 14 }}>{product.topic}</div>
              <div style={{ color: '#1e90ff', fontWeight: 700, margin: '8px 0' }}>{(product.price / 1000).toFixed(3)} VND</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
