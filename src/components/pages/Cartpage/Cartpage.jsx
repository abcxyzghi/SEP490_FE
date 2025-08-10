import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { buyMysteryBox } from '../../../services/api.mysterybox';
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
    if (selectedItemsData.length === 0) {
      return showModal('warning', 'No Selection', 'Please select at least one item to buy.');
    }

    setLoadingBtn(true);
    try {
      let boughtCount = 0;
      let isBoxTab = activeTab === 'Mystery Boxes';
      let isProductTab = activeTab === 'Collection Store';

      for (const item of selectedItemsData) {
        if (isBoxTab && item.type === 'box') {
          const result = await buyMysteryBox({ mangaBoxId: item.id, quantity: item.quantity });
          if (result?.status) {
            boughtCount++;
          } else {
            showModal('error', 'Purchase Failed', result?.error || `Failed to buy mystery box: ${item.name}`);
          }
        } else if (isProductTab && item.type === 'product') {
          const result = await buyProductOnSale({ sellProductId: item.id, quantity: item.quantity });
          if (result?.status) {
            boughtCount++;
          } else {
            // Nếu mua thất bại, fetch lại thông tin sản phẩm
            const productDetail = await getProductOnSaleDetail(item.id);

            if (productDetail?.status && productDetail.data) {
              const availableQty = productDetail.data.quantity;

              const userWantsToBuy = await showConfirmPromise(
                'Limited stock',
                `Only ${availableQty} item(s) are currently available in the shop. Do you want to proceed with purchasing ${availableQty} item(s)?`
              );

              if (userWantsToBuy) {
                // user confirmed -> update quantity then adjust redux/cart as before
                await updateCartQuantity({ Id: item.id, quantity: availableQty });
                dispatch({
                  type: "cart/updateQuantity",
                  payload: {
                    id: item.id,
                    type: "product",
                    quantity: availableQty,
                  },
                });
              } else {
                // user canceled -> remove from cart
                await removeFromCart({ sellProductId: item.id });
                dispatch(removeItemFromCart({ id: item.id, type: "product" }));
              }

            } else {
              showModal('error', 'Purchase Failed', result?.error || `Failed to buy product: ${item.name}`);
            }
          }
        }
      }

      if (boughtCount > 0) {
        // Refetch user info to update wallet amount
        const token = localStorage.getItem('token');
        if (token) {
          const res = await fetchUserInfo();
          if (res.status && res.data) {
            dispatch(setUser(res.data));
          }
        }
        // Remove only the bought items from cart (backend and redux), or clear all if all selected
        // Fix: Only clear all if ALL products in cart are selected
        const cartItems = JSON.parse(localStorage.getItem('persist:root'))?.cart
          ? JSON.parse(JSON.parse(localStorage.getItem('persist:root')).cart).items
          : [];
        const productCartItems = cartItems.filter(item => item.type === 'product');
        const boxCartItems = cartItems.filter(item => item.type === 'box');
        const selectedProductIds = selectedItemsData.filter(item => item.type === 'product').map(item => item.id);
        const selectedBoxIds = selectedItemsData.filter(item => item.type === 'box').map(item => item.id);
        const allBoxSelected = isBoxTab && boxCartItems.length > 0 && boxCartItems.every(item => selectedBoxIds.includes(item.id));
        const allProductSelected = isProductTab && productCartItems.length > 0 && productCartItems.every(item => selectedProductIds.includes(item.id));

        if (allBoxSelected) {
          await clearAllCart('box');
          dispatch(clearCart({ type: 'box' }));
        } else if (allProductSelected) {
          await clearAllCart('product');
          dispatch(clearCart({ type: 'product' }));
        }
        // Always remove bought items from cart (backend and redux), regardless of clearAllCart
        for (const item of selectedItemsData) {
          if (isBoxTab && item.type === 'box') {
            await removeFromCart({ mangaBoxId: item.id });
            dispatch(removeItemFromCart({ id: item.id, type: 'box' }));
          } else if (isProductTab && item.type === 'product') {
            await removeFromCart({ sellProductId: item.id });
            dispatch(removeItemFromCart({ id: item.id, type: 'product' }));
          }
        }
        // Optionally, you can keep the clearAllCart/clearCart for efficiency if all are selected, but always run the above loop to ensure removal
        // alert success
        showModal('default', 'Purchase Successful', `Successfully bought ${boughtCount} item(s)!`);
      }
    } catch (err) {
      showModal('error', 'Unexpected Error', 'Something went wrong while processing your purchase.');
      console.error(err);
    } finally {
      setLoadingBtn(false); // end loading
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