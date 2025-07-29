import React, { useEffect, useState } from 'react';
import { getOrderHistory } from '../../../services/api.order';
import { createRate, getAllRatingsBySellProduct } from '../../../services/api.comment';
import "../OrderHistory/OrderHistory.css";
import { useSelector } from 'react-redux';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [unavailableProductIds, setUnavailableProductIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [ratedProductIds, setRatedProductIds] = useState([]);
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const authRaw = useSelector(state => state.auth.user);
  const auth = typeof authRaw === 'string'
    ? JSON.parse(authRaw)
    : authRaw;

  const username = auth.username;

  // Đưa fetchAll ra ngoài để có thể gọi lại sau khi rate
  const fetchAll = async () => {
    const data = await getOrderHistory();
    if (Array.isArray(data)) {
      setOrders(data);
      // unavailableProductIds
      const unavailableIds = [];
      await Promise.all(
        data.map(async (order) => {
          if (order.sellProductId && order.isSellSellProduct === false) {
            unavailableIds.push(order.sellProductId);
          }
        })
      );
      setUnavailableProductIds(unavailableIds);

      // ratedProductIds
      const ratingsResults = await Promise.all(
        data.map(order =>
          getAllRatingsBySellProduct(order.sellProductId)
            .then(res => ({ sellProductId: order.sellProductId, ratings: res?.data || [] }))
        )
      );
      const ratedIds = ratingsResults.filter(result =>
        result.ratings.some(rating => rating.username === username)
      ).map(result => result.sellProductId);
      setRatedProductIds(ratedIds);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [username]);

  const handleRateClick = (sellProductId) => {
    setSelectedProductId(sellProductId);
    setIsModalOpen(true);
  };

  const handleSaveRating = async () => {
    if (!selectedProductId) return;
    setIsLoading(true);
    const result = await createRate({ sellProductId: selectedProductId, rating: rating })
    if (result) {
      alert("Thanks for your feedback!");
      await fetchAll();
      setIsModalOpen(false);
    }
    setIsLoading(false);
  };

  return (
    <div className='order-history-container'>
      <h2>Order History</h2>
      {orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Quantity</th>
              <th style={thStyle}>Total Amount</th>
              <th style={thStyle}>Transaction Code</th>
              <th style={thStyle}>Seller Name</th>
              <th style={thStyle}>Purchased At</th>
              <th style={thStyle}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => {
              const alreadyRated = ratedProductIds.includes(order.sellProductId);
              // Ẩn nút Rate Us nếu sản phẩm không còn bán (isSellSellProduct === false) hoặc type là 'Box' hoặc 'ProductSell'
              const isProductAvailable = !unavailableProductIds.includes(order.sellProductId) && order.type !== 'Box' && order.type !== 'ProductSell';
              return (
                <tr key={order.transactionCode || idx}>
                  <td style={tdStyle}>{order.productName || order.boxName || 'N/A'}</td>
                  <td style={tdStyle}>{order.type}</td>
                  <td style={tdStyle}>{order.quantity}</td>
                  <td style={tdStyle}>{order.totalAmount}</td>
                  <td style={tdStyle}>{order.transactionCode}</td>
                  <td style={tdStyle}>{order.sellerUsername}</td>
                  <td style={tdStyle}>{new Date(order.purchasedAt).toLocaleString()}</td>
                  <td style={tdStyle}>
                    {isProductAvailable ? (
                      !alreadyRated ? (
                        <button
                          style={buttonStyle}
                          onClick={() => handleRateClick(order.sellProductId)}
                        >
                          Rate Us
                        </button>
                      ) : (
                        <span>Already Rated</span>
                      )
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <>
          <div className="modal-order-overlay">
            <div className="modal-order">
              <h3>Rating</h3>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <span>Loading...</span>
                </div>
              ) : (
                <>
                  {/* Đánh giá từ 1 đến 5 */}
                  <div className="rating-section">
                    <label>Rating:</label>
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <label key={star} style={{ marginRight: "10px" }}>
                          <input
                            type="radio"
                            name="rating"
                            value={star}
                            checked={rating === star}
                            onChange={() => setRating(star)}
                          />
                          {star}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="modal-order-actions">
                    <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button onClick={handleSaveRating}>Save</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const thStyle = { border: '1px solid #ccc', padding: '8px' };
const tdStyle = { border: '1px solid #ccc', padding: '8px' };
const buttonStyle = {
  padding: '6px 12px',
  color: '#fff',
  backgroundColor: '#1890ff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};
