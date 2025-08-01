import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// CSS và Assets
import './UserOnSale.css';
import DetailArrow from '../../../assets/Icon_line/Chevron_Up.svg';
import AddToCart from '../../../assets/Icon_fill/Bag_fill.svg';
import ThreeDots from '../../../assets/Icon_fill/Meatballs_menu.svg';

// API services
import { getProductOnSaleDetail, TurnOnOffProductOnSale, updateSellProduct } from '../../../services/api.product';
import { addToCart } from '../../../services/api.cart';

// Redux
import { addItemToCart } from '../../../redux/features/cartSlice';

// Components
import MessageModal from '../../libs/MessageModal/MessageModal';
import DropdownMenu from '../../libs/DropdownMenu/DropdownMenu';

const PAGE_SIZE = 8;

export default function UserOnSale({ products, productsLoading }) {
  // State từ code nâng cấp (UI và Customer)
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingBtnId, setLoadingBtnId] = useState(null);
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });
  const [dropdownStates, setDropdownStates] = useState({});

  // --- State từ code cũ được thêm vào (Owner-Management) ---
  const [productList, setProductList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // Dùng để mở modal update
  const [editedPrice, setEditedPrice] = useState('');
  const [editedDescription, setEditedDescription] = useState('');


  const anchorRef = useRef([]);
  // Hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: profileId } = useParams(); // ID của trang profile đang xem
  const user = useSelector((state) => state.auth.user);
  const currentUserId = user?.user_id;

  // Biến xác định người xem có phải chủ trang hay không
  const isOwner = currentUserId === profileId;

  // --- useEffect từ code cũ để quản lý danh sách sản phẩm ---
  // Khi props.products thay đổi, cập nhật vào state nội bộ để dễ dàng quản lý
  useEffect(() => {
    if (products) {
      // Nếu là chủ trang, hiển thị tất cả, nhưng ẩn sản phẩm nếu isSell = false và quantity = 0
      let filtered;
      if (isOwner) {
        filtered = products.filter(product => !(product.isSell === false && product.quantity === 0));
      } else {
        filtered = products.filter(product => product.isSell);
      }
      setProductList(filtered);
    }
  }, [products, isOwner]);

  // Hàm hiển thị modal thông báo
  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };
  
  // Hàm định dạng số
  const formatShortNumber = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  };
  
  // --- Các hàm quản lý sản phẩm được thêm lại từ code cũ ---
  const handleToggleSell = async (product) => {
    if (!product.isSell && product.quantity <= 0) {
      showModal("warning", "Hết hàng", "Sản phẩm đã hết hàng, không thể bật bán lại.");
      return;
    }
    setLoadingBtnId(product.id);
    try {
      await TurnOnOffProductOnSale(product.id);
      // Cập nhật lại isSell trong state cục bộ để UI thay đổi ngay lập tức
      setProductList((prevList) =>
        prevList.map((p) =>
          p.id === product.id ? { ...p, isSell: !p.isSell } : p
        )
      );
      showModal("default", "Thành công", `Đã ${product.isSell ? 'tắt' : 'bật'} bán sản phẩm.`);
    } catch (error) {
      console.error(error);
      showModal('error', 'Lỗi', 'Không thể cập nhật trạng thái bán của sản phẩm.');
    } finally {
        setLoadingBtnId(null);
    }
  };

  const handleOpenUpdate = async (product) => {
    try {
      const productWithDescription = await getProductOnSaleDetail(product.id);
      setSelectedProduct(product);
      setEditedPrice(product.price);
      setEditedDescription(productWithDescription.data.description);
    } catch (error) {
        console.error(error);
        showModal('error', 'Lỗi', 'Không thể lấy thông tin chi tiết sản phẩm.');
    }
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleSave = async () => {
    const descLength = editedDescription.trim().length;
    const priceNum = Number(editedPrice);
    if (descLength < 10 || descLength > 300) {
      showModal('warning', 'Mô tả không hợp lệ', 'Mô tả phải từ 10 đến 300 ký tự.');
      return;
    }
    if (!priceNum || isNaN(priceNum) || priceNum < 1000 || priceNum > 100000000) {
      showModal('warning', 'Giá không hợp lệ', 'Giá phải từ 1.000 đến 100.000.000.');
      return;
    }
    try {
      await updateSellProduct({
        id: selectedProduct.id,
        description: editedDescription,
        price: priceNum,
        updatedAt: new Date().toISOString(),
      });
      setProductList(prevList =>
        prevList.map(p =>
          p.id === selectedProduct.id
            ? { ...p, price: priceNum, description: editedDescription }
            : p
        )
      );
      showModal('default', 'Thành công', `Đã cập nhật sản phẩm: ${selectedProduct.name}`);
      handleCloseModal();
    } catch (error) {
      console.error(error);
      showModal('error', 'Lỗi', 'Lỗi khi lưu sản phẩm.');
    }
  };

  // --- Hàm thêm vào giỏ hàng được giữ lại ---
  const handleAddToCart = async (productId) => {
    // ... logic thêm vào giỏ hàng không đổi
    if (!user || user.role !== 'user') {
        return showModal('warning', 'Unauthorized', "You're not permitted to execute this action");
    }
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (product.userId === user.user_id) {
        return showModal('warning', 'Action Not Allowed', "You cannot add your own product to the cart.");
    }
    setLoadingBtnId(productId);
    try {
        await addToCart({ sellProductId: productId });
        if (product) {
            dispatch(addItemToCart({
                id: product.id, type: 'product', name: product.name,
                price: product.price, image: product.urlImage, quantity: 1
            }));
        }
        showModal('default', 'Success', 'Successfully added to cart!');
    } catch (error) {
        const errorMessage = error?.response?.data?.error || 'Failed to add to cart.';
        showModal('error', 'Error', errorMessage);
        console.error(error);
    } finally {
        setLoadingBtnId(null);
    }
  };

  // Logic hiển thị
  if (productsLoading) {
    // ... skeleton loading không đổi
  }
  if (!productList || productList.length === 0) {
    return <div className="text-center text-gray-400 mt-6">No products on sale.</div>;
  }
  const visibleProducts = productList.slice(0, visibleCount);
  const isEnd = visibleCount >= productList.length;

  const toggleDropdown = (index) => {
    setDropdownStates(prev => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), [index]: !prev[index] }));
  };

  return (
    <div className="userOnSale-card-list-container">
      <div className="userOnSale-card-grid">
        {visibleProducts.map((item, index) => {
          const isExpanded = expandedCardIndex === index;
          const isOwnerOfItem = user && user.user_id === item.userId;
          const isDropdownOpen = !!dropdownStates[index];
          return (
            <div
              className={`userOnSale-card-item ${isExpanded ? 'userOnSale-card-item--expanded' : ''}`}
              key={item.id}
              onMouseEnter={() => setExpandedCardIndex(index)}
              onMouseLeave={() => { setExpandedCardIndex(null); setDropdownStates({}); }}
            >
              {/* ... phần background và image không đổi */}
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
                  }}              >
                 {/* ... phần toggle và slide content không đổi */}

                {/* --- Nội dung card được cập nhật --- */}
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
                       {/* Thêm trạng thái bán */}
                      <div className={`font-semibold text-sm mb-2 ${item.isSell ? 'text-green-400' : 'text-red-400'}`}>
                        {item.isSell ? 'Đang bán' : 'Ngừng bán'}
                      </div>

                      <div className="userOnSale-card-actions">
                        <button
                          className="userOnSale-view-button"
                          onClick={() => navigate(`/productdetailpage/${item.id}`)}
                        >
                          <span className="userOnSale-view-button-text oleo-script-bold">View Detail</span>
                        </button>

                        {/* --- Logic hiển thị nút cho Owner hoặc Customer --- */}
                        {isOwnerOfItem ? (
                          <div className="userOnSale-dropdown-container">
                            <button
                              ref={anchorRef}
                              onClick={() => toggleDropdown(index)}
                              className={`userOnSale-cart-button oxanium-bold ${loadingBtnId === item.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                              disabled={loadingBtnId === item.id}
                            >
                              {loadingBtnId === item.id ? ( <span className="loading loading-bars loading-md text-white"></span> ) 
                              : ( <img src={ThreeDots} alt="More Icon" className='userOnSale-more-icon' /> )}
                            </button>
                            <DropdownMenu anchorRef={anchorRef} isOpen={isDropdownOpen} onClose={() => toggleDropdown(index)}>
                              <div
                                className={`userOnSale-dropdown-item oxanium-regular ${(!item.isSell && item.quantity <= 0) ? 'disabled' : ''}`}
                                onClick={() => handleToggleSell(item)}
                              >
                                {item.isSell ? 'Tắt bán' : 'Bật bán'}
                              </div>
                              <div
                                className={`userOnSale-dropdown-item oxanium-regular ${item.isSell ? 'disabled' : ''}`}
                                onClick={() => !item.isSell && handleOpenUpdate(item)}
                              >
                                Cập nhật
                              </div>
                            </DropdownMenu>
                          </div>
                        ) : (
                          <button
                            className={`userOnSale-cart-button oleo-script-bold ${loadingBtnId === item.id ? 'disabled' : ''} ${!item.isSell ? 'hidden' : ''}`}
                            disabled={loadingBtnId === item.id || !item.isSell}
                            onClick={(e) => { e.stopPropagation(); handleAddToCart(item.id); }}
                          >
                             {/* ... nút thêm vào giỏ hàng không đổi */}
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
        {/* ... Load more và Message Modal không đổi */}
       {isEnd ? (
        <div className="userOnSale-end-content oxanium-semibold divider divider-warning">
          End of content
        </div>
        ) : (
        <button
            className="userOnSale-loadmore-button oxanium-semibold"
            onClick={() => setVisibleCount(count => Math.min(count + PAGE_SIZE, products.length))}
        >
            Load more
        </button>
        )}

        <MessageModal
            open={modal.open}
            onClose={() => setModal(prev => ({ ...prev, open: false }))}
            type={modal.type}
            title={modal.title}
            message={modal.message}
        />

        {/* --- Modal Cập nhật sản phẩm được thêm vào --- */}
        {selectedProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseModal}>
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-white" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-xl font-bold mb-4">Update Product</h3>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Description:</label>
                        <textarea
                            value={editedDescription}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (val.length > 300) val = val.slice(0, 300);
                              setEditedDescription(val);
                            }}
                            rows={5}
                            minLength={10}
                            maxLength={300}
                            className="textarea textarea-bordered w-full bg-gray-700"
                        />
                        <div style={{fontSize:'12px',color: editedDescription.trim().length < 10 || editedDescription.trim().length > 300 ? 'red' : '#aaa'}}>
                          {`Description: ${editedDescription.trim().length}/300 characters. (Min: 10, Max: 300)`}
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium">Price (VND):</label>
                        <input
                            type="number"
                            min={1000}
                            max={100000000}
                            value={editedPrice}
                            onChange={(e) => {
                              let val = Number(e.target.value);
                              if (val > 100000000) val = 100000000;
                              if (val < 1000) val = 1000;
                              setEditedPrice(val);
                            }}
                            className="input input-bordered w-full bg-gray-700"
                        />
                        <div style={{fontSize:'12px',color: Number(editedPrice) < 1000 || Number(editedPrice) > 100000000 ? 'red' : '#aaa'}}>
                          {`Price must be between 1,000 and 100,000,000`}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button onClick={handleCloseModal} className="btn btn-ghost">Cancel</button>
                        <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}