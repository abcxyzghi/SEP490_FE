/* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from 'react';
// import "./ProductDetailpage.css";
// import { useParams } from 'react-router-dom';
// import { getProductOnSaleDetail, buyProductOnSale } from '../../../services/api.product';
// import { fetchUserInfo } from '../../../services/api.auth';
// import { useDispatch } from 'react-redux';
// import { setUser } from '../../../redux/features/authSlice';
// import { getAllRatingsBySellProduct } from '../../../services/api.comment';
// import Rating from '@mui/material/Rating';
// import CommentSection from '../../libs/CommentSection/CommentSection';

// export default function ProductDetailpage() {
//   const dispatch = useDispatch();
//   // Handle instant pay
//   const handlePayInstant = async () => {
//     const result = await buyProductOnSale({ sellProductId: product.id, quantity: 1 });
//     if (result?.status) {
//       // Refetch user info to update wallet amount
//       const token = localStorage.getItem('token');
//       if (token) {
//         const res = await fetchUserInfo(token);
//         if (res.status && res.data) {
//           dispatch(setUser(res.data));
//         }
//       }
//       alert(result.data?.message || 'Buy product on sale successfully!');
//     } else {
//       alert(result?.error || 'Failed to buy product on sale.');
//     }
//   };
//   const { id } = useParams();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [ratings, setRatings] = useState([]);
//   const [ratingsLoading, setRatingsLoading] = useState(true);


//   const fetchDetail = async () => {
//     const result = await getProductOnSaleDetail(id);
//     if (result && result.status) {
//       setProduct(result.data);
//     }
//     setLoading(false);
//   };


//   const fetchRatings = async () => {
//     setRatingsLoading(true);
//     try {
//       const result = await getAllRatingsBySellProduct(id);
//       if (result && result.status) {
//         setRatings(result.data);
//       } else {
//         setRatings([]);
//       }
//     } catch (error) {
//       setRatings([]);
//     }
//     setRatingsLoading(false);
//   };

//   useEffect(() => {
//     fetchDetail();
//   }, [id]);

//   useEffect(() => {
//     fetchRatings();
//   }, [id]);

//   // Calculate average rating
//   const averageRating =
//     ratings.length > 0
//       ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
//       : 0;

//   if (loading) {
//     return <div className="flex justify-center items-center min-h-screen">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//     </div>;
//   }

//   if (!product) {
//     return <div className="text-center mt-10 text-red-500">Product not found or error loading data.</div>;
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Product image and information display */}
//       <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
//         <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${product.urlImage}`} alt={product.name} className="w-full h-64 object-cover rounded mb-4" />
//         <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
//         <p className="text-xl font-bold text-green-600 mb-4">{(product.price / 1000).toFixed(3)} VND</p>
//         <button
//           className="oxanium-bold"
//           style={{ marginBottom: 16, padding: '10px 24px', background: '#1e90ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 18 }}
//           onClick={handlePayInstant}
//         >
//           Pay Instant
//         </button>
//         <p className="text-gray-700 mb-4">Description:{product.description}</p>
//         <p className="text-gray-700 mb-4">Quantity:{product.quantity}</p>
//         <p className="text-lg font-semibold mb-2">Topic: {product.topic}</p>
//         <p className="text-gray-500 mb-2">Seller: {product.username}</p>
//         <p className="text-lg font-semibold mb-2">Rate: {product.rateName}</p>        

//         {/* Ratings Section */}
//         <div className="mt-6">
//           <h2 className="text-xl font-bold mb-2">Ratings</h2>
//           <div className="flex items-center mb-2">
//             {[...Array(5)].map((_, i) => (
//               <span key={i} className="text-yellow-500 text-xl">
//                 {i < Math.round(averageRating) ? '★' : '☆'}
//               </span>
//             ))}
//           </div>
//           {ratingsLoading ? (
//             <div>Loading ratings...</div>
//           ) : ratings.length === 0 ? (
//             <div>No ratings yet.</div>
//           ) : (
//             <div className="space-y-2">
//               {ratings.map(rating => (
//                 <div key={rating.id} className="border rounded p-2 flex items-center justify-between">
//                   <span className="font-semibold">{rating.username}</span> 
//                   <span className="text-yellow-500 font-bold">
//                     {[...Array(5)].map((_, i) => (
//                       <span key={i}>{i < rating.rating ? '★' : '☆'}</span>
//                     ))}
//                   </span>
//                   <span className="text-xs text-gray-400">{new Date(rating.createdAt).toLocaleString()}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* REplace with actual api figure */}
//           <div className="productdetailP-boxReview-container oxanium-light">
//             <span className='oxanium-semibold'>146</span> Reviews:
//             <span className="productdetailP-rating-responsive">
//               <Rating
//                 name="read-only"
//                 value={3.2}
//                 precision={0.1}
//                 readOnly
//                 size="small"
//                 sx={{
//                   fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1rem', lg: '1rem' },
//                   '& .MuiRating-iconFilled': {
//                     color: '#FFD700',
//                   },
//                   '& .MuiRating-iconEmpty': {
//                     color: '#666666',
//                   },
//                 }}
//               />
//             </span>
//           </div>
//       </div>


//       {/* Comment Section */}
//       <div className="max-w-2xl mx-auto mt-8">
//         <h2 className="text-2xl font-bold mb-4">Comments</h2>
//         <CommentSection sellProductId={product.id} />
//       </div>
//     </div>
//   )
// }


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
import { PATH_NAME } from '../../../router/Pathname';
import Rating from '@mui/material/Rating';
import CommentSection from '../../libs/CommentSection/CommentSection';
import MessageModal from '../../libs/MessageModal/MessageModal';
//import icons
import AddQuantity from "../../../assets/Icon_line/add-01.svg";
import ReduceQuantity from "../../../assets/Icon_line/remove-01.svg";

export default function ProductDetailpage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const [quantity, setQuantity] = useState(1);
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1)); // không giảm dưới 1
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
    if (!user || user.role !== 'user') {
      return showModal('warning', 'Unauthorized', "You're not permitted to execute this action");
    }

    if (user.wallet_amount < product.price * quantity) {
      return showModal('warning', 'Currency Crunch', 'You do not have enough currency');
    }

    if (quantity > product.quantity) {
      return showModal('warning', 'Quantity Error', 'You cannot buy more than the available stock.');
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
    if (!user || user.role !== 'user') {
      return showModal('warning', 'Unauthorized', "You're not permitted to execute this action");
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

  if (loading) {
    return (
      <div className="productdetailP-container mx-auto my-21 px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="flex w-full gap-3 flex-col lg:flex-row pb-8">
          {/* Image skeleton */}
          <div className="productdetailP-image-wrapper">
            <div className="skeleton w-full h-90 rounded-lg bg-slate-300" />
          </div>
          <div className="productdetailP-info-content">
            {/* Review bar skeleton */}
            <div className="productdetailP-boxReview-container oxanium-light">
              <div className="skeleton h-5 w-full rounded bg-slate-300" />
            </div>
            {/* Title and price skeleton */}
            <div className="productdetailP-info-wrapper mt-5 mb-10">
              <div className="skeleton h-10 w-2/3 mb-4 rounded bg-slate-300" />
              <div className="skeleton h-7 w-1/3 rounded bg-slate-300" />
            </div>
            {/* Quantity and buy button skeleton */}
            <div className="productdetailP-quantyNbuy-container">
              <div className="productdetailP-quantity-measure">
                <div className="skeleton h-10 w-10 rounded-r bg-slate-300" />
                <div className="skeleton h-10 w-30 bg-slate-300" />
                <div className="skeleton h-10 w-10 rounded-l bg-slate-300" />
              </div>
              <div className="productdetailP-buyDropdown-container">
                <div className="skeleton h-10 w-50 ml-6 rounded bg-slate-300" />
              </div>
            </div>
          </div>
        </div>
        {/* Tabs skeleton */}
        <div className="tabs-switcher-section flex flex-col gap-3 mt-8">
          <div className="skeleton h-10 w-32 rounded bg-slate-300" />
          <div className="skeleton h-40 w-full rounded bg-slate-300" />
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center mt-10 text-red-500">Product not found or error loading data.</div>;
  }

  return (
    <div className="productdetailP-container mx-auto my-21 px-4 sm:px-8 md:px-12 lg:px-22">
      {/* Product image and information display */}
      <div className="flex w-full gap-2 flex-col lg:flex-row pb-8">
        <div className="productdetailP-image-wrapper">
          <div className="productdetailP-box-imgBG">
            <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${product.urlImage}`} alt={`${product.name} background`} />
          </div>
          <div className="productdetailP-box-img-wrapper">
            <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${product.urlImage}`} alt={product.name}
              className="productdetailP-box-img" />
          </div>
        </div>

        <div className="productdetailP-info-content">
          {/* Ratings Section */}
          <div className="productdetailP-boxReview-container oxanium-light">
            <span className='oxanium-semibold'>{ratings.length}</span> Reviews:
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

          {/* Title + Price + Stock quantity*/}
          <div className="productdetailP-info-wrapper mb-10">
            <h1 className="productdetailP-box-title oleo-script-bold">{product.name}</h1>
            <p className="productdetailP-box-prize oxanium-bold">{(product.price / 1000).toFixed(3)} VND</p>
          </div>

          <div className="productdetailP-quantyNbuy-container">
            {/* Quantity toggle section */}
            <div className="productdetailP-quantity-measure">
              <div className="productdetailP-quantity-iconWrapper-left" onClick={decreaseQuantity} style={{ cursor: "pointer" }} >
                <img src={ReduceQuantity} alt="-" className="productdetailP-quantity-icon" />
              </div>
              <div className="productdetailP-quantity-text oxanium-regular">
                {/* Replace with dynamic api number (default = 1) */}
                {quantity}
              </div>
              <div className="productdetailP-quantity-iconWrapper-right" onClick={increaseQuantity}
                style={{ cursor: "pointer" }}>
                <img src={AddQuantity} alt="+" className="productdetailP-quantity-icon" />
              </div>
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
                  // Exchange handle here
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

          <p className="text-gray-700 my-2">Description: {product.description}</p>
          <p className="text-gray-700 my-2">Quantity: {product.quantity}</p>
          <p className="text-lg font-semibold my-2">Topic: {product.topic}</p>
          <p className="text-gray-500 my-2">Seller: {product.username}</p>
          <p className="text-lg font-semibold my-2">Rate: {product.rateName}</p>
        </div>
      </div>

      {/* Message Modal */}
      <MessageModal
        open={modal.open}
        onClose={() => setModal(prev => ({ ...prev, open: false }))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />

      {/* Comments */}
      <div className="max-w-2xl mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        <CommentSection sellProductId={product.id} />
      </div>
    </div>
  );
}
