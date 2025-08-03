import React, { useEffect, useState } from 'react';
import { getBuyer, getReceive, ExchangeAccept, ExchangeReject, ExchangeCancel } from '../../../services/api.exchange';
import { buildImageUrl } from '../../../services/api.imageproxy';
import { useSelector } from 'react-redux';
import { createFeedback, getFeedbackOfSellProduct } from '../../../services/api.feedback';
import { toast } from 'react-toastify';
import "./ExchangeHistory.css";
import { message } from 'antd';
export default function ExchangeHistory() {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [useBackupImg, setUseBackupImg] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = useSelector(state => state.auth.user);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [feedbackDetailMap, setFeedbackDetailMap] = useState({}); // Lưu chi tiết feedback
  const myId = user?.user_id;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5); // default 5
  const [selectedExchangeId, setSelectedExchangeId] = useState(null);

  // Đưa fetchData ra ngoài useEffect và bọc bằng useCallback để tránh warning
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sentRes, receivedRes] = await Promise.all([
        getBuyer(),
        getReceive(),
      ]);

      const sentArray = Array.isArray(sentRes) ? sentRes : [sentRes];
      setSent(sentArray);
      setReceived(Array.isArray(receivedRes) ? receivedRes : [receivedRes]);

      const feedbackStatusMap = {};

      const feedbackDetailTemp = {};
      for (const item of sentArray) {
        try {
          const res = await getFeedbackOfSellProduct(item.itemReciveId);
          const feedbackData = res?.data || [];
          const myFeedback = feedbackData.find((fb) => fb.userId === myId);
          feedbackStatusMap[String(item.id)] = !!myFeedback;
          if (myFeedback) {
            feedbackDetailTemp[String(item.id)] = myFeedback;
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (err) {
          console.warn(`Lỗi khi fetch feedback cho item ${item.itemReciveId}`, err);
        }
      }
      setFeedbackMap(feedbackStatusMap);
      setFeedbackDetailMap(feedbackDetailTemp);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch exchange history');
    } finally {
      setLoading(false);
    }
  }, [myId]);

  useEffect(() => {
    if (myId) {
      fetchData();
    }
  }, [myId, fetchData]);

  console.log(feedbackMap)
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
if (loading || !Object.keys(feedbackMap).length) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim()) {
      toast.error("Vui lòng nhập nội dung");
      return;
    }
    if (feedbackRating < 1 || feedbackRating > 5) {
      toast.error("Rating phải từ 1 đến 5");
      return;
    }

    try {
      await createFeedback({
        Exchange_infoId: selectedExchangeId,
        Content: feedbackContent,
        Rating: feedbackRating,
      });

      // Sau khi feedback thành công, lấy lại feedback mới nhất
      const sentItem = sent.find((item) => item.id === selectedExchangeId);
      if (sentItem) {
        const res = await getFeedbackOfSellProduct(sentItem.itemReciveId);
        const feedbackData = res?.data || [];
        const myFeedback = feedbackData.find((fb) => fb.userId === myId);
        setFeedbackMap((prev) => ({
          ...prev,
          [String(selectedExchangeId)]: true,
        }));
        if (myFeedback) {
          setFeedbackDetailMap((prev) => ({
            ...prev,
            [String(selectedExchangeId)]: myFeedback,
          }));
        }
      }

      message.success("Feedback thành công");
      setIsModalOpen(false);
    } catch {
      toast.error("Gửi feedback thất bại");
    }
  };

  console.log(sent)
  return (
    <div style={{ padding: 16, color: "white" }}>
      <h2>Exchange Requests You Sent</h2>
      {sent.length === 0 ? <div>No sent requests.</div> : (
        <ul>
          {sent.map((req) => (
            <li key={req.id} style={{ marginBottom: 16, border: '1px solid #eee', padding: 8 }}>
              <div><b>Status:</b> {STATUS_MAP[req.status] || req.status}</div>
              <div><b>Date:</b> {new Date(req.datetime).toLocaleString()}</div>
              {req.iamgeItemRecive && (
                <div style={{ marginBottom: 8 }}>
                  <b>Goal:</b>
                  <img src={buildImageUrl(req.iamgeItemRecive, useBackupImg)} onError={() => setUseBackupImg(true)} alt="item to receive" style={{ width: 60, height: 60, objectFit: 'cover', marginLeft: 8, borderRadius: 8, border: '1px solid #ccc' }} />
                </div>
              )}
              <div><b>Products:</b>
                <ul>
                  {req.products?.map((p) => (
                    <li key={p.productExchangeId}>
                      <img src={buildImageUrl(p.image, useBackupImg)} onError={() => setUseBackupImg(true)} alt="product" style={{ width: 40, height: 40, objectFit: 'cover', marginRight: 8 }} />
                      x{p.quantityProductExchange}
                    </li>
                  ))}
                </ul>
              </div>

              {req.status === 1 && (
                <button
                  onClick={() => handleCancel(req.id)}
                  disabled={actionLoading === req.id}
                  style={{ marginTop: 8, background: '#f44336', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4 }}
                >
                  {actionLoading === req.id ? 'Cancelling...' : 'Cancel'}
                </button>
              )}


              {req.status === 4 && feedbackMap[String(req.id)] && feedbackDetailMap[String(req.id)] && (
                <div style={{ marginTop: 8, background: '#222', color: '#fff', borderRadius: 4, padding: 8 }}>
                  <b>Your Feedback:</b>
                  <div style={{ marginTop: 4 }}>
                    <span style={{ color: '#ffd700' }}>Rating: {feedbackDetailMap[String(req.id)].rating} / 5</span>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <span>Content: {feedbackDetailMap[String(req.id)].content}</span>
                  </div>
                </div>
              )}

              {req.status === 4 && !feedbackMap[String(req.id)] && (
                <button
                  onClick={() => {
                    setSelectedExchangeId(req.id);
                    setIsModalOpen(true);
                  }}
                  style={{
                    marginTop: 8,
                    background: '#2196f3',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 4,
                  }}
                >
                  Feedback
                </button>
              )}

              {actionError && actionLoading === req.id && (
                <div style={{ color: 'red', marginTop: 4 }}>{actionError}</div>
              )}


            </li>
          ))}
        </ul>
      )}
      {isModalOpen && (
        <div className="modal-feedback-overlay">
          <div className="modal-feedback">
            <h3>Feedback</h3>

            <textarea
              placeholder="Nhập nội dung feedback..."
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              style={{ width: '100%', minHeight: 100 }}
            />

            <div style={{ marginTop: 12 }}>
              <label>Rating (1–5): </label>
              <input
                type="number"
                min={1}
                max={5}
                value={feedbackRating}
                onChange={(e) => setFeedbackRating(Number(e.target.value))}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <button onClick={handleSubmitFeedback} style={{ marginRight: 8 }}>
                Gửi
              </button>
              <button onClick={() => setIsModalOpen(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      <h2>Exchange Requests You Received</h2>
      {received.length === 0 ? <div>No received requests.</div> : (
        <ul>
          {received.map((req) => (
            <li key={req.id} style={{ marginBottom: 16, border: '1px solid #eee', padding: 8 }}>
              <div><b>Status:</b> {STATUS_MAP[req.status] || req.status}</div>
              <div><b>Date:</b> {new Date(req.datetime).toLocaleString()}</div>
              {req.iamgeItemRecive && (
                <div style={{ marginBottom: 8 }}>
                  <b>Your product:</b>
                  <img src={buildImageUrl(req.iamgeItemRecive, useBackupImg)} onError={() => setUseBackupImg(true)} alt="item to receive" style={{ width: 60, height: 60, objectFit: 'cover', marginLeft: 8, borderRadius: 8, border: '1px solid #ccc' }} />
                </div>
              )}
              <div><b>Products:</b>
                <ul>
                  {req.products?.map((p) => (
                    <li key={p.productExchangeId}>
                      <img src={buildImageUrl(p.image, useBackupImg)} onError={() => setUseBackupImg(true)} alt="product" style={{ width: 40, height: 40, objectFit: 'cover', marginRight: 8 }} />
                      x{p.quantityProductExchange}
                    </li>
                  ))}
                </ul>
              </div>

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
