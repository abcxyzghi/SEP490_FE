import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserOnSale.css';
import DetailArrow from '../../../assets/Icon_line/Chevron_Up.svg';
import AddToCart from '../../../assets/Icon_fill/Bag_fill.svg';
import ThreeDots from '../../../assets/Icon_fill/Meatballs_menu.svg';
import { addToCart } from '../../../services/api.cart';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '../../../redux/features/cartSlice';
import MessageModal from '../../libs/MessageModal/MessageModal';
import DropdownMenu from '../../libs/DropdownMenu/DropdownMenu';

const PAGE_SIZE = 8;

export default function UserOnSale({ products, productsLoading }) {
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingBtnId, setLoadingBtnId] = useState(null);
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const buttonRef = useRef();
  const dispatch = useDispatch();
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

  // Skeleton loading
  if (productsLoading) {
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
  // if (error) {
  //   return <div className="text-red-500 text-center mt-6">{error}</div>;
  // }

  if (!products || products.length === 0) {
    return <div className="text-center text-gray-400 mt-6">No products on sale.</div>;
  }

  const visibleProducts = products.slice(0, visibleCount);
  const isEnd = visibleCount >= products.length || visibleCount >= 16;

  // Add to cart handler
  const handleAddToCart = async (productId) => {
    // ❗️Prevent unsigned user commit action
    if (!user || user.role !== 'user') {
      return showModal('warning', 'Unauthorized', "You're not permitted to execute this action");
    }

    // Find the product info for Redux
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // ❗️Prevent seller from adding own product to cart
    if (product.userId === user.user_id) {
      return showModal('warning', 'Action Not Allowed', "You cannot add your own product to the cart.");
    }

    setLoadingBtnId(productId);
    try {
      await addToCart({ sellProductId: productId });
      if (product) {
        dispatch(addItemToCart({
          id: product.id,
          type: 'product',
          name: product.name,
          price: product.price,
          image: product.urlImage,
          quantity: 1
        }));
      }

      showModal('default', 'Success', 'Successfully added to cart!');
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error || 'Failed to add to cart.';
      showModal('error', 'Error', errorMessage);
      console.error(error);
    } finally {
      setLoadingBtnId(null);
    }
  };

  return (
    <div className="userOnSale-card-list-container">
      <div className="userOnSale-card-grid">
        {visibleProducts.map((item, index) => {
          const isExpanded = expandedCardIndex === index;
          return (
            <div
              className={`userOnSale-card-item ${isExpanded ? 'userOnSale-card-item--expanded' : ''}`}
              key={item.id}
              onMouseEnter={() => setExpandedCardIndex(index)}
              onMouseLeave={() => setExpandedCardIndex(null)}
            >
              <div className="userOnSale-card-background">
                <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${item.urlImage}`} alt={`${item.name} background`} />
              </div>
              <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${item.urlImage}`} alt={item.name} className="userOnSale-card-image" />
              <div
                className={`userOnSale-card-overlay ${isExpanded ? 'userOnSale-card-overlay--expanded' : ''}`}
                style={{
                  transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
                  maxHeight: isExpanded ? '300px' : '60px',
                  opacity: isExpanded ? 1 : 0.85,
                  overflow: 'hidden',
                }}
              >
                <div className="userOnSale-card-toggle">
                  <img src={DetailArrow} style={{ width: '16px', height: '16px', transition: 'transform 0.3s' }} className={isExpanded ? 'rotate-180' : ''} />
                </div>
                <div
                  className="userOnSale-card-slide-content"
                  style={{
                    transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
                    transform: isExpanded ? 'translateY(0)' : 'translateY(30px)',
                    opacity: isExpanded ? 1 : 0,
                    pointerEvents: isExpanded ? 'auto' : 'none',
                  }}
                >
                  {isExpanded && (
                    <>
                      <div className="userOnSale-card-title oxanium-bold">{item.name}</div>
                      <div className="userOnSale-sub-info">
                        <div className="userOnSale-card-price oxanium-bold">{formatShortNumber(item.price)} VND</div>
                        <div className="userOnSale-card-quantity oxanium-bold">Qty: {item.quantity}</div>
                      </div>
                      <div className="userOnSale-card-actions">
                        <button
                          className="userOnSale-view-button"
                          onClick={() => navigate(`/productdetailpage/${item.id}`)}
                        >
                          <span className="userOnSale-view-button-text oleo-script-bold">View Detail</span>
                        </button>

                        {user && user.user_id === item.userId ? (
                          <div className="userOnSale-dropdown-container"
                            onMouseEnter={() => setIsDropdownOpen(true)}
                            onMouseLeave={() => setIsDropdownOpen(false)}
                          >
                            <button
                              ref={buttonRef}
                              className={`userOnSale-cart-button oxanium-bold ${loadingBtnId === item.id ? 'opacity-70 cursor-not-allowed disabled' : ''}`}
                              disabled={loadingBtnId === item.id}
                            >
                              {loadingBtnId === item.id ? (
                                <span className="loading loading-bars loading-md text-white"></span>
                              ) : (
                                <img src={ThreeDots} alt="More Icon" className='userOnSale-more-icon' />
                              )}
                            </button>
                            <DropdownMenu anchorRef={buttonRef} isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)}>
                              <div
                                className={`userOnSale-dropdown-item oxanium-regular ${loadingBtnId === item.id ? 'disabled' : ''}`}
                              >
                                Unpublic to sell
                              </div>
                            </DropdownMenu>
                          </div>
                        ) : (
                          <button
                            className={`userOnSale-cart-button oleo-script-bold ${loadingBtnId === item.id ? 'opacity-70 cursor-not-allowed disabled' : ''}`}
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
                                <img src={AddToCart} alt="Cart Icon" className='userOnSale-cart-icon' />
                                Cart
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isEnd ? (
        <div className="userOnSale-end-content oxanium-semibold divider divider-warning">
          End of content
        </div>
      ) : (
        <button
          className="userOnSale-loadmore-button oxanium-semibold"
          onClick={() => setVisibleCount(count => Math.min(count + PAGE_SIZE, 16, products.length))}
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
