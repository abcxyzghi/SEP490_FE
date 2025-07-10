import React, { useEffect, useState, useRef } from 'react';
import "./BoxDetailpage.css";
import { useParams } from 'react-router-dom';
import { getMysteryBoxDetail, buyMysteryBox } from '../../../services/api.mysterybox';
import { addToCart } from '../../../services/api.cart';
import { fetchUserInfo } from '../../../services/api.auth';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../../redux/features/authSlice';
import { addItemToCart } from '../../../redux/features/cartSlice';
import BoxInformation from '../../tabs/BoxInformation/BoxInformation'
import BoxRatelity from '../../tabs/BoxRatelity/BoxRatelity'
import SwitchTabs from '../../libs/SwitchTabs/SwitchTabs';
import MessageModal from '../../libs/MessageModal/MessageModal';
//import icons
import AddQuantity from "../../../assets/Icon_line/add-01.svg";
import ReduceQuantity from "../../../assets/Icon_line/remove-01.svg";


export default function BoxDetailpage() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const { id } = useParams();
  const [box, setBox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });
  const [activeTab, setActiveTab] = useState('Information');
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const menuRef = useRef(null);

  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };


  // Fetch box details
  const fetchDetail = async () => {
    const result = await getMysteryBoxDetail(id);
    if (result && result.status) {
      setBox(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Handle add to cart
  // const handleAddToCart = async () => {
  //   try {
  //     await addToCart({ mangaBoxId: box.id });
  //     dispatch(addItemToCart({
  //       id: box.id,
  //       type: 'box',
  //       name: box.mysteryBoxName,
  //       price: box.mysteryBoxPrice,
  //       image: box.urlImage,
  //       quantity: 1
  //     }));
  //     alert('✅ Added to cart!');
  //   } catch (error) {
  //     alert('❌ Failed to add to cart.');
  //     console.error(error);
  //   }
  // };
  const handleAddToCart = async () => {
    if (!user || user.role !== 'user') {
      return showModal('warning', 'Unauthorized', "You're not permitted to execute this action");
    }

    setLoadingBtn(true);
    try {
      await addToCart({ mangaBoxId: box.id, quantity });
      dispatch(addItemToCart({
        id: box.id,
        type: 'box',
        name: box.mysteryBoxName,
        price: box.mysteryBoxPrice,
        image: box.urlImage,
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


  // Close dropdown on outside click
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
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1)); // không giảm dưới 1
  };

  if (loading) {
    return (
      <div className="boxdetailP-container mx-auto my-21 px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="flex w-full gap-3 flex-col lg:flex-row pb-8">
          {/* Image skeleton */}
          <div className="boxdetailP-image-wrapper">
            <div className="skeleton w-full h-90 rounded-lg bg-slate-300" />
          </div>
          <div className="boxdetailP-info-content">
            {/* Title and price skeleton */}
            <div className="boxdetailP-info-wrapper mt-5 mb-10">
              <div className="skeleton h-10 w-2/3 mb-4 rounded bg-slate-300" />
              <div className="skeleton h-7 w-1/3 rounded bg-slate-300" />
            </div>
            {/* Quantity and buy button skeleton */}
            <div className="boxdetailP-quantyNbuy-container">
              <div className="boxdetailP-quantity-measure">
                <div className="skeleton h-10 w-10 rounded-r bg-slate-300" />
                <div className="skeleton h-10 w-30 bg-slate-300" />
                <div className="skeleton h-10 w-10 rounded-l bg-slate-300" />
              </div>
              <div className="boxdetailP-buyDropdown-container">
                <div className="skeleton h-10 w-50 ml-6 rounded bg-slate-300" />
              </div>
            </div>
          </div>
        </div>
        {/* Tabs skeleton */}
        <div className="tabs-switcher-section flex flex-col mt-8">
          <div className="flex gap-4 justify-center items-center mb-4 ">
            <div className="skeleton h-10 w-32 rounded bg-slate-300" />
            <div className="skeleton h-10 w-32 rounded bg-slate-300" />
          </div>
          <div className="skeleton h-40 w-full rounded bg-slate-300" />
        </div>
      </div>
    );
  }

  if (!box) {
    return <div className="text-center mt-10 text-red-500">Box not found or error loading data.</div>;
  }

  // Handle instant pay
  // const handlePayInstant = async () => {
  //   const result = await buyMysteryBox({ mangaBoxId: box.id, quantity: 1 });
  //   if (result?.status) {
  //     // Refetch user info to update wallet amount
  //     const token = localStorage.getItem('token');
  //     if (token) {
  //       const res = await fetchUserInfo(token);
  //       if (res.status && res.data) {
  //         dispatch(setUser(res.data));
  //       }
  //     }
  //     alert(result.data?.message || 'Buy mystery box successfully!');
  //   } else {
  //     alert(result?.error || 'Failed to buy mystery box.');
  //   }
  // };
  const handlePayInstant = async () => {
    if (!user || user.role !== 'user') {
      return showModal('warning', 'Unauthorized', "You're not permitted to execute this action");
    }

    if (user.wallet_amount < box.mysteryBoxPrice) {
      return showModal('warning', 'Currency Crunch', 'You do not have enough currency');
    }

    setLoadingBtn(true);
    try {
      const result = await buyMysteryBox({ mangaBoxId: box.id, quantity: quantity });
      if (result?.status) {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await fetchUserInfo(token);
          if (res.status && res.data) {
            dispatch(setUser(res.data));
          }
        }
        showModal('default', 'Success', result.data?.message || 'Box purchased successfully!');
      } else {
        showModal('error', 'Error', result?.error || 'Purchase failed.');
      }
    } catch (error) {
      showModal('error', 'Oops!', 'Something went wrong while purchasing.');
      console.error(error);
    } finally {
      setLoadingBtn(false);
    }
  };


  return (

    <div className="boxdetailP-container mx-auto my-21 px-4 sm:px-8 md:px-12 lg:px-22">
      {/* Box image and information display */}
      <div className="flex w-full flex-col lg:flex-row pb-8">
        <div className="boxdetailP-image-wrapper">
          <div className="boxdetailP-box-imgBG">
            <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${box.urlImage}`} alt={`${box.mysteryBoxName} background`} />
          </div>

          <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${box.urlImage}`} alt={box.mysteryBoxName}
            className="boxdetailP-box-img" />
        </div>

        {/* <div className="boxdetailP-divider"></div> */}

        <div className="boxdetailP-info-content">
          {/* Title + Price + Quantity + Buy button */}
          <div className="boxdetailP-info-wrapper mb-10">
            <h1 className="boxdetailP-box-title oleo-script-bold">{box.mysteryBoxName}</h1>
            <p className="boxdetailP-box-prize oxanium-bold">{(box.mysteryBoxPrice / 1000).toFixed(3)} VND</p>

            {/* Add calculated prize when qunatity goes up */}

          </div>

          <div className="boxdetailP-quantyNbuy-container">
            <div className="boxdetailP-quantity-measure">
              <div
                className="boxdetailP-quantity-iconWrapper-left"
                onClick={decreaseQuantity}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={ReduceQuantity}
                  alt="-"
                  className="boxdetailP-quantity-icon"
                />
              </div>

              <div className="boxdetailP-quantity-text oxanium-regular">
                {quantity}
              </div>

              <div
                className="boxdetailP-quantity-iconWrapper-right"
                onClick={increaseQuantity}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={AddQuantity}
                  alt="+"
                  className="boxdetailP-quantity-icon"
                />
              </div>
            </div>

            <div className="boxdetailP-buyDropdown-container" ref={menuRef}>
              <button
                className={`boxdetailP-buyNow-button oxanium-bold ${loadingBtn ? 'opacity-70 cursor-not-allowed disabled' : ''}`}
                onClick={() => setIsOpen(prev => !prev)}
                disabled={loadingBtn}
              >
                {loadingBtn ? (
                  <span className="loading loading-bars loading-md"></span>
                ) : (
                  'Buy now'
                )}
              </button>

              {isOpen && (
                <ul className="boxdetailP-dropdown-menu">
                  <li
                    className={`boxdetailP-dropdown-item oxanium-regular ${loadingBtn ? 'disabled' : ''}`}
                    onClick={async () => {
                      setIsOpen(false);
                      await handlePayInstant();
                    }}
                  >
                    Pay instant
                  </li>
                  <li
                    className={`boxdetailP-dropdown-item oxanium-regular ${loadingBtn ? 'disabled' : ''}`}
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

      {/* Tab Switcher */}
      <div className="tabs-switcher-section">
        <SwitchTabs
          tabs={[
            {
              label: 'Information',
              content: <BoxInformation mysteryBoxDetail={box} />
            },
            {
              label: 'Ratelity',
              content: <BoxRatelity mysteryBoxDetail={box} />
            },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Comment Section */}

    </div>
  )
}
