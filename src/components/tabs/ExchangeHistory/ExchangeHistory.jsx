import React, { useEffect, useState } from 'react';
import { getBuyer, getReceive, ExchangeAccept, ExchangeReject, ExchangeCancel } from '../../../services/api.exchange';


export default function ExchangeHistory() {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // id for sent cancel
  const [actionError, setActionError] = useState(null);
  const [receivedAction, setReceivedAction] = useState({ id: null, type: null }); // {id, type: 'accept'|'reject'}
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

  // Cancel request (for sent)
  const handleCancel = async (id) => {
    setActionLoading(id);
    setActionError(null);
    try {
      const res = await ExchangeCancel(id);
      alert('Cancel response: ' + JSON.stringify(res));
      setSent((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: 2 } : req
        )
      );
    } catch (err) {
      alert('Cancel error: ' + err);
      setActionError('Cancel failed');
    } finally {
      setActionLoading(null);
    }
  };

  // Accept request (for received)
  const handleAccept = async (id) => {
    setReceivedAction({ id, type: 'accept' });
    setActionError(null);
    try {
      const res = await ExchangeAccept(id);
      alert('Accept response: ' + JSON.stringify(res));
      setReceived((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: 4 } : req
        )
      );
    } catch (err) {
      alert('Accept error: ' + err);
      setActionError('Accept failed');
    } finally {
      setReceivedAction({ id: null, type: null });
    }
  };

  // Reject request (for received)
  const handleReject = async (id) => {
    setReceivedAction({ id, type: 'reject' });
    setActionError(null);
    try {
      const res = await ExchangeReject(id);
      alert('Reject response: ' + JSON.stringify(res));
      setReceived((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: 3 } : req
        )
      );
    } catch (err) {
      alert('Reject error: ' + err);
      setActionError('Reject failed');
    } finally {
      setReceivedAction({ id: null, type: null });
    }
  };

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
              {/* Render iamgeItemRecive for sent requests */}
              {req.iamgeItemRecive && (
                <div style={{ marginBottom: 8 }}>
                  <b>Goal:</b>
                  <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${req.iamgeItemRecive}`} alt="item to receive" style={{ width: 60, height: 60, objectFit: 'cover', marginLeft: 8, borderRadius: 8, border: '1px solid #ccc' }} />
                </div>
              )}
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
              {/* Cancel button for sent requests if status is Pending */}
              {req.status === 1 && (
                <button
                  onClick={() => handleCancel(req.id)}
                  disabled={actionLoading === req.id}
                  style={{ marginTop: 8, background: '#f44336', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4 }}
                >
                  {actionLoading === req.id ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
              {actionError && actionLoading === req.id && (
                <div style={{ color: 'red', marginTop: 4 }}>{actionError}</div>
              )}
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
              {/* Render iamgeItemRecive for received requests */}
              {req.iamgeItemRecive && (
                <div style={{ marginBottom: 8 }}>
                  <b>Your product:</b>
                  <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${req.iamgeItemRecive}`} alt="item to receive" style={{ width: 60, height: 60, objectFit: 'cover', marginLeft: 8, borderRadius: 8, border: '1px solid #ccc' }} />
                </div>
              )}
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
              {/* Accept/Reject buttons for received requests if status is Pending */}
              {req.status === 1 && (
                <div style={{ marginTop: 8 }}>
                  <button
                    onClick={() => handleAccept(req.id)}
                    disabled={receivedAction.id === req.id && receivedAction.type === 'accept'}
                    style={{ background: '#4caf50', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, marginRight: 8 }}
                  >
                    {receivedAction.id === req.id && receivedAction.type === 'accept' ? 'Accepting...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={receivedAction.id === req.id && receivedAction.type === 'reject'}
                    style={{ background: '#f44336', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4 }}
                  >
                    {receivedAction.id === req.id && receivedAction.type === 'reject' ? 'Rejecting...' : 'Reject'}
                  </button>
                  {actionError && receivedAction.id === req.id && (
                    <div style={{ color: 'red', marginTop: 4 }}>{actionError}</div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
