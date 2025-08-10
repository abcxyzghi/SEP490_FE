import React, { useEffect, useState } from 'react';
import { getOrderHistory } from '../../../services/api.order';
import { createRate, getAllRatingsBySellProduct } from '../../../services/api.comment';
import "./OrderHistory.css";
import { useSelector } from 'react-redux';
import Rating from '@mui/material/Rating';
import MessageModal from '../../libs/MessageModal/MessageModal';
import Arrow_Right from "../../../assets/Icon_line/Arrow_Right_LG.svg";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [unavailableProductIds, setUnavailableProductIds] = useState([]);
  const [expanded, setExpanded] = useState({}); // track which cards are expanded
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [ratedProductIds, setRatedProductIds] = useState([]);
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });

  const authRaw = useSelector(state => state.auth.user);
  const auth = typeof authRaw === 'string'
    ? JSON.parse(authRaw)
    : authRaw;
  const username = auth.username;

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatFullWithDots = (num) => {
    return Number(num).toLocaleString('de-DE'); // Ex: 9.000.000
  };

  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  // Đưa fetchAll ra ngoài để có thể gọi lại sau khi rate
  const fetchAll = async () => {
    setLoadingOrders(true);
    try {
      const data = await getOrderHistory();
      if (Array.isArray(data)) {
        setOrders(data);

        // unavailableProductIds
        const unavailableIds = [];
        data.forEach(order => {
          if (order.sellProductId && order.isSellSellProduct === false) {
            unavailableIds.push(order.sellProductId);
          }
        });
        setUnavailableProductIds(unavailableIds);

        // ratedProductIds
        const ratingsResults = await Promise.all(
          data.map(order =>
            getAllRatingsBySellProduct(order.sellProductId)
              .then(res => ({ sellProductId: order.sellProductId, ratings: res?.data || [] }))
          )
        );
        const ratedIds = ratingsResults
          .filter(result => result.ratings.some(r => r.username === username))
          .map(result => result.sellProductId);
        setRatedProductIds(ratedIds);
      }
    } catch (err) {
      console.error("Error fetching orders/ratings", err);
    } finally {
      setLoadingOrders(false); // stop spinner when all done
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
      // alert("⭐ Thank you for your feedback! ⭐");
      showModal('default', 'Feedback success', '⭐ Thank you for your feedback! ⭐');
      await fetchAll();
      setIsModalOpen(false);
    }
    setIsLoading(false);
  };

  // Skeleton loader
  if (loadingOrders) {
    return (
      <div className="order-history-container">
        {/* Skeleton list */}
        <div className="order-history-card-list">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="order-history-card">
              {/* Top row */}
              <div className="order-history-card-top">
                {/* Left section */}
                <div className="order-history-card-left w-full">
                  <div className="skeleton h-6 w-40 sm:w-48 md:w-56 lg:w-94 mb-2 bg-gray-700/40"></div> {/* product name */}
                  <div className="skeleton h-3 w-16 sm:w-20 md:w-24 mb-1 bg-gray-700/40"></div> {/* qty */}
                  <div className="skeleton h-3 w-24 sm:w-28 md:w-32 bg-gray-700/40"></div> {/* purchased at */}
                </div>

                {/* Right section */}
                <div className="order-history-card-right">
                  <div className="skeleton h-4 w-20 sm:w-24 md:w-28 mb-2 bg-gray-700/40"></div> {/* total amount */}
                  <div className="skeleton h-6 w-24 sm:w-28 md:w-32 bg-gray-700/40"></div> {/* rating button */}
                </div>
              </div>

              {/* Expand section */}
              <div className="order-history-expand mt-3">
                <div className="skeleton h-3 w-20 sm:w-24 md:w-28 bg-gray-700/40"></div> {/* "more details" */}
              </div>
            </div>

          ))}
        </div>
      </div>
    );
  }


  return (
    <div className='order-history-container'>
      {/* If no orders */}
      {orders.length === 0 ? (
        <div className="order-history-empty">
          <p className="order-history-empty-text oleo-script-regular">
            No orders yet.
          </p>
        </div>
      ) : (
        <>
          {/* Order History card list */}
          <div className="order-history-card-list">
            {orders.map((order, idx) => {
              const alreadyRated = ratedProductIds.includes(order.sellProductId);
              const isAvailable = !unavailableProductIds.includes(order.sellProductId);
              const isValidType = order.type !== "Box" && order.type !== "ProductSell";

              // Type + Money
              let typeLabel = order.type;
              let typeClass = "";
              let typeClassIcon = "";
              let moneySign = "";

              if (order.type === "ProductBuy") {
                typeLabel = "Product purchased";
                typeClass = "order-history-type-buy";
                typeClassIcon = "order-history-arrow-wrapper-buy";
                moneySign = "-";  // money out
              } else if (order.type === "Box") {
                typeLabel = "Mystery box purchased";
                typeClass = "order-history-type-box";
                typeClassIcon = "order-history-arrow-wrapper-box";
                moneySign = "-"; // money out
              } else if (order.type === "ProductSell") {
                typeLabel = "Product sold";
                typeClass = "order-history-type-sell";
                typeClassIcon = "order-history-arrow-wrapper-sell";;
                moneySign = "+"; // money in
              }

              const cardId = order.transactionCode || idx;

              return (
                <div key={cardId} className="order-history-card">
                  {/* Top row */}
                  <div className="order-history-card-top">
                    {/* Left Section */}
                    <div className="order-history-card-left">
                      <h3 className="order-history-name oleo-script-bold">
                        {order.productName || order.boxName || "N/A"}
                      </h3>
                      <p className="order-history-quantity oxanium-regular">
                        Qty: {order.quantity}
                      </p>
                      <p className="order-history-date oxanium-regular">
                        Purchased At: {new Date(order.purchasedAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Right Section */}
                    <div className="order-history-card-right">
                      <div className="order-history-amount-wrapper">
                        <span className={`order-history-amount ${typeClass} oxanium-semibold`}>
                          {moneySign}
                          {`${formatFullWithDots(order.totalAmount)} VND`}
                        </span>
                        <div className={`order-history-arrow-wrapper ${typeClassIcon}`}>
                          <img
                            src={Arrow_Right}
                            alt="Arrow"
                            className={`order-history-arrow ${order.type === "ProductSell" ? "-rotate-45" : "rotate-45"
                              }`}
                          />
                        </div>
                      </div>

                      {order.type !== "Box" && (
                        <>
                          {!isAvailable ? (
                            <span className="order-history-unavailable oxanium-regular">
                              Product has been removed or does not exist
                            </span>
                          ) : isValidType ? (
                            !alreadyRated ? (
                              <button
                                className="order-history-rate-btn"
                                onClick={() => handleRateClick(order.sellProductId)}
                              >
                                Rate Us
                              </button>
                            ) : (
                              <span className="order-history-rated oxanium-regular">
                                Already Rated
                              </span>
                            )
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expand / Collapse */}
                  <div className="order-history-expand">
                    <button
                      className="order-history-expand-btn"
                      onClick={() => toggleExpand(cardId)}
                    >
                      {expanded[cardId] ? "Hide details" : "More details"}
                    </button>

                    {expanded[cardId] && (
                      <div className="order-history-expand-content">
                        <p className='oxanium-regular'>Type: <span className={`order-history-type ${typeClass} oxanium-semibold`}>{typeLabel}</span></p>
                        {order.type !== "Box" && (
                          <p className='oxanium-regular'>Seller: {order.sellerUsername}</p>
                        )}
                        <p className='oxanium-regular'>Transaction Code: {order.transactionCode}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Rating Modal */}
      {isModalOpen && (
        <div className="rating-modal-order-overlay">
          <div className="rating-modal-container">
            <div class="card__border"></div>
            <div className="rating-modal-box">
              <h3 className="rating-modal-order-title oxanium-bold">Rate Your Purchase</h3>
              {selectedProductId && (
                <p className="rating-modal-order-subtitle oleo-script-regular">
                  {orders.find(o => o.sellProductId === selectedProductId)?.productName ||
                    orders.find(o => o.sellProductId === selectedProductId)?.boxName ||
                    "N/A"}{" "}
                  from{" "}
                  {orders.find(o => o.sellProductId === selectedProductId)?.sellerUsername}
                </p>
              )}

              <>
                {/* MUI Rating */}
                <div className="rating-section">
                  <Rating
                    name="product-rating"
                    value={rating}
                    onChange={(e, newValue) => setRating(newValue)}
                    precision={1}
                    size="large"
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '1rem', md: '2rem', lg: '3rem' },
                      '& .MuiRating-iconFilled': { color: '#FFD700' },
                      '& .MuiRating-iconEmpty': { color: '#666666' },
                    }}
                  />
                </div>

                <div className="rating-modal-order-actions">
                  <button className="rating-modal-btn-cancel oxanium-regular" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button
                    className="rating-modal-btn-submit oxanium-bold"
                    onClick={handleSaveRating}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="loading loading-bars loading-md"></span>
                    ) : (
                      "Submit rating"
                    )}
                  </button>
                </div>
              </>
            </div>
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

    </div>
  );
}

