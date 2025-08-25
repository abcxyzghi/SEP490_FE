import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// CSS và Assets
import "./UserOnSale.css";
import DetailArrow from "../../../assets/Icon_line/Chevron_Up.svg";
import AddToCart from "../../../assets/Icon_fill/Bag_fill.svg";
import ThreeDots from "../../../assets/Icon_fill/Meatballs_menu.svg";

// API services
import {
  getProductOnSaleDetail,
  TurnOnOffProductOnSale,
  updateSellProduct,
  cancelSellProduct
} from "../../../services/api.product";
import { addToCart } from "../../../services/api.cart";
import { buildImageUrl } from "../../../services/api.imageproxy";

// Redux
import { addItemToCart } from "../../../redux/features/cartSlice";

// Components
import MessageModal from "../../libs/MessageModal/MessageModal";
import DropdownMenu from "../../libs/DropdownMenu/DropdownMenu";
import { PATH_NAME } from "../../../router/Pathname";

const PAGE_SIZE = 8;

export default function UserOnSale({ products, productsLoading }) {
  // State từ code nâng cấp (UI và Customer)
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [useBackupImg, setUseBackupImg] = useState(false);
  const [loadingBtnId, setLoadingBtnId] = useState(null);
  const [modal, setModal] = useState({
    open: false,
    type: "default",
    title: "",
    message: "",
  });
  const [dropdownStates, setDropdownStates] = useState({});

  // --- State từ code cũ được thêm vào (Owner-Management) ---
  const [productList, setProductList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // Dùng để mở modal update
  const [editedPrice, setEditedPrice] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  const anchorRef = useRef([]);
  // Hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: profileId } = useParams(); // ID của trang profile đang xem
  const user = useSelector((state) => state.auth.user);
  const currentUserId = user?.user_id;

  // Biến xác định người xem có phải chủ trang hay không
  const isOwner = currentUserId === profileId;

  // --- useEffect để quản lý danh sách sản phẩm, ẩn mọi sản phẩm có quantity = 0 ---
  useEffect(() => {
    if (products) {
      // Ẩn tất cả sản phẩm có quantity = 0 cho cả owner và khách
      const filtered = products.filter((product) => product.quantity > 0);
      setProductList(filtered);
    }
  }, [products]);

  const handleCancelSellProduct = async (sellProductId) => {
    setLoadingBtnId(sellProductId);
    try {
      const result = await cancelSellProduct(sellProductId);
      if (result) {
        setProductList((prev) => prev.filter((p) => p.id !== sellProductId));
      }
    } catch (error) {
      showModal("error", "Error", "Failed to cancel sale.");
    } finally {
      setLoadingBtnId(null);
    }
  };

  // Hàm hiển thị modal thông báo
  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  // Hàm định dạng số
  const formatShortNumber = (num) => {
    if (num >= 1_000_000)
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };
  useEffect(() => {
    if (!user) {
      navigate(PATH_NAME.LOGIN, { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null; // hoặc loading spinner
  }

  // --- Các hàm quản lý sản phẩm được thêm lại từ code cũ ---
  const handleToggleSell = async (product) => {
    if (!product.isSell && product.quantity <= 0) {
      showModal(
        "warning",
        "Out of stock",
        "This product is out of stock and cannot be enabled for sale."
      );
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
      showModal(
        "default",
        "Stock added",
        `Product has been ${product.isSell ? "disabled" : "enabled"} for sale.`
      );
    } catch (error) {
      console.error(error);
      showModal(
        "error",
        "Error",
        "Unable to update the sale status of this product."
      );
    } finally {
      setLoadingBtnId(null);
    }
  };

  const handleOpenUpdate = async (product) => {
    if (product.isSell) {
      return showModal("warning", "Sale Status Active", "You need to halting your sale status to update the product info");
    }
    
    setLoadingBtnId(product.id);
    try {
      const productWithDescription = await getProductOnSaleDetail(product.id);
      setSelectedProduct(product);
      setEditedPrice(product.price);
      setEditedDescription(productWithDescription.data.description);
    } catch (error) {
      console.error(error);
      showModal("error", "Error", "Failed to fetch product details.");
    } finally {
      setLoadingBtnId(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleSave = async () => {
    const descLength = editedDescription.trim().length;
    const priceNum = Number(editedPrice);

    if (descLength < 10 || descLength > 300) {
      showModal(
        "warning",
        "Invalid Description",
        "Description must be between 10 and 300 characters."
      );
      return;
    }

    if (
      !priceNum ||
      isNaN(priceNum) ||
      priceNum < 1000 ||
      priceNum > 100000000
    ) {
      showModal(
        "warning",
        "System Price Crunch",
        "System can only store up to 1,000,000,000."
      );
      return;
    }

    try {
      // Gọi API cập nhật
      await updateSellProduct({
        id: selectedProduct.id,
        description: editedDescription,
        price: priceNum,
        updatedAt: new Date().toISOString(),
      });

      // Thành công thì cập nhật sản phẩm trong danh sách
      setProductList((prevList) =>
        prevList.map((product) =>
          product.id === selectedProduct.id
            ? {
              ...product,
              description: editedDescription,
              price: priceNum,
              updatedAt: new Date().toISOString(),
            }
            : product
        )
      );

      showModal(
        "default",
        "Update complete",
        `Product updated: ${selectedProduct.name}`
      );
      handleCloseModal();
    } catch (error) {
      console.error("Update error:", error);
      showModal("error", "Error", error || "Failed to save product changes.");
    }
  };

  // --- Hàm thêm vào giỏ hàng được giữ lại ---
  const handleAddToCart = async (productId) => {
    // ... logic thêm vào giỏ hàng không đổi
    if (!user || user.role !== "user") {
      return showModal(
        "warning",
        "Unauthorized",
        "You're not permitted to execute this action"
      );
    }
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (product.userId === user.user_id) {
      return showModal(
        "warning",
        "Action Not Allowed",
        "You cannot add your own product to the cart."
      );
    }
    setLoadingBtnId(productId);
    try {
      await addToCart({ sellProductId: productId });
      if (product) {
        dispatch(
          addItemToCart({
            id: product.id,
            type: "product",
            name: product.name,
            price: product.price,
            image: product.urlImage,
            quantity: 1,
          })
        );
      }
      showModal("default", "Success", "Successfully added to cart!");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error || "Failed to add to cart.";
      showModal("error", "Error", errorMessage);
      console.error(error);
    } finally {
      setLoadingBtnId(null);
    }
  };

  // Logic hiển thị
  if (productsLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 p-4">
        {[...Array(PAGE_SIZE)].map((_, index) => (
          <div
            key={index}
            className="flex justify-center w-full flex-col gap-4"
          >
            <div className="skeleton h-42 w-full bg-gray-700/40"></div>
            <div className="skeleton h-4 w-28 bg-gray-700/40"></div>
            <div className="skeleton h-4 w-full bg-gray-700/40"></div>
            <div className="skeleton h-4 w-full bg-gray-700/40"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!productList || productList.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-6">No products on sale.</div>
    );
  }
  const visibleProducts = productList.slice(0, visibleCount);
  const isEnd = visibleCount >= productList.length;

  const toggleDropdown = (index) => {
    setDropdownStates((prev) => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [index]: !prev[index],
    }));
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
              className={`userOnSale-card-item ${isExpanded ? "userOnSale-card-item--expanded" : ""
                }`}
              key={item.id}
              onMouseEnter={() => setExpandedCardIndex(index)}
              onMouseLeave={() => {
                setExpandedCardIndex(null);
                setDropdownStates({});
              }}
            >
              {isOwnerOfItem && (
                <>
                  {/* Quantity tag (top left, above sale status) */}
                  <div className="userOnSale-tag-quantity oxanium-regular">
                    In Stock: {item.quantity}
                  </div>

                  {/* Sale status tag (top right, below quantity) */}
                  <div
                    className={`userOnSale-tag-sale-status oxanium-regular ${item.isSell ? "on-sale" : "sale-halt"
                      }`}
                  >
                    {item.isSell ? "On Sale" : "Sale Halt"}
                  </div>
                </>
              )}
              {/* ...existing card background and image... */}
              <div className="userOnSale-card-background">
                <img
                  src={buildImageUrl(item.urlImage, useBackupImg)}
                  onError={() => setUseBackupImg(true)}
                  alt={`${item.name} background`}
                />
              </div>
              <img
                src={buildImageUrl(item.urlImage, useBackupImg)}
                onError={() => setUseBackupImg(true)}
                alt={item.name}
                className="userOnSale-card-image"
              />
              <div
                className={`userOnSale-card-overlay ${isExpanded ? "userOnSale-card-overlay--expanded" : ""
                  }`}
                style={{
                  transition:
                    "max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s",
                  maxHeight: isExpanded ? "300px" : "60px",
                  opacity: isExpanded ? 1 : 0.85,
                  overflow: "hidden",
                }}
              >
                {/* ...existing toggle... */}
                <div className="userOnSale-card-toggle">
                  <img
                    src={DetailArrow}
                    style={{
                      width: "16px",
                      height: "16px",
                      transition: "transform 0.3s",
                    }}
                    className={isExpanded ? "rotate-180" : ""}
                  />
                </div>
                {/* --- Nội dung card được cập nhật --- */}
                <div
                  className="userOnSale-card-slide-content"
                  style={{
                    transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s",
                    transform: isExpanded ? "translateY(0)" : "translateY(30px)",
                    opacity: isExpanded ? 1 : 0,
                    pointerEvents: isExpanded ? "auto" : "none",
                  }}
                >
                  {isExpanded && (
                    <>
                      <div className="userOnSale-card-title oxanium-bold">
                        {item.name}
                      </div>
                      <div className="userOnSale-sub-info">
                        <div className="userOnSale-card-price oxanium-bold">
                          {formatShortNumber(item.price)} VND
                        </div>
                        {!isOwnerOfItem && (
                          <div className="userOnSale-card-quantity oxanium-bold">
                            Qty: {item.quantity}
                          </div>
                        )}
                      </div>
                      {/* Thêm trạng thái bán */}
                      {/* {isOwnerOfItem ? (
                        <div
                          className={`oxanium-bold text-sm mb-2 ${item.isSell ? "text-green-400" : "text-red-400"
                            }`}
                        >
                          {item.isSell ? "On Sale" : "Sale Halt"}
                        </div>
                      ) : (
                        ""
                      )} */}

                      <div className="userOnSale-card-actions">
                        <button
                          className="userOnSale-view-button"
                          onClick={() =>
                            navigate(`/productdetailpage/${item.id}`)
                          }
                        >
                          <span className="userOnSale-view-button-text oleo-script-bold">
                            View Detail
                          </span>
                        </button>

                        {/* --- Logic hiển thị nút cho Owner hoặc Customer --- */}
                        {isOwnerOfItem ? (
                          <div className="userOnSale-dropdown-container">
                            <button
                              ref={anchorRef}
                              onClick={() => toggleDropdown(index)}
                              className={`userOnSale-cart-button oxanium-bold ${loadingBtnId === item.id
                                ? "opacity-70 cursor-not-allowed"
                                : ""
                                }`}
                              disabled={loadingBtnId === item.id}
                            >
                              {loadingBtnId === item.id ? (
                                <span className="loading loading-bars loading-md text-white"></span>
                              ) : (
                                <img
                                  src={ThreeDots}
                                  alt="More Icon"
                                  className="userOnSale-more-icon"
                                />
                              )}
                            </button>
                            <DropdownMenu
                              anchorRef={anchorRef}
                              isOpen={isDropdownOpen}
                              onClose={() => toggleDropdown(index)}
                            >
                              <div
                                className={`userOnSale-dropdown-item oxanium-regular ${!item.isSell && item.quantity <= 0
                                  ? "disabled"
                                  : ""
                                  }`}
                                onClick={() => handleToggleSell(item)}
                              >
                                {item.isSell ? "Sale Halt" : "Sale On"}
                              </div>
                              <div
                                className={`userOnSale-dropdown-item oxanium-regular ${item.isSell ? "disabled" : ""
                                  }`}
                                onClick={() =>
                                  handleOpenUpdate(item)
                                }
                              >
                                Update Sale Product
                              </div>
                              <div
                                className={`userOnSale-dropdown-item oxanium-regular`}
                                onClick={() => handleCancelSellProduct(item.id)}
                              >
                                Stop Sale Permanently
                              </div>
                            </DropdownMenu>
                          </div>
                        ) : (
                          <button
                            className={`userOnSale-cart-button oleo-script-bold ${loadingBtnId === item.id ? "disabled" : ""
                              } ${!item.isSell ? "hidden" : ""}`}
                            disabled={loadingBtnId === item.id || !item.isSell}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(item.id);
                            }}
                          >
                            {loadingBtnId === item.id ? (
                              <span className="loading loading-bars loading-md"></span>
                            ) : (
                              <>
                                <img
                                  src={AddToCart}
                                  alt="Cart Icon"
                                  className="userOnSale-cart-icon"
                                />
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

      {/* Load more */}
      {
        isEnd ? (
          <div className="userOnSale-end-content oxanium-semibold divider divider-warning">
            End of content
          </div>
        ) : (
          <button
            className="userOnSale-loadmore-button oxanium-semibold"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + PAGE_SIZE, products.length)
              )
            }
          >
            Load more
          </button>
        )
      }

      {/* Message Modal */}
      <MessageModal
        open={modal.open}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />

      {/* --- Modal Cập nhật sản phẩm được thêm vào --- */}
      {
        selectedProduct && (
          <div
            className="userOnSale-updatePrd-modal-overlay"
            onMouseDown={handleCloseModal}
          >
            <div
              className="userOnSale-updatePrd-modal-container"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="userOnSale-updatePrd-modal-box">
                <h3 className="userOnSale-updatePrd-modal-header oxanium-bold">
                  Update Product
                </h3>

                <div className="userOnSale-updatePrd-modal-field">
                  <label className="oxanium-semibold">Description:</label>
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
                    className="userOnSale-updatePrd-textarea"
                  />
                  <div
                    className="userOnSale-updatePrd-helper-text oxanium-regular"
                    style={{
                      color:
                        editedDescription.trim().length < 10 ||
                          editedDescription.trim().length > 300
                          ? "red"
                          : "#aaa",
                    }}
                  >
                    {`Description: ${editedDescription.trim().length}/300 characters. (Min: 10, Max: 300)`}
                  </div>
                </div>

                <div className="userOnSale-updatePrd-modal-field">
                  <label className="oxanium-semibold">Price (VND):</label>
                  <input
                    type="number"
                    value={editedPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditedPrice(val === "" ? "" : val);
                    }}
                    className="userOnSale-updatePrd-input"
                  />
                  <div
                    className="userOnSale-updatePrd-helper-text oxanium-regular"
                    style={{
                      color:
                        Number(editedPrice) < 1000 ||
                          Number(editedPrice) > 100000000
                          ? "red"
                          : "#aaa",
                    }}
                  >
                    Price must be between 1,000 VND and 100,000,000 VND
                  </div>
                </div>

                <div className="userOnSale-updatePrd-modal-actions oxanium-regular">
                  <button
                    onClick={handleCloseModal}
                    className="userOnSale-updatePrd-btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="userOnSale-updatePrd-btn-save"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
}
