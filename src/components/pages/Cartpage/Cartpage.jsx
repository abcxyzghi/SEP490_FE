import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { buyMysteryBox, getMysteryBoxDetail } from '../../../services/api.mysterybox';
import { buyProductOnSale, getProductOnSaleDetail } from '../../../services/api.product';
import { fetchUserInfo } from '../../../services/api.auth';
import { setUser } from '../../../redux/features/authSlice';
import { clearCart, removeItemFromCart } from '../../../redux/features/cartSlice';
import { clearAllCart, removeFromCart, updateCartQuantity } from '../../../services/api.cart';
import './Cartpage.css';
import SearchBar from '../../libs/SearchFilterSort/SearchBar';
import FilterPanel from '../../libs/SearchFilterSort/FilterPanel';
import MessageModal from '../../libs/MessageModal/MessageModal';
import ConfirmModal from '../../libs/ConfirmModal/ConfirmModal';
import SwitchTabs from '../../libs/SwitchTabs/SwitchTabs';
import CartBoxList from '../../tabs/CartBoxList/CartBoxList';
import CartProductList from '../../tabs/CartProductList/CartProductList';
import { checkIsJoinedAuction } from '../../../services/api.auction';

export default function Cartpage() {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const [priceRange, setPriceRange] = useState(500);
  const [selectedRarities, setSelectedRarities] = useState([]);
  const [activeTab, setActiveTab] = useState('Mystery Boxes');
  const [selectedItemsData, setSelectedItemsData] = useState([]);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });

  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });
  const showConfirmModal = (title, message, onConfirm = null) => {
    setConfirmModal({ open: true, title, message, onConfirm });
  };
  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, open: false }));
  };


  useEffect(() => {
    if (activeTab !== 'Collection Store') {
      setSelectedRarities([]);
    }
  }, [activeTab]);

  const totalSelectedPrice = selectedItemsData.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  // NEW: promise-based confirm helper so you can `await` user's choice
  const showConfirmPromise = (title, message) => {
    return new Promise((resolve) => {
      setConfirmModal({
        open: true,
        title,
        message,
        // resolve(true) when user confirms
        onConfirm: () => resolve(true),
        // resolve(false) when user cancels or closes
        onCancel: () => resolve(false)
      });
    });
  };

  // Buy handler for Cartpage
  const handleBuyAllSelected = async () => {
    const isJoined = await checkIsJoinedAuction();
    if (isJoined) {
      showModal(
        "warning",
        "Cannot Buy",
        "You cannot buy while participating in an auction."
      );
      return;
    }

    if (selectedItemsData.length === 0) {
      return showModal(
        "warning",
        "No Selection",
        "Please select at least one item to buy."
      );
    }

    setLoadingBtn(true);
    try {
      let boughtCount = 0;
      let isBoxTab = activeTab === "Mystery Boxes";
      let isProductTab = activeTab === "Collection Store";

      for (const item of selectedItemsData) {
        /** ===================== HANDLE BOX ===================== */
        if (isBoxTab && item.type === "box") {
          const boxDetail = await getMysteryBoxDetail(item.id);
          if (!boxDetail?.status || !boxDetail.data) {
            showModal("error", "Error", `Cannot fetch detail for box: ${item.name}`);
            continue;
          }

          // Validate end_time
          const endTime = boxDetail.data.end_time;
          if (endTime) {
            const now = new Date();
            const endDate = new Date(endTime);
            if (now > endDate) {
              showModal("error", "Expired Box", `Mystery box '${item.name}' has expired and will be removed from your cart.`);
              await removeFromCart({ mangaBoxId: item.id });
              dispatch(removeItemFromCart({ id: item.id, type: "box" }));
              continue;
            }
          }
          
          const availableQty = boxDetail.data.quantity;
          if (availableQty < item.quantity) {
            const userWantsToBuy = await showConfirmPromise(
              "Limited stock",
              `Only ${availableQty} mystery box(es) are currently available. Do you want to proceed with purchasing ${availableQty} box(es)?`
            );

            if (userWantsToBuy && availableQty > 0) {
              await updateCartQuantity({ Id: item.id, quantity: availableQty });
              dispatch({
                type: "cart/updateQuantity",
                payload: { id: item.id, type: "box", quantity: availableQty },
              });

              const result = await buyMysteryBox({
                mangaBoxId: item.id,
                quantity: availableQty,
              });
            if (result?.status) boughtCount++;
            else { 
            showModal("error", "Purchase Failed", result?.error || `Mystery box '${item.name}' is no longer available and has been removed from your cart.` );
            await removeFromCart({ mangaBoxId: item.id });
            dispatch(removeItemFromCart({ id: item.id, type: "box" }));
          }
        }
          } else {
            // đủ số lượng thì mua luôn 
            const result = await buyMysteryBox({
              mangaBoxId: item.id,
              quantity: item.quantity,
            });
            if (result?.status) boughtCount++;
            else { 
            showModal("error", "Purchase Failed", result?.error || `Mystery box '${item.name}' is no longer available and has been removed from your cart.` );
            await removeFromCart({ mangaBoxId: item.id });
            dispatch(removeItemFromCart({ id: item.id, type: "box" }));
          }
          }
        }

        /** ===================== HANDLE PRODUCT ===================== */
        else if (isProductTab && item.type === "product") {
          const productDetail = await getProductOnSaleDetail(item.id);
          if (!productDetail?.status || !productDetail.data) {
            showModal("error", "Error", `Cannot fetch detail for product: ${item.name}`);
            continue;
          }

          const availableQty = productDetail.data.quantity;
          if (availableQty < item.quantity) {
            const userWantsToBuy = await showConfirmPromise(
              "Limited stock",
              `Only ${availableQty} item(s) are currently available. Do you want to proceed with purchasing ${availableQty} item(s)?`
            );

            if (userWantsToBuy && availableQty > 0) {
              await updateCartQuantity({ Id: item.id, quantity: availableQty });
              dispatch({
                type: "cart/updateQuantity",
                payload: { id: item.id, type: "product", quantity: availableQty },
              });

              const result = await buyProductOnSale({
                sellProductId: item.id,
                quantity: availableQty,
              });
              if (result?.status) boughtCount++;
              else {
              showModal("error","Purchase Failed",result?.error || `Product '${item.name}' is no longer available and has been removed from your cart.`);
              await removeFromCart({ sellProductId: item.id });
              dispatch(removeItemFromCart({ id: item.id, type: "product" }));
           }
          }
          } else {
            // đủ số lượng thì mua luôn
            const result = await buyProductOnSale({
              sellProductId: item.id,
              quantity: item.quantity,
            });
            if (result?.status) boughtCount++;
           else {
           showModal("error","Purchase Failed",result?.error || `Product '${item.name}' is no longer available and has been removed from your cart.`);
           await removeFromCart({ sellProductId: item.id });
           dispatch(removeItemFromCart({ id: item.id, type: "product" }));
          }
          }
        }
      }

      /** ===================== HANDLE AFTER PURCHASE ===================== */
      if (boughtCount > 0) {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await fetchUserInfo();
          if (res.status && res.data) {
            dispatch(setUser(res.data));
          }
        }

        const cartItems = JSON.parse(localStorage.getItem("persist:root"))?.cart
          ? JSON.parse(JSON.parse(localStorage.getItem("persist:root")).cart).items
          : [];
        const productCartItems = cartItems.filter((item) => item.type === "product");
        const boxCartItems = cartItems.filter((item) => item.type === "box");
        const selectedProductIds = selectedItemsData.filter((item) => item.type === "product").map((item) => item.id);
        const selectedBoxIds = selectedItemsData.filter((item) => item.type === "box").map((item) => item.id);
        const allBoxSelected = isBoxTab && boxCartItems.length > 0 && boxCartItems.every((item) => selectedBoxIds.includes(item.id));
        const allProductSelected = isProductTab && productCartItems.length > 0 && productCartItems.every((item) => selectedProductIds.includes(item.id));

        if (allBoxSelected) {
          await clearAllCart("box");
          dispatch(clearCart({ type: "box" }));
        } else if (allProductSelected) {
          await clearAllCart("product");
          dispatch(clearCart({ type: "product" }));
        }

        for (const item of selectedItemsData) {
          if (isBoxTab && item.type === "box") {
            await removeFromCart({ mangaBoxId: item.id });
            dispatch(removeItemFromCart({ id: item.id, type: "box" }));
          } else if (isProductTab && item.type === "product") {
            await removeFromCart({ sellProductId: item.id });
            dispatch(removeItemFromCart({ id: item.id, type: "product" }));
          }
        }

        showModal("default", "Purchase Successful", `Successfully bought ${boughtCount} item(s)!`);
      }
    } catch (err) {
      showModal("error", "Unexpected Error", "Something went wrong while processing your purchase.");
      console.error(err);
    } finally {
      setLoadingBtn(false);
    }

  };


  return (
    <>
      <div className="cartpage-container">
        <div className="cartpage-search-filter-wrapper">
          {/* Search bar */}
          <SearchBar value={searchText} onChange={setSearchText} />

          {/* Filter button */}
          <FilterPanel
            key={activeTab} // 🔁 force re-render on tab change
            showRarity={activeTab === 'Collection Store'}
            onPriceChange={setPriceRange}
            onRaritySelect={setSelectedRarities}
          />
        </div>

        {/* Tabs switcher */}
        <div className='tabs-switcher-section'>
          <SwitchTabs
            tabs={[
              {
                label: 'Mystery Boxes',
                content: <CartBoxList
                  searchText={searchText}
                  priceRange={priceRange}
                  onSelectedItemsChange={setSelectedItemsData}
                />,
              },
              {
                label: 'Collection Store',
                content: <CartProductList
                  searchText={searchText}
                  priceRange={priceRange}
                  selectedRarities={selectedRarities}
                  onSelectedItemsChange={setSelectedItemsData}
                />,
              },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Total value of sellected items & Buy button */}
      <div className="cartpage-footer">
        <div className="cartpage-footer-content">
          <div className="cartpage-total oxanium-regular">
            Total:&nbsp;
            <span id="cartpage-total-value" className="oxanium-semibold">
              {totalSelectedPrice.toLocaleString('vi-VN')} VND
            </span>
          </div>
          <button
            className="cartpage-buy-button oxanium-bold"
            onClick={handleBuyAllSelected}
            disabled={loadingBtn}
          >
            {loadingBtn ? (
              <span className="loading loading-bars loading-md"></span>
            ) : (
              'Buy'
            )}
          </button>
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

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        onClose={() => {
          if (confirmModal.onCancel) confirmModal.onCancel();
          closeConfirmModal();
        }}
        onConfirm={() => {
          if (confirmModal.onConfirm) confirmModal.onConfirm();
          closeConfirmModal();
        }}
        title={confirmModal.title}
        message={confirmModal.message}
      />

    </>
  );
}