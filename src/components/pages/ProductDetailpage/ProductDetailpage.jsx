/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import "./ProductDetailpage.css";
import { useParams, useNavigate } from 'react-router-dom';
import { getProductOnSaleDetail, buyProductOnSale } from '../../../services/api.product';
import { addToCart } from '../../../services/api.cart';
import { fetchUserInfo } from '../../../services/api.auth';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../../redux/features/authSlice';
import { addItemToCart } from '../../../redux/features/cartSlice';
import { getAllRatingsBySellProduct } from '../../../services/api.comment';
import { Pathname, PATH_NAME } from '../../../router/Pathname';
import { createReport } from '../../../services/api.user';
import Rating from '@mui/material/Rating';
import CommentSection from '../../libs/CommentSection/CommentSection';
import MessageModal from '../../libs/MessageModal/MessageModal';
//import asset
import AddQuantity from "../../../assets/Icon_line/add-01.svg";
import ReduceQuantity from "../../../assets/Icon_line/remove-01.svg";
import ProfileHolder from "../../../assets/others/mmbAvatar.png";
import ReportIcon from "../../../assets/Icon_line/warning-error.svg";
import MessageIcon from "../../../assets/Icon_fill/comment_fill.svg";

export default function ProductDetailpage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const { id } = useParams();
  const currentUserId = user?.user_id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);

  //=========================================================Dạ nhớ style cái cái report modal cho đẹp nha======================================
  // Product report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // User report modal state
  const [showUserReportModal, setShowUserReportModal] = useState(false);
  const [userReportTitle, setUserReportTitle] = useState('');
  const [userReportContent, setUserReportContent] = useState('');
  const [userReportSubmitting, setUserReportSubmitting] = useState(false);

  const increaseQuantity = () => {
    setQuantity(prev => (prev < product.quantity ? prev + 1 : prev)); // không tăng quá giới hạn stock
  };

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1)); // không giảm dưới 1
  };

  const formatFullWithDots = (num) => {
    return Number(num).toLocaleString('de-DE'); // Ex: 9.000.000
  };

  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  const fetchDetail = async () => {
    const result = await getProductOnSaleDetail(id);
    if (result && result.status) {
      setProduct(result.data);
    }
    setLoading(false);
  };

  const fetchRatings = async () => {
    setRatingsLoading(true);
    try {
      const result = await getAllRatingsBySellProduct(id);
      if (result && result.status) {
        setRatings(result.data);
      } else {
        setRatings([]);
      }
    } catch (error) {
      setRatings([]);
    }
    setRatingsLoading(false);
  };

  useEffect(() => {
    fetchDetail();
    fetchRatings();
  }, [id]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

  // Handle instant pay
  const handlePayInstant = async () => {
    // ❗️Prevent unsigned user commit action
    if (!user || user.role !== 'user') {
      return showModal('warning', 'Unauthorized', "You're not permitted to execute this action");
    }
    // ❗️Prevent seller from buying their own product
    if (product.userId === user.user_id) {
      // return showModal('warning', 'Action Not Allowed', "You cannot purchase your own product.");
      return showModal('warning', 'Action Not Allowed', "Nuh uh, I don't think so >:)");
    }
    // ❗️Prevent user cheating currency imbalance 
    if (user.wallet_amount < product.price * quantity) {
      return showModal('warning', 'Currency Crunch', 'You do not have enough currency');
    }
    // ❗️Prevent user from buying what more seller have in stock
    if (quantity > product.quantity) {
      return showModal('warning', 'Quantity Error', 'You cannot buy more than what is available in stock');
    }

    setLoadingBtn(true);
    try {
      const result = await buyProductOnSale({ sellProductId: product.id, quantity: quantity });
      if (result?.status) {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await fetchUserInfo(token);
          if (res.status && res.data) {
            dispatch(setUser(res.data));
          }
        }

        // Determine if user just bought out the stock
        if (quantity === product.quantity) {
          showModal('default', 'Out of Stock', 'You have bought out the product quantity. You will be routed to the shop page.');
          setTimeout(() => {
            navigate(PATH_NAME.SHOP_PAGE);
          }, 2000);
        } else if (product.quantity - quantity === 0) {
          showModal('default', 'Out of Stock', 'You have bought out the product quantity. You will be routed to the shop page.');
          setTimeout(() => {
            navigate(PATH_NAME.SHOP_PAGE);
          }, 2000);
        } else {
          showModal('default', 'Success', result.data?.message || 'Product purchased successfully!');
          fetchDetail();
        }
      } else {
        showModal('error', `Error`, result.error || 'Purchase failed.');
      }
    } catch (error) {
      showModal('error', 'Oops!', 'Something went wrong while purchasing.');
    } finally {
      setLoadingBtn(false);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    // ❗️Prevent unsigned user commit action
    if (!user || user.role !== 'user') {
      return showModal('warning', 'Unauthorized', "You're not permitted to execute this action");
    }
    // ❗️Prevent seller from adding own product to cart
    if (product.userId === user.user_id) {
      return showModal('warning', 'Action Not Allowed', "You cannot add your own product to the cart.");
    }
    setLoadingBtn(true);
    try {
      await addToCart({ sellProductId: product.id, quantity });
      dispatch(addItemToCart({
        id: product.id,
        type: 'product',
        name: product.name,
        price: product.price,
        image: product.urlImage,
        quantity: quantity
      }));
      showModal('default', 'Success', 'Successfully added to cart!');
    } catch (error) {
      showModal('error', 'Error!', 'Failed to add to cart.');
      console.error(error);
    } finally {
      setLoadingBtn(false);
    }
  };



  const rarityColors = {
    Legendary: '#FFD700',
    Epic: '#A915C6',
    Rare: '#4169E1',
    Uncommon: '#32CD32',
    Common: '#A9A9A9',
  };

  const normalizeRarity = (rarity) =>
    rarity ? rarity.trim().toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : '';

  const getRateColorClass = (rarity) => {
    const normalized = normalizeRarity(rarity);
    return rarityColors[normalized] || '#A9A9A9'; // default to Common color
  };

  // Handle product report submit (limit 1 per day)
  const handleSubmitProductReport = async () => {
    if (!reportTitle || !reportContent) {
      showModal('warning', 'Missing Fields', 'Please fill in both the title and content.');
      return;
    }
    // Prevent user from reporting their own product
    if (user && product && user.user_id === product.userId) {
      showModal('warning', 'Action Not Allowed', 'You cannot report your own product.');
      setShowReportModal(false);
      return;
    }
    // Limit: only 1 report per product per user per day
    const reportKey = `lastProductReport_${user?.user_id}_${product?.id}`;
    const lastReport = localStorage.getItem(reportKey);
    const now = Date.now();
    if (lastReport && now - parseInt(lastReport, 10) < 24 * 60 * 60 * 1000) {
      showModal('warning', 'Limit Reached', 'You can only report this product once per day.');
      setShowReportModal(false);
      return;
    }
    try {
      setReportSubmitting(true);
      const res = await createReport({
        sellProductId: product.id,
        sellerId: product.userId,
        title: reportTitle,
        content: reportContent,
      });
      if (res?.success || res?.status) {
        localStorage.setItem(reportKey, now.toString());
        showModal('default', 'Report Submitted', 'Your report has been successfully sent.');
        setShowReportModal(false);
        setReportTitle('');
        setReportContent('');
      } else {
        showModal('error', 'Failed to Submit', 'The report could not be submitted (invalid response).');
      }
    } catch (err) {
      console.error('Report error:', err);
      showModal('error', 'Submission Error', 'Something went wrong. Please try again later.');
    } finally {
      setReportSubmitting(false);
    }
  };

  // Handle user (seller) report submit (limit 1 per day)
  const handleSubmitUserReport = async () => {
    if (!userReportTitle || !userReportContent) {
      showModal('warning', 'Lack of information', 'Please fill in both title and content.');
      return;
    }
    // Prevent user from reporting themselves
    if (user && product && user.user_id === product.userId) {
      setShowUserReportModal(false);
      return showModal('warning', 'Action Not Allowed', 'You cannot report yourself.');
    }
    // Limit: only 1 report per seller per user per day
    const reportKey = `lastUserReport_${user?.user_id}_${product?.userId}`;
    const lastReport = localStorage.getItem(reportKey);
    const now = Date.now();
    if (lastReport && now - parseInt(lastReport, 10) < 24 * 60 * 60 * 1000) {
      showModal('warning', 'Limit Reached', 'You can only report this user once per day.');
      setShowUserReportModal(false);
      return;
    }
    try {
      setUserReportSubmitting(true);
      const res = await createReport({
        sellProductId: "null",
        sellerId: product.userId,
        title: userReportTitle,
        content: userReportContent,
      });
      if (res?.success || res?.status) {
        localStorage.setItem(reportKey, now.toString());
        showModal('default', 'Success', 'Report submitted successfully!');
        setShowUserReportModal(false);
        setUserReportTitle('');
        setUserReportContent('');
      } else {
        showModal('error', 'Error', 'Failed to submit report.');
      }
    } catch (err) {
      console.error('Report error:', err);
      showModal('error', 'Error', 'An error occurred. Please try again.');
    } finally {
      setUserReportSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="productdetailP-container mx-auto my-21 px-4 sm:px-8 md:px-12 lg:px-22">
        <div className="flex w-full gap-3 flex-col lg:flex-row pb-8">
          {/* Image skeleton */}
          <div className="productdetailP-image-wrapper">
            <div className="skeleton w-full h-90 rounded-lg bg-gray-700/40" />
          </div>
          <div className="productdetailP-info-content">
            {/* Review bar skeleton and Product Report button */}
            <div className="productdetailP-header-info">
              <div className="productdetailP-boxReview-container oxanium-light">
                <div className="skeleton h-5 w-full rounded bg-gray-700/40" />
              </div>
              <div className="skeleton w-10 h-10 rounded-full bg-gray-700/40"></div>
            </div>
            {/* Title and price skeleton */}
            <div className="productdetailP-info-wrapper mt-5 mb-10">
              <div className="skeleton h-10 w-2/3 mb-4 rounded bg-gray-700/40" />
              <div className="skeleton h-7 w-1/3 rounded bg-gray-700/40" />
            </div>
            {/* Quantity and buy button skeleton */}
            <div className="productdetailP-quantyNbuy-container">
              <div className="productdetailP-quantity-measure">
                <div className="skeleton h-10 w-10 rounded-r bg-gray-700/40" />
                <div className="skeleton h-10 w-30 bg-gray-700/40" />
                <div className="skeleton h-10 w-10 rounded-l bg-gray-700/40" />
              </div>
              <div className="productdetailP-buyDropdown-container">
                <div className="skeleton h-10 w-50 ml-6 rounded bg-gray-700/40" />
              </div>
            </div>
          </div>
        </div>
        {/* Seller profile skeleton */}
        <div className="productdetailP-seller-wrapper flex gap-2 flex-col lg:flex-row">
          <div className="skeleton w-18 h-18 rounded-full bg-gray-700/40"></div>
          <div className="productdetailP-seller-info">
            <div className="skeleton h-8 w-2/3 mb-4 rounded bg-gray-700/40" />
            <div className="productdetailP-seller-actions">
              <div className="skeleton h-10 w-32 rounded bg-gray-700/40" />
              <div className="skeleton h-10 w-32 rounded bg-gray-700/40" />
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (!product) {
    return <div className="text-center mt-10 text-red-500">Product not found or error loading data.</div>;
  }

  const isOwner = currentUserId === product.userId;

  if (product && product.isSell === false && !isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-2xl font-bold text-red-600 mb-4">This product is not available for viewing.</div>
        <div className="text-gray-500">The seller has removed this product from sale.</div>
      </div>
    );
  }

  return (
    <div className="productdetailP-container mx-auto my-21 px-4 sm:px-8 md:px-12 lg:px-22">
      {/* Product image and information display */}
      <div className="flex w-full gap-2 flex-col lg:flex-row flex-wrap pb-8 gap-6 sm:gap-12 md:gap-18 lg:gap-26">
        <div className="productdetailP-image-grandWrapper">
          <div className="productdetailP-image-wrapper">
            <div className="productdetailP-box-imgBG">
              <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${product.urlImage}`} alt={`${product.name} background`} />
            </div>
            <div className="productdetailP-box-img-wrapper">
              <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${product.urlImage}`} alt={product.name}
                className="productdetailP-box-img" />
            </div>
          </div>
        </div>

        <div className="productdetailP-info-content">
          {/* Ratings Section */}
          <div className="productdetailP-header-info">
            <div className="productdetailP-boxReview-container oxanium-light">
              <span className='oxanium-semibold'>{ratings.length}</span> Review(s):
              <span className="productdetailP-rating-responsive">
                <Rating
                  name="read-only"
                  value={averageRating}
                  precision={0.1}
                  readOnly
                  size="small"
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1rem', lg: '1rem' },
                    '& .MuiRating-iconFilled': { color: '#FFD700' },
                    '& .MuiRating-iconEmpty': { color: '#666666' },
                  }}
                />
              </span>
            </div>

            {/* Product Report button */}
            <div className="productdetailP-report-container oxanium-semibold">
              <button
                className="productdetailP-report-btn"
                onClick={() => {
                  if (!user || user.role !== 'user') {
                    showModal('warning', 'Unauthorized', "You're not permitted to execute this action");
                    return;
                  }
                  if (user && product && user.user_id === product.userId) {
                    showModal('warning', 'Action Not Allowed', 'You cannot report your own product.');
                  } else {
                    setShowReportModal(true);
                  }
                }}
                title={user && product && user.user_id === product.userId ? 'You cannot report your own product.' : ''}
              >
                <img src={ReportIcon} alt="Report" className="productdetailP-report-icon" />
                <span className="productdetailP-report-label">Report</span>
              </button>
            </div>
            {/* Product Report Modal */}
            {showReportModal && (
              <div className="modal2-overlay">
                <div className="modal2">
                  <h3>Gửi báo cáo sản phẩm</h3>
                  <input
                    type="text"
                    placeholder="Tiêu đề"
                    value={reportTitle}
                    onChange={e => setReportTitle(e.target.value)}
                  />
                  <textarea
                    placeholder="Nội dung"
                    value={reportContent}
                    onChange={e => setReportContent(e.target.value)}
                  />
                  <div className="modal2-actions">
                    <button onClick={handleSubmitProductReport} disabled={reportSubmitting}>
                      {reportSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                    </button>
                    <button onClick={() => setShowReportModal(false)}>Hủy</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Title + Price + Stock quantity*/}
          <div className="productdetailP-info-wrapper mb-4 sm:mb-7 lg:mb-10">
            <h1 className="productdetailP-box-title oleo-script-bold">{product.name}</h1>
            <p className="productdetailP-box-prize oxanium-bold">{`${formatFullWithDots(product.price)} VND`}</p>
          </div>

          <div className="productdetailP-quantyNbuy-container">

            <div className='productdetailP-quantyNStock-container'>
              {/* Quantity toggle section */}
              <div className="productdetailP-quantity-measure">
                <div className="productdetailP-quantity-iconWrapper-left" onClick={decreaseQuantity} style={{ cursor: "pointer" }} >
                  <img src={ReduceQuantity} alt="-" className="productdetailP-quantity-icon" />
                </div>
                <div className="productdetailP-quantity-text oxanium-regular">
                  {/* {quantity} */}
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (isNaN(value) || value < 1) {
                        setQuantity(1);
                      } else {
                        setQuantity(Math.min(value, product.quantity)); // Clamp to stock limit
                      }
                    }}
                    className="productdetailP-quantity-input"
                  />
                </div>
                <div className="productdetailP-quantity-iconWrapper-right" onClick={increaseQuantity}
                  style={{ cursor: "pointer" }}>
                  <img src={AddQuantity} alt="+" className="productdetailP-quantity-icon" />
                </div>
              </div>

              {/* Stock */}
              <p className="productdetailP-product-stock oxanium-regular text-sm lg:text-base mt-2 ml-1">
                <span className="oxanium-semibold productdetailP-stock-head">Stock left:</span> {product.quantity}
              </p>
            </div>

            {/* Buy now dropdown section */}
            <div className="productdetailP-buyDropdown-container" ref={menuRef}>
              <button
                className={`productdetailP-buyNow-button oxanium-bold ${loadingBtn ? 'opacity-70 cursor-not-allowed disabled' : ''}`}
                onClick={() => setIsOpen(prev => !prev)}
                disabled={loadingBtn}
              >
                {loadingBtn ? <span className="loading loading-bars loading-md"></span> : 'Buy now'}
              </button>
              {isOpen && (
                <ul className="productdetailP-dropdown-menu">
                  <li
                    className={`productdetailP-dropdown-item oxanium-regular ${loadingBtn ? 'disabled' : ''}`}
                    onClick={async () => {
                      setIsOpen(false);
                      await handlePayInstant();
                    }}
                  >
                    Pay instant
                  </li>
                  <li
                    className={`productdetailP-dropdown-item oxanium-regular ${loadingBtn ? 'disabled' : ''}`}
                    onClick={() => {
                      setIsOpen(false);
                      // Prevent user from exchanging their own product
                      if (user && product && user.user_id === product.userId) {
                        showModal('warning', 'Action Not Allowed', 'You cannot exchange your own product.');
                        return;
                      }
                      navigate(`/exchangepage/${product.id}`);
                    }}
                  >
                    Exchange
                  </li>
                  <li
                    className={`productdetailP-dropdown-item oxanium-regular ${loadingBtn ? 'disabled' : ''}`}
                    onClick={async () => {
                      setIsOpen(false);
                      await handleAddToCart();
                    }}
                  >
                    Add to cart
                  </li>
                </ul>
              )}
            </div>
          </div>


          {/* Additional Product Info Section */}
          <div className="productdetailP-info-extra space-y-2 mt-6">
            {/* Rate with dynamic color */}
            <p
              className="productdetailP-product-data productdetailP-info-rate oxanium-semibold"
              style={{ color: getRateColorClass(product.rateName) }}
            >
              <span className="productdetailP-product-label oxanium-regular">Rarity:</span> {normalizeRarity(product.rateName)}
            </p>

            {/* Topic */}
            <p className="productdetailP-product-data oxanium-semibold text-sm lg:text-base">
              <span className="oxanium-regular productdetailP-pData-head">Topic:</span> {product.topic}
            </p>

            {/* Description */}
            <div className="productdetailP-product-data oxanium-semibold text-sm leading-relaxed lg:text-base">
              <p className="oxanium-regular productdetailP-pData-head">Description:</p>
              <div className="description-container">
                <div
                  style={{
                    position: 'relative',
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '8px',
                    color: 'black',
                    border: '1px solid #e9ecef'
                  }}
                >
                  <p
                    style={{
                      whiteSpace: 'pre-line',
                      lineHeight: '1.5',
                      marginBottom: showFullDescription ? '15px' : '0',
                      transition: 'all 0.3s ease'
                    }}
                    className={!showFullDescription ? 'clamp-4-lines' : ''}
                  >
                    {product.description}
                  </p>


                  {(product.description.split('\n').length > 2|| product.description.length > 200) && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px',
                        marginTop: '10px',
                        backgroundColor: showFullDescription ? '#e9ecef' : '#007bff',
                        color: showFullDescription ? '#212529' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                      className="oxanium-regular hover:opacity-90"
                    >
                      {showFullDescription ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Seller Info Section */}
      <div className="productdetailP-seller-wrapper flex gap-2 flex-col lg:flex-row">
        <div className="productdetailP-profile-img avatar">
          <div className='w-16 sm:w-18 lg:w-20 rounded-full border-2 border-white relative'>
            <img
              src={
                product.userProfileImage
                  ? `https://mmb-be-dotnet.onrender.com/api/ImageProxy/${product.userProfileImage}`
                  : ProfileHolder
              }
              alt="Profile"
              className="productdetailP-seller-avatar"
            />
          </div>
        </div>

        <div className="productdetailP-seller-info">
          <div className="productdetailP-seller-nameHdr oxanium-semibold">
            Collection owner:
            <span className="productdetailP-seller-name oxanium-bold"
              onClick={() => navigate(Pathname("PROFILE").replace(":id", product.userId))}
            >
              {product.username}
            </span>
          </div>

          <div className="productdetailP-seller-actions">
            <button
              className="productdetailP-seller-btn-outline oxanium-regular"
              onClick={() => {
                if (!user || user.role !== 'user') {
                  showModal('warning', 'Unauthorized', "You're not permitted to execute this action");
                  return;
                }
                if (user && product && user.user_id === product.userId) {
                  showModal('warning', 'Action Not Allowed', 'You cannot report yourself.');
                } else {
                  setShowUserReportModal(true);
                }
              }}
              title={user && product && user.user_id === product.userId ? 'You cannot report yourself.' : ''}
            >
              <img src={ReportIcon} alt="Report" className="productdetailP-seller-rIcon" />
              Report
            </button>
            <button className="productdetailP-seller-btn-outfill oxanium-regular"
              onClick={() => {
                if (!user || user.role !== 'user') {
                  showModal('warning', 'Unauthorized', "You're not permitted to execute this action");
                  return;
                }
                // Ở đây bạn có thể thêm logic mở chatroom nếu là user hợp lệ
              }}
            >
              <img src={MessageIcon} alt="Message" className="productdetailP-seller-mIcon" />
              Message
            </button>
          </div>

          {/* User Report Modal */}
          {showUserReportModal && (
            <div className="modal2-overlay">
              <div className="modal2">
                <h3>Gửi báo cáo người bán</h3>
                <input
                  type="text"
                  placeholder="Tiêu đề"
                  value={userReportTitle}
                  onChange={e => setUserReportTitle(e.target.value)}
                />
                <textarea
                  placeholder="Nội dung"
                  value={userReportContent}
                  onChange={e => setUserReportContent(e.target.value)}
                />
                <div className="modal2-actions">
                  <button onClick={handleSubmitUserReport} disabled={userReportSubmitting}>
                    {userReportSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                  </button>
                  <button onClick={() => setShowUserReportModal(false)}>Hủy</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Comments */}
      <div className="mt-24">
        <CommentSection sellProductId={product.id} />
      </div>


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
