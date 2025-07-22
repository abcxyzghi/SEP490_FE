import React, { useEffect, useState } from 'react';
import { getOrderHistory } from '../../../services/api.order';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    async function fetchOrders() {
      const data = await getOrderHistory();
      if (Array.isArray(data)) setOrders(data);
    }
    fetchOrders();
  }, []);

  return (
    <div>
      <h2>Order History</h2>
      {orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Quantity</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Total Amount</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Transaction Code</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Purchased At</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={order.transactionCode || idx}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {order.productName || order.boxName || 'N/A'}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{order.quantity}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{order.totalAmount}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{order.transactionCode}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{new Date(order.purchasedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
 