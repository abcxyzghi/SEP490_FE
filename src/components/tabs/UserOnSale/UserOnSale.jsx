import React, { useState, useEffect } from 'react';
import { getProductOnSaleDetail, TurnOnOffProductOnSale, updateSellProduct } from '../../../services/api.product';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function UserOnSale({ products, productsLoading }) {
  const [productList, setProductList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editedPrice, setEditedPrice] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const { id } = useParams();
  const user = useSelector(state => state.auth.user);
  const currentUserId = user?.user_id;
  const isOwner = currentUserId === id;
  // Khi props.products thay đổi, cập nhật vào state nội bộ
  useEffect(() => {
    if (products) {
      const filtered = isOwner
        ? products
        : products.filter((product) => product.isSell); // chỉ lấy sản phẩm đang bán nếu không phải chủ
      setProductList(filtered);
    }
  }, [products, isOwner]);

  const handleToggleSell = async (product) => {
    try {
      if (!product.isSell && product.quantity <= 0) {
        alert("Sản phẩm hết hàng, không thể bật bán lại.");
        return;
      }
      await TurnOnOffProductOnSale(product.id);

      // Cập nhật lại isSell trong local state
      setProductList((prevList) =>
        prevList.map((p) =>
          p.id === product.id ? { ...p, isSell: !p.isSell } : p
        )
      );
      alert("Đổi thành công")
    } catch (error) {
      console.error(error);
      alert('Không thể cập nhật trạng thái bán sản phẩm.');
    }
  };

  const handleOpenUpdate = async (product) => {

    const productWithDescription = await getProductOnSaleDetail(product.id);
    setSelectedProduct(product);
    setEditedPrice(product.price);
    setEditedDescription(productWithDescription.data.description);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleSave = async () => {
    try {


      await updateSellProduct({
        id: selectedProduct.id,
        description: editedDescription,
        price: editedPrice,
        updatedAt: new Date().toISOString(),
      });
      alert(`Đã cập nhật sản phẩm: ${selectedProduct.name}`);
      handleCloseModal();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lưu sản phẩm");
    }
  };


  return (
    <div style={{ marginTop: 32 }}>
      <h3>Products on Sale</h3>
      {productsLoading ? (
        <div>Loading products...</div>
      ) : productList.length === 0 ? (
        <div>No products on sale.</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
          {productList.map((product) => (
            <div
              key={product.id}
              style={{
                border: '1px solid #eee',
                borderRadius: 8,
                padding: 12,
                width: 220,
                textAlign: 'center',
                background: '#fafafa',
              }}
            >
              <img
                src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${product.urlImage}`}
                alt={product.name}
                style={{
                  width: '100%',
                  height: 120,
                  objectFit: 'cover',
                  borderRadius: 4,
                  marginBottom: 8,
                }}
              />
              <div style={{ fontWeight: 600 }}>{product.name}</div>
              <div style={{ fontWeight: 600 }}>{product.quantity}</div>
              <div style={{ color: '#888', fontSize: 14 }}>{product.topic}</div>
              <div
                style={{
                  color: '#1e90ff',
                  fontWeight: 700,
                  margin: '8px 0',
                }}
              >
                {(product.price / 1000).toFixed(3)} VND
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Status:</strong>{' '}
                <span style={{ color: product.isSell ? 'green' : 'red' }}>
                  {product.isSell ? 'On Sale' : 'Off Sale'}
                </span>
              </div>
              {isOwner && (
                <button
                  onClick={() => handleToggleSell(product)}
                  disabled={!product.isSell && product.quantity <= 0}
                  style={{
                    marginBottom: 6,
                    backgroundColor: !product.isSell && product.quantity <= 0 ? '#ccc' : '#1e90ff',
                    color: !product.isSell && product.quantity <= 0 ? '#666' : '#fff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: 4,
                    cursor: !product.isSell && product.quantity <= 0 ? 'not-allowed' : 'pointer',
                    opacity: !product.isSell && product.quantity <= 0 ? 0.6 : 1,
                  }}
                >
                  {product.isSell ? 'Turn Off' : 'Turn On'}
                </button>
              )}

              <br />
              {isOwner && (
                <button
                  onClick={() => handleOpenUpdate(product)}
                  disabled={product.isSell}
                  style={{
                    cursor: product.isSell ? 'not-allowed' : 'pointer',
                    opacity: product.isSell ? 0.5 : 1,
                  }}
                >
                  Update
                </button>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedProduct && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
          onClick={handleCloseModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: 24,
              borderRadius: 8,
              width: 400,
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            }}
          >
            <h3>Update Product</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Description:</label>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={4}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Price (VND):</label>
              <input
                type="number"
                value={editedPrice}
                onChange={(e) => setEditedPrice(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <button onClick={handleSave} style={{ marginRight: 8 }}>
              Save
            </button>
            <button onClick={handleCloseModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
