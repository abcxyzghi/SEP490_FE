
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserBox.css';
import { getAllBoxOfProfile, openUserBox } from '../../../services/api.user';
import DetailArrow from '../../../assets/Icon_line/Chevron_Up.svg';

const PAGE_SIZE = 8;

export default function UserBox() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [openingBoxId, setOpeningBoxId] = useState(null);
  const [error, setError] = useState(null);
  const [openResult, setOpenResult] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const res = await getAllBoxOfProfile();
        if (res.status) {
          setBoxes(res.data);
        } else {
          setBoxes([]);
          setError('Failed to fetch boxes');
        }
      } catch {
        setBoxes([]);
        setError('Error fetching boxes');
      }
      setLoading(false);
    };
    fetchBoxes();
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleOpenBox = async (boxId) => {
    setOpeningBoxId(boxId);
    setOpenResult(null);
    try {
      const res = await openUserBox(boxId);
      if (res.status) {
        setOpenResult(res.data);
        // Optionally, update box quantity in UI
        setBoxes(prev => prev.map(box => box.id === boxId ? { ...box, quantity: box.quantity - 1 } : box));
      } else {
        setOpenResult({ error: 'Failed to open box' });
      }
    } catch {
      setOpenResult({ error: 'Error opening box' });
    }
    setOpeningBoxId(null);
  };

  // Skeleton loading
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 p-4">
        {[...Array(PAGE_SIZE)].map((_, index) => (
          <div key={index} className="flex justify-center w-full flex-col gap-4">
            <div className="skeleton h-42 w-full bg-gray-700/40"></div>
            <div className="skeleton h-4 w-28 bg-gray-700/40"></div>
            <div className="skeleton h-4 w-full bg-gray-700/40"></div>
            <div className="skeleton h-4 w-full bg-gray-700/40"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-6">{error}</div>;
  }

  const visibleBoxes = boxes.slice(0, visibleCount);
  const isEnd = visibleCount >= boxes.length || visibleCount >= 16;

  return (
    <div className="userBox-card-list-container">
      <div className="userBox-card-grid">
        {visibleBoxes.map((item, index) => {
          const isExpanded = expandedCardIndex === index;
          return (
            <div
              className={`userBox-card-item ${isExpanded ? 'userBox-card-item--expanded' : ''}`}
              key={item.id}
              onMouseEnter={() => setExpandedCardIndex(index)}
              onMouseLeave={() => setExpandedCardIndex(null)}
            >
              <div className="userBox-card-background">
                <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${item.urlImage}`} alt={`${item.boxTitle} background`} />
              </div>
              <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${item.urlImage}`} alt={item.boxTitle} className="userBox-card-image" />
              <div
                className={`userBox-card-overlay ${isExpanded ? 'userBox-card-overlay--expanded' : ''}`}
                style={{
                  transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
                  maxHeight: isExpanded ? '300px' : '60px',
                  opacity: isExpanded ? 1 : 0.85,
                  overflow: 'hidden',
                }}
              >
                <div className="userBox-card-toggle">
                  <img src={DetailArrow} style={{ width: '16px', height: '16px', transition: 'transform 0.3s' }} className={isExpanded ? 'rotate-180' : ''} />
                </div>
                <div
                  className="userBox-card-slide-content"
                  style={{
                    transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
                    transform: isExpanded ? 'translateY(0)' : 'translateY(30px)',
                    opacity: isExpanded ? 1 : 0,
                    pointerEvents: isExpanded ? 'auto' : 'none',
                  }}
                >
                  {isExpanded && (
                    <>
                      <div className="userBox-card-title oxanium-bold">
                        {item.boxTitle}
                      </div>
                      <div className="userBox-card-quantity oxanium-bold">Qty: {item.quantity}</div>
                      <div className="userBox-card-actions">
                        <button
                          className="userBox-view-button"
                          onClick={() => navigate(`/boxdetailpage/${item.boxId}`)}
                        >
                          <span className="userBox-view-button-text oleo-script-bold">View Detail</span>
                        </button>
                        <button
                          className={`userBox-open-button oleo-script-bold ${openingBoxId === item.id ? 'opacity-70 cursor-not-allowed disabled' : ''}`}
                          disabled={item.quantity === 0 || openingBoxId === item.id}
                          onClick={() => handleOpenBox(item.id)}
                        >
                          {openingBoxId === item.id ? (
                            <span className="loading loading-bars loading-md"></span>
                          ) : (
                            <span className="userBox-open-button-text oleo-script-bold">Open</span>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {boxes.length === 0 && (
        <div className="text-center text-gray-400 mt-6">No boxes to display yet.</div>
      )}

      {isEnd ? (
        <div className="userBox-end-content oxanium-semibold divider divider-warning">
          End of content
        </div>
      ) : (
        <button
          className="userBox-loadmore-button oxanium-semibold"
          onClick={() => setVisibleCount(count => Math.min(count + PAGE_SIZE, 16, boxes.length))}
        >
          Load more
        </button>
      )}

      {openResult && (
        <div className="userBox-open-result" style={{ marginTop: 16 }}>
          {openResult.error ? (
            <span style={{ color: 'red' }}>{openResult.error}</span>
          ) : (
            <div>
              <h4>Box Opened!</h4>
              <div><strong>Product:</strong> {openResult.productName}</div>
              <div><strong>Rarity:</strong> {openResult.rarity}</div>
              <img
                src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${openResult.urlImage}`}
                alt={openResult.productName}
                className="userBox-open-result-image"
                style={{ maxWidth: 300, display: 'block', marginTop: 8 }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

