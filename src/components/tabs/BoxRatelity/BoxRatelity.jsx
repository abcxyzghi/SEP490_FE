import React from 'react'

export default function BoxRatelity({ mysteryBoxDetail }) {
  if (!mysteryBoxDetail || !mysteryBoxDetail.products) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h2>Box Rarity & Chances</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {mysteryBoxDetail.products.map(product => (
          <div key={product.productId} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '12px', width: '220px', textAlign: 'center' }}>
            <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${product.urlImage}`} alt={product.productName} style={{ width: '100%', height: '120px', objectFit: 'cover', marginBottom: '8px' }} />
            <div><strong>Rarity:</strong> {product.rarityName}</div>
            <div><strong>Chance:</strong> {product.chance}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}
