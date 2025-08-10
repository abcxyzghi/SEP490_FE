import React, { useEffect, useState } from 'react';
import './BoxList.css';
import { useNavigate } from 'react-router-dom';
import { getAllMysteryBoxes } from '../../../services/api.mysterybox';
import DetailArrow from '../../../assets/Icon_line/Chevron_Up.svg';
import AddToCart from '../../../assets/Icon_fill/Bag_fill.svg';
import { addToCart } from '../../../services/api.cart';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '../../../redux/features/cartSlice'; // <-- Import addItemToCart
import { buildImageUrl } from '../../../services/api.imageproxy';
import MessageModal from '../../libs/MessageModal/MessageModal';

const PAGE_SIZE = 8;

export default function BoxList({ searchText, selectedSort, ascending, priceRange }) {
  const [boxes, setBoxes] = useState([]);
  const [useBackupImg, setUseBackupImg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingBtnId, setLoadingBtnId] = useState(null);
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });

  const navigate = useNavigate();
  const dispatch = useDispatch(); // <-- Add dispatch
  const user = useSelector((state) => state.auth.user);

  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  // Format currency number from "9000000" to "9M"
  const formatShortNumber = (num) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  };

 useEffect(() => {
  const fetchBoxes = async () => {
    try {
      const result = await getAllMysteryBoxes();
      if (result && result.status) {
        // 👉 Filter chỉ lấy box có status === 1
        console.log(result)
        const activeBoxes = result.data.filter(box => box.status === 1);
        setBoxes(activeBoxes);
        console.log("test active boxes",activeBoxes )
        setError(null);
      } else {
        setBoxes([]);
        setError('Failed to load mystery boxes.');
      }
    } catch {
      setBoxes([]);
      setError('Failed to load mystery boxes.');
    }
    setLoading(false);
  };

  fetchBoxes();
}, []);



  useEffect(() => {
    setVisibleCount(PAGE_SIZE); // Reset back to first page
  }, [searchText, priceRange, selectedSort, ascending]);


  // Show loading skeleton while fetching data
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

  // Check for error after loading
  if (error) {
    return <div className="text-red-500 text-center mt-6">{error}</div>;
  }

  // Filter boxes based on search text, price range
  const filteredBoxes = boxes.filter(box =>
    box.mysteryBoxName?.toLowerCase().includes(searchText.toLowerCase()) &&
    (priceRange >= 500 || box.mysteryBoxPrice / 1000 <= priceRange)
  );

  // Sort filteredBoxes based on selectedSort and ascending
  const sortedBoxes = [...filteredBoxes].sort((a, b) => {
    let valA, valB;

    switch (selectedSort) {
      case 'Price':
        valA = a.mysteryBoxPrice;
        valB = b.mysteryBoxPrice;
        break;
      case 'Name':
        valA = a.mysteryBoxName.toLowerCase();
        valB = b.mysteryBoxName.toLowerCase();
        break;
      case 'Date':
      default:
        // Use a fallback value of 0 for undefined releaseDate
        valA = new Date(a.createdAt || 0);
        valB = new Date(b.createdAt || 0);
        break;
    }

    if (valA < valB) return ascending ? -1 : 1;
    if (valA > valB) return ascending ? 1 : -1;
    return 0;
  });

  // Limit the number of visible boxes
  const visibleBoxes = sortedBoxes.slice(0, visibleCount);
  const isEnd = visibleCount >= filteredBoxes.length;
  // If no data fetched, show a message
  const noDataFetched = boxes.length === 0;
  const noSearchResults = boxes.length > 0 && filteredBoxes.length === 0;


  // Add to cart handler
  const handleAddToCart = async (boxId) => {
    if (!user || user.role !== 'user') {
      return showModal('warning', 'Unauthorized', "You're not permitted to execute this action");
    }

    setLoadingBtnId(boxId);
    try {
      await addToCart({ mangaBoxId: boxId });
      const box = boxes.find(b => b.id === boxId);
      if (box) {
        dispatch(addItemToCart({
          id: box.id,
          type: 'box',
          name: box.mysteryBoxName,
          price: box.mysteryBoxPrice,
          image: box.urlImage,
          quantity: 1
        }));
      }
      showModal('default', 'Success', 'Successfully added to cart!');
    } catch (error) {
      showModal('error', 'Error', 'Failed to add to cart.');
      console.error(error);
    } finally {
      setLoadingBtnId(null);
    }
  };

  return (
    <div className="boxList-card-list-container">
      {/* Box list main content */}
      <div className="boxList-card-grid">
        {visibleBoxes.map((item, index) => {
          const isExpanded = expandedCardIndex === index;
          const truncate = (str, n) => (str.length > n ? str.slice(0, n - 1) + '…' : str);

          return (
            <div
              className={`boxList-card-item ${isExpanded ? 'boxList-card-item--expanded' : ''}`}
              key={index}
              onMouseEnter={() => setExpandedCardIndex(index)}
              onMouseLeave={() => setExpandedCardIndex(null)}
            >
              <div className="boxList-card-background">
                <img src={buildImageUrl(item.urlImage, useBackupImg)} onError={() => setUseBackupImg(true)} alt={`${item.name} background`} />
              </div>
              <img src={buildImageUrl(item.urlImage, useBackupImg)} onError={() => setUseBackupImg(true)} alt={item.mysteryBoxName} className="boxList-card-image" />
              <div
                className={`boxList-card-overlay ${isExpanded ? 'boxList-card-overlay--expanded' : ''}`}
                onClick={() => setExpandedCardIndex(isExpanded ? null : index)}
                style={{
                  transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
                  maxHeight: isExpanded ? '300px' : '60px',
                  opacity: isExpanded ? 1 : 0.85,
                  overflow: 'hidden',
                }}
              >
                <div className="boxList-card-toggle">
                  <img src={DetailArrow} style={{ width: '16px', height: '16px', transition: 'transform 0.3s' }} className={isExpanded ? 'rotate-180' : ''} />
                </div>
                <div
                  className="boxList-card-slide-content"
                  style={{
                    transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
                    transform: isExpanded ? 'translateY(0)' : 'translateY(30px)',
                    opacity: isExpanded ? 1 : 0,
                    pointerEvents: isExpanded ? 'auto' : 'none',
                  }}
                >
                  {isExpanded && (
                    <>
                      <div className="boxList-card-title oxanium-bold">
                        {item.mysteryBoxName}
                        {/* {truncate(item.mysteryBoxName, 30)} */}
                      </div>
                      <div className="boxList-card-price oxanium-bold">{formatShortNumber(item.mysteryBoxPrice)} VND</div>
                      <div className="boxList-card-actions">
                        <button
                          className="boxList-view-button"
                          onClick={() => navigate(`/boxdetailpage/${item.id}`)}
                        >
                          <span className="boxList-view-button-text oleo-script-bold">View Detail</span>
                        </button>
                        <button
                          className={`boxList-cart-button oleo-script-bold ${loadingBtnId === item.id ? 'opacity-70 cursor-not-allowed disabled' : ''}`}
                          disabled={loadingBtnId === item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item.id);
                          }}
                        >
                          {loadingBtnId === item.id ? (
                            <span className="loading loading-bars loading-md"></span>
                          ) : (
                            <>
                              <img src={AddToCart} alt="Cart Icon" className='boxList-cart-icon' />
                              Cart
                            </>
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

      {noDataFetched && (
        <div className="text-center text-gray-400 mt-6">No boxes to display yet.</div>
      )}

      {noSearchResults && (
        <div className="text-center text-gray-400 mt-6">No boxes found for your search.</div>
      )}

      {isEnd ? (
        <div className="boxList-end-content oxanium-semibold divider divider-warning">
          End of content
        </div>
      ) : (
        <button
          className="boxList-loadmore-button oxanium-semibold"
          onClick={() => setVisibleCount(count => Math.min(count + PAGE_SIZE, filteredBoxes.length))}
        >
          Load more
        </button>
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