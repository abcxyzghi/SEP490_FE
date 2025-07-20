import React, { useEffect, useState } from 'react';
import { getBuyer, getReceive } from '../../../services/api.exchange';


export default function ExchangeHistory() {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const STATUS_MAP = {
  1: 'Pending',
  2: 'Cancel',
  3: 'Reject',
  4: 'Finish/Success',
};
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sentRes, receivedRes] = await Promise.all([
          getBuyer(),
          getReceive(),
        ]);
        setSent(Array.isArray(sentRes) ? sentRes : [sentRes]);
        setReceived(Array.isArray(receivedRes) ? receivedRes : [receivedRes]);
      } catch (err) {
        setError('Failed to fetch exchange history');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Exchange Requests You Sent</h2>
      {sent.length === 0 ? <div>No sent requests.</div> : (
        <ul>
          {sent.map((req) => (
            <li key={req.id} style={{ marginBottom: 16, border: '1px solid #eee', padding: 8 }}>
              <div><b>Status:</b> {STATUS_MAP[req.status] || req.status}</div>
              <div><b>Date:</b> {new Date(req.datetime).toLocaleString()}</div>
              <div><b>Products:</b>
                <ul>
                  {req.products?.map((p) => (
                    <li key={p.productExchangeId}>
                      <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${p.image}`} alt="product" style={{ width: 40, height: 40, objectFit: 'cover', marginRight: 8 }} />
                      x{p.quantityProductExchange}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2>Exchange Requests You Received</h2>
      {received.length === 0 ? <div>No received requests.</div> : (
        <ul>
          {received.map((req) => (
            <li key={req.id} style={{ marginBottom: 16, border: '1px solid #eee', padding: 8 }}>
              <div><b>Status:</b> {STATUS_MAP[req.status] || req.status}</div>
              <div><b>Date:</b> {new Date(req.datetime).toLocaleString()}</div>
              <div><b>Products:</b>
                <ul>
                  {req.products?.map((p) => (
                    <li key={p.productExchangeId}>
                      <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${p.image}`} alt="product" style={{ width: 40, height: 40, objectFit: 'cover', marginRight: 8 }} />
                      x{p.quantityProductExchange}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
