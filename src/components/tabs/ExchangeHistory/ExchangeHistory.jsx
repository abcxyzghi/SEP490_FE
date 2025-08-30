/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import "./ExchangeHistory.css";
import { useSelector } from "react-redux";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { getBuyer, getReceive, ExchangeAccept, ExchangeReject, ExchangeCancel } from "../../../services/api.exchange";
import { createFeedback, getFeedbackOfSellProduct } from "../../../services/api.feedback";
import * as HoverCard from "@radix-ui/react-hover-card";
import Rating from '@mui/material/Rating';
import MessageModal from "../../libs/MessageModal/MessageModal";
import ConfirmNavigateModal from "../../libs/ConfirmNavigateModal/ConfirmNavigateModal";
import { useNavigate, Link } from "react-router-dom";
import { Pathname } from "../../../router/Pathname";
import ProfileHolder from "../../../assets/others/mmbAvatar.png";
import MessageIcon from "../../../assets/Icon_fill/comment_fill.svg";

export default function ExchangeHistory() {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [useBackupImg, setUseBackupImg] = useState(false);
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ open: false, title: "", message: "", onConfirm: null });
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.auth.user);
  const [sentFeedbackMap, setSentFeedbackMap] = useState({});
  const myId = user?.user_id;
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // id for sent cancel
  const [actionError, setActionError] = useState(null);
  const [receivedAction, setReceivedAction] = useState({
    id: null,
    type: null,
  }); // {id, type: 'accept'|'reject'}
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedFeedbackExchangeId, setSelectedFeedbackExchangeId] = useState(null);
  const [selectedFeedbackList, setSelectedFeedbackList] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [view, setView] = useState('sent'); // 'sent' or 'received'
  const navigate = useNavigate();
  const handleShowFeedbacks = async (exchangeId) => {
    try {
      const res = await getFeedbackOfSellProduct(exchangeId);
      console.log("This is test log", res);
      const feedbackData = res?.data || [];

      setSelectedFeedbackExchangeId(exchangeId);
      setSelectedFeedbackList(feedbackData);
      setIsFeedbackModalOpen(true);
    } catch (err) {
      showModal("error", "Error", err || "Unable to load feedbacks.");
    }
  };

  const STATUS_MAP = {
    1: "Pending",
    2: "Cancel",
    3: "Reject",
    4: "Finish/Success",
  };

  // helper to get status className
  const statusClass = (status) => {
    switch (status) {
      case 1: return 'exchange-history-status--pending'; // Pending
      case 2: return 'exchange-history-status--cancel';  // Cancel
      case 3: return 'exchange-history-status--reject';  // Reject
      case 4: return 'exchange-history-status--success'; // Finish/Success
      default: return '';
    }
  };

  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
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
      const receivedArray = Array.isArray(receivedRes)
        ? receivedRes
        : [receivedRes];

      setSent(sentArray);
      setReceived(receivedArray);


      const sentFeedbackMap = {};
      for (const item of sentArray) {
        if (item.status !== 4) continue;
        if (item.isFeedback) {
          try {
            const res = await getFeedbackOfSellProduct(item.itemReciveId);
            const feedbackData = res?.data || [];
            sentFeedbackMap[String(item.id)] = feedbackData;
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (err) {
            console.warn(
              `Lỗi khi fetch feedback cho sent item ${item.itemReciveId}`,
              err
            );
          }
        }
      }

      setSentFeedbackMap(sentFeedbackMap);


    } catch (err) {
      console.error(err);
      setError("Failed to fetch exchange history");
    } finally {
      setLoading(false);
    }
  }, [myId]);

  useEffect(() => {
    if (myId) {
      fetchData();
    }
  }, [myId, fetchData]);

  // Cancel request (for sent)
  const handleCancel = async (id) => {
    setActionLoading(id);
    setActionError(null);
    try {
      const res = await ExchangeCancel(id);
      // alert("Cancel response: " + JSON.stringify(res));
      showModal("default", "Cancelled", "Exchange request has been cancelled.");
      setSent((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: 2 } : req))
      );
    } catch (err) {
      setActionError("Cancel failed");
      showModal("error", "Error", "Failed to cancel the exchange request.");
    } finally {
      setActionLoading(null);
    }
  };

  // Accept request (for received)
  const handleAccept = async (id) => {
    setReceivedAction({ id, type: "accept" });
    setActionError(null);
    try {
      const res = await ExchangeAccept(id);
       // Nếu API trả về lỗi
    if (res?.errorCode === 400) {
      showModal(
        "error",
        "Exchange Failed",
        res?.message || "Failed to accept exchange request."
      );
      return;
    }

      setConfirmModal({
        open: true,
        title: "Exchange complete!",
        message: "Check out your new collection.",
        onConfirm: () => navigate(`/profilepage/${myId}`),
        onCancel: () => setConfirmModal({ ...confirmModal, open: false }),
      });

      setReceived((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: 4 } : req))
      );
      // navigate(`/profilepage/${myId}`);
    } catch (err) {
      // setActionError("Accept failed");
      // showModal("error", "Error", "Accept error: " + err);
      const serverMessage = err?.response?.data?.message || "Failed to accept exchange request.";
      showModal("error", "Error", serverMessage);
    } finally {
      setReceivedAction({ id: null, type: null });
    }
  };

  // Reject request (for received)
  const handleReject = async (id) => {
    setReceivedAction({ id, type: "reject" });
    setActionError(null);
    try {
      const res = await ExchangeReject(id);
      showModal("default", "Rejected", "Exchange request rejected.");
      setReceived((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: 3 } : req))
      );
    } catch (err) {
      setActionError("Reject failed");
      showModal("error", "Error", "Failed to reject the exchange request.");
    } finally {
      setReceivedAction({ id: null, type: null });
    }
  };

  // Handle send feedback
  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim()) {
      return showModal("warning", "Missing content", "Please enter feedback content.");
    }
    if (feedbackRating < 1 || feedbackRating > 5) {
      return showModal("warning", "Invalid rating", "Rating must be between 1 and 5.");
    }

    try {
      setFeedbackLoading(true);

      await createFeedback({
        Exchange_infoId: selectedExchangeId,
        Content: feedbackContent,
        Rating: feedbackRating,
      });

      const myFeedback = {
        userId: myId,
        rating: feedbackRating,
        content: feedbackContent,
      };

      setSentFeedbackMap((prev) => ({
        ...prev,
        [String(selectedExchangeId)]: [myFeedback],
      }));

      setSent((prev) =>
        prev.map((item) =>
          item.id === selectedExchangeId ? { ...item, isFeedback: true } : item
        )
      );

      showModal("default", "Feedback sent", "Your feedback was submitted successfully.");
      setIsModalOpen(false);
      // Reset feedback form
      setFeedbackContent("");
      setFeedbackRating(5);
    } catch (err) {
      console.error("Submit feedback failed:", err);
      showModal("error", "Error", "Failed to send feedback. Please try again later.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Skeleton loader whole section
  if (loading) {
    return (
      <div className="exchange-history-container">
        <div className="exchange-history-container-tab">
          {/* Header skeleton: title + toggle */}
          <div className="exchange-history-header">
            <div className="skeleton h-10 w-32 sm:w-36 md:w-40 lg:w-48 mb-4 bg-gray-700/40 rounded-md"></div>
          </div>

          {/* list of card skeletons */}
          <div className="exchange-history-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="exchange-history-card">
                {/* card header */}
                <div className="exchange-history-card-header">
                  <div className="exchange-history-card-top-left">
                    <div className="skeleton h-6 w-28 rounded2xl bg-gray-700/40" />
                    <div className="skeleton h-3 w-45 rounded bg-gray-700/40 mt-2" />
                    <div className="skeleton h-3 w-45 rounded bg-gray-700/40" />
                  </div>

                  <div className="exchange-history-card-actions" style={{ alignItems: 'center' }}>
                    <div className="skeleton h-8 w-20 rounded bg-gray-700/40" />
                    <div className="skeleton h-8 w-20 rounded bg-gray-700/40" />
                  </div>
                </div>

                {/* card body: goal + products */}
                <div className="exchange-history-card-body ">
                  <div className="exchange-history-products-wrapper">
                    <div className="skeleton h-4 w-30 rounded mb-2 bg-gray-700/40" />
                    <div className="exchange-history-products">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="exchange-history-product-item">
                          <div className="skeleton rounded w-16 h-16 bg-gray-700/40" />
                          <div className="skeleton rounded w-8 h-4 bg-gray-700/40" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="exchange-history-goal">
                    <div className="skeleton h-4 w-30 rounded mb-2 bg-gray-700/40" />
                    <div className="skeleton rounded w-[150px] h-[170px] bg-gray-700/40" />
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-500 mt-10 text-center text-lg oxanium-regular">{error}</div>;

  return (
    <div className="exchange-history-container">

      {/* Main content */}
      <div className="exchange-history-container-tab">
        <div className="exchange-history-header">
          {/* <h2 className="exchange-history-main-title oleo-script-bold">Exchange History</h2> */}

          {/* Toggle */}
          <div className="exchange-history-toggle oxanium-regular">
            <button
              className={`exchange-history-toggle-sent-btn ${view === 'sent' ? 'active' : ''}`}
              onClick={() => setView('sent')}
            >
              Requests Sent
            </button>
            <button
              className={`exchange-history-toggle-received-btn ${view === 'received' ? 'active' : ''}`}
              onClick={() => setView('received')}
            >
              Requests Received
            </button>
          </div>
        </div>

        {/* List wrapper */}
        <div className="exchange-history-list oxanium-regular">
          {(view === 'sent' ? sent : received).length === 0 ? (
            <div className="exchange-history-empty">No {view === 'sent' ? 'sent' : 'received'} requests.</div>
          ) : (
            (view === 'sent' ? sent : received)
              .sort((a, b) => new Date(b.datetime) - new Date(a.datetime)) // sort latest date first
              .map((req) => (
                <div key={req.id} className="exchange-history-card">
                  <div className="exchange-history-card-header">
                    <div className="exchange-history-card-top-left">
                      <div className={`exchange-history-status ${statusClass(req.status)}`}>
                        {STATUS_MAP[req.status] || req.status}
                      </div>
                      <div className="exchange-history-date">
                        <p><strong>Created:</strong> {new Date(req.datetime).toLocaleString()}</p>
                        <p><strong>Due:</strong> {new Date(req.enddate).toLocaleString()}</p>
                      </div>

                    </div>


                    {/* Actions (right) */}
                    <div className="exchange-history-card-actions">
                      {/* Sent cancel */}
                      {view === 'sent' && req.status === 1 && (
                        <button
                          className="exchange-history-btn exchange-history-btn-cancel"
                          onClick={() => handleCancel(req.id)}
                          disabled={actionLoading === req.id}
                        >
                          {actionLoading === req.id ? <span className="loading loading-bars loading-md"></span> : 'Cancel request'}
                        </button>
                      )}

                      {/* Sent feedback */}
                      {view === 'sent' && req.status === 4 && !req.isFeedback && (
                        <button
                          className="exchange-history-btn exchange-history-btn-primary"
                          onClick={() => {
                            setSelectedExchangeId(req.id);
                            setIsModalOpen(true);
                          }}
                        >
                          Feedback
                        </button>
                      )}

                      {/* Received accept/reject */}
                      {view === 'received' && req.status === 1 && (
                        <>
                          <button
                            className="exchange-history-btn exchange-history-btn-accept"
                            onClick={() => handleAccept(req.id)}
                            disabled={receivedAction.id === req.id && receivedAction.type === 'accept'}
                          >
                            {receivedAction.id === req.id && receivedAction.type === 'accept' ? <span className="loading loading-bars loading-md"></span> : 'Accept'}
                          </button>
                          <button
                            className="exchange-history-btn exchange-history-btn-reject"
                            onClick={() => handleReject(req.id)}
                            disabled={receivedAction.id === req.id && receivedAction.type === 'reject'}
                          >
                            {receivedAction.id === req.id && receivedAction.type === 'reject' ? <span className="loading loading-bars loading-md"></span> : 'Reject'}
                          </button>
                        </>
                      )}

                      {/* Show feedbacks */}
                      {req.status === 4 && (
                        <>
                          {!req.isFeedback ? (
                            <button
                              className="exchange-history-btn exchange-history-btn-secondary !cursor-default !active:scale-100"
                            >
                              No Feedbacks yet
                            </button>
                          ) : (
                            <button
                              className="exchange-history-btn exchange-history-btn-secondary"
                              onClick={() => handleShowFeedbacks(req.itemReciveId)}
                            >
                              Show Feedbacks
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="exchange-history-card-body">
                    {/* Request exchange products */}
                    <div className="exchange-history-products-wrapper">
                      {/* User name and hover info */}
                      <p className="exchange-history-user-name">
                        From:{" "}
                        <span className={`${view === "sent" ? "" : "exchange-history-user-info"}`}>
                          {view === "sent" ? (
                            "Me"
                          ) : (
                            <HoverCard.Root>
                              <HoverCard.Trigger asChild>
                                <span>{req.buyerName}</span>
                              </HoverCard.Trigger>
                              <HoverCard.Content
                                side="bottom" sideOffset={3} align="start"
                                className="exchange-history-hovercard-content"
                                forceMount
                              >
                                <div className="exchange-history-hovercard-inner">
                                  <img
                                    src={
                                      req.buyerImage
                                        ? buildImageUrl(req.buyerImage, useBackupImg)
                                        : ProfileHolder
                                    }
                                    onError={() => setUseBackupImg(true)}
                                    alt={req.buyerName}
                                    className="exchange-history-hovercard-avatar"
                                  />
                                  <div>
                                    <Link
                                      to={Pathname("PROFILE").replace(":id", req.buyerId)}
                                      className="exchange-history-hovercard-name">
                                      {req.buyerName}
                                    </Link>

                                    <button
                                      // reuse style from Profilepage
                                      className="profilepage-btn-message oxanium-semibold"
                                      onClick={() => {
                                        const targetId = view === "sent" ? req.sellerId : req.buyerId;

                                        if (!targetId) {
                                          showModal("warning", "Error", "No user found to message.");
                                          return;
                                        }

                                        navigate(`/chatroom/${targetId}`);
                                      }}
                                    >
                                      <img
                                        src={MessageIcon}
                                        alt="Message"
                                        className="profilepage-message-icon"
                                      />
                                      Message
                                    </button>
                                  </div>
                                </div>
                              </HoverCard.Content>
                            </HoverCard.Root>
                          )}
                        </span>
                      </p>

                      <div className="exchange-history-products">
                        {req.products?.map((p) => (
                          <div key={p.productExchangeId} className="exchange-history-product-item">
                            <img
                              src={buildImageUrl(p.image, useBackupImg)}
                              onError={() => setUseBackupImg(true)}
                              alt="product"
                              className="exchange-history-product-image"
                            />
                            <div className="exchange-history-product-qty">x{p.quantityProductExchange}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Goal product */}
                    <div className="exchange-history-goal">
                      <p className="exchange-history-user-name">
                        To:{" "}
                        <span className={`${view === "sent" ? "exchange-history-user-info" : ""}`}>
                          {view === "sent" ? (
                            <HoverCard.Root>
                              <HoverCard.Trigger asChild>
                                <span>{req.sellerName}</span>
                              </HoverCard.Trigger>
                              <HoverCard.Content
                                side="bottom" sideOffset={3} align="start"
                                className="exchange-history-hovercard-content"
                                forceMount
                              >
                                <div className="exchange-history-hovercard-inner">
                                  <img
                                    src={
                                      req.sellerImage
                                        ? buildImageUrl(req.sellerImage, useBackupImg)
                                        : ProfileHolder
                                    }
                                    onError={() => setUseBackupImg(true)}
                                    alt={req.sellerName}
                                    className="exchange-history-hovercard-avatar"
                                  />
                                  <div>
                                    <Link
                                      to={Pathname("PROFILE").replace(":id", req.sellerId)}
                                      className="exchange-history-hovercard-name">
                                      {req.sellerName}
                                    </Link>

                                    <button
                                      // reuse style from Profilepage
                                      className="profilepage-btn-message oxanium-semibold"
                                      onClick={() => {
                                        const targetId = view === "sent" ? req.sellerId : req.buyerId;

                                        if (!targetId) {
                                          showModal("warning", "Error", "No user found to message.");
                                          return;
                                        }

                                        navigate(`/chatroom/${targetId}`);
                                      }}
                                    >
                                      <img
                                        src={MessageIcon}
                                        alt="Message"
                                        className="profilepage-message-icon"
                                      />
                                      Message
                                    </button>
                                  </div>
                                </div>
                              </HoverCard.Content>
                            </HoverCard.Root>
                          ) : (
                            "Me"
                          )}
                        </span>
                      </p>
                      {req.iamgeItemRecive && (
                        <img
                          src={buildImageUrl(req.iamgeItemRecive, useBackupImg)}
                          onError={() => setUseBackupImg(true)}
                          alt="goal"
                          className="exchange-history-goal-image"
                        />
                      )}
                    </div>

                  </div>
                </div>
              ))
          )}
        </div>
      </div>


      {/* [POST] Feedback Modal */}
      {isModalOpen && (
        <div className="exchange-feedback-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="exchange-feedback-modal oxanium-regular"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button className="exchange-feedback-close-btn" onClick={() => setIsModalOpen(false)}>⨉</button>

            <h2 className="exchange-feedback-title oleo-script-bold">Leave Feedback</h2>

            <textarea
              className="exchange-feedback-textarea"
              placeholder="Feedback on this exchange..."
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
            />

            <div className="exchange-feedback-rating">
              <label>Rating:</label>
              <Rating
                name="feedback-rating"
                value={feedbackRating}
                onChange={(e, newValue) => setFeedbackRating(newValue)}
                precision={1}
                // max={5}
                size="small"
                sx={{
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem', lg: '1.5rem' },
                  '& .MuiRating-iconFilled': { color: '#FFD700' },
                  '& .MuiRating-iconEmpty': { color: '#666666' },
                }}
              />
            </div>

            <div className="exchange-feedback-actions">
              {/* <button
                className="exchange-feedback-btn exchange-feedback-btn-cancel"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button> */}
              <button
                className="exchange-feedback-btn exchange-feedback-btn-submit"
                onClick={handleSubmitFeedback}
                disabled={feedbackLoading}
              >
                {feedbackLoading ? <span className="loading loading-bars loading-md"></span> : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* [GET] Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="exchange-feedback-modal-overlay" onClick={() => setIsFeedbackModalOpen(false)}>
          <div
            className="exchange-feedback-modal oxanium-regular"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button className="exchange-feedback-close-btn" onClick={() => setIsFeedbackModalOpen(false)}>⨉</button>

            <h2 className="exchange-feedback-title oleo-script-bold">Feedbacks</h2>

            {selectedFeedbackList.length === 0 ? (
              <div className="exchange-feedback-empty">No feedback available.</div>
            ) : (
              <ul className="exchange-feedback-list">
                {selectedFeedbackList.map((fb, idx) => (
                  <li key={idx} className="exchange-feedback-item">
                    <div className="flex justify-between align-center mb-4">
                      <div><b>From:</b> {fb.userName}</div>
                      <div className="exchange-feedback-rating-view">
                        <Rating
                          value={fb.rating}
                          readOnly
                          precision={1}
                          max={5}
                          size="small"
                          sx={{
                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem', lg: '1.5rem' },
                            '& .MuiRating-iconFilled': { color: '#FFD700' },
                            '& .MuiRating-iconEmpty': { color: '#666666' },
                          }} />
                      </div>
                    </div>
                    <div><b>Comment:</b> <p>{fb.content}</p></div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Message Modal */}
      <MessageModal
        open={modal.open}
        onClose={() => setModal(prev => ({ ...prev, open: false }))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />

      {/* Confirm on navigate modal */}
      <ConfirmNavigateModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Take me there"
        cancelLabel="Click outside to close"
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
      />

    </div>
  );
}
