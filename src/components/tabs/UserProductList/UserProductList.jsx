// Tạo dư (maybe) nhưng đừng xóa khả năng nào đấy có thể sử dụng lại (chắc z)
import React, { useEffect, useState } from 'react'
import { getAllProductOfUserCollection } from '../../../services/api.user'

export default function UserProductList({ collectionId }) {
  const [products, setProducts] = useState([])

  useEffect(() => {
    if (!collectionId) return
    const fetchProducts = async () => {
      const res = await getAllProductOfUserCollection(collectionId)
      if (res.status && Array.isArray(res.data)) {
        setProducts(res.data)
      } else {
        setProducts([])
      }
    }
    fetchProducts()
  }, [collectionId])

  if (!collectionId) {
    return <div>No collection selected.</div>
  }

  return (
    <div>
      <h3>User Products in Collection</h3>
      {products.length === 0 ? (
        <div>No products found in this collection.</div>
      ) : (
        <ul>
          {products.map(product => (
            <li key={product.id || product._id}>{product.productName || product.name || 'Unnamed Product'}</li>
            
          ))}
        </ul>
      )}
    </div>
  )
}
