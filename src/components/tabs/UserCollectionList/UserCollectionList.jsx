import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThreeDots from "../../../assets/Icon_fill/Meatballs_menu.svg";
import DetailArrow from "../../../assets/Icon_line/Chevron_Up.svg";
import {
  addFavourite,
  getFavoriteImages,
  getFavoriteList,
  removeFavourite,
} from "../../../services/api.favorites";
import { buildImageUrl } from "../../../services/api.imageproxy";
import {
  createSellProduct,
  getAllCollectionOfProfile,
  getAllProductOfUserCollection,
} from "../../../services/api.user";
import ConfirmModal from "../../libs/ConfirmModal/ConfirmModal";
import DropdownMenu from "../../libs/DropdownMenu/DropdownMenu";
import HostAuctionModal from "../../libs/HostAuctionModal/HostAuctionModal";
import MessageModal from "../../libs/MessageModal/MessageModal";
import SellFormModal from "../../libs/SellFormModal/SellFormModal";
import "./UserCollectionList.css";

const PAGE_SIZE = 8;

export default function UserCollectionList({ refreshOnSaleProducts }) {
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
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [dropdownStates, setDropdownStates] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [products, setProducts] = useState([]);
  const [favProducts, setFavProducts] = useState([]);
  const [showProducts, setShowProducts] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);
  const [sellResult, setSellResult] = useState(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellModalProduct, setSellModalProduct] = useState(null);
  const [sellForm, setSellForm] = useState({
    quantity: 1,
    description: "",
    price: 100000,
  });
  const navigate = useNavigate();
  const anchorRefs = useRef([]);
  const [favourites, setFavourites] = useState([]);

  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  const showConfirmModal = (title, message, onConfirm = null) => {
    setConfirmModal({ open: true, title, message, onConfirm });
  };
  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, open: false }));
  };

  const [auctionModalOpen, setAuctionModalOpen] = useState(false);
  // const [auctionForm, setAuctionForm] = useState({
  //   title: "",
  //   description: "",
  //   start_time: "",
  //   quantity: 1,
  //   starting_price: 1000
  // });
  // const [auctionProduct, setAuctionProduct] = useState(null); // lưu sản phẩm đang host auction
  // const [auctionLoading, setAuctionLoading] = useState(false);
  // const [mode, setAuctionMode] = useState("newAuction"); // hoặc "addProduct"
  // const openAuctionModal = (product) => {
  //   setAuctionProduct(product);
  //   setAuctionForm({
  //     title: "",
  //     description: "",
  //     start_time: "",
  //     quantity: 1,
  //     starting_price: 1000
  //   });
  //   setAuctionModalOpen(true);
  // };
  const [auctionProductId, setAuctionProductId] = useState(null);

  // replace previous openAuctionModal(product) with:
  const openAuctionModal = (productId) => {
    setAuctionProductId(productId);
    setAuctionModalOpen(true);
  };
  const [favImages, setFavImages] = useState([]);
  const [favVisibleCount, setFavVisibleCount] = useState(8);
  const [favExpandedIndex, setFavExpandedIndex] = useState(null);
  const [favUseBackupImg, setFavUseBackupImg] = useState(false);

  const visibleFavs = Array.isArray(favImages)
    ? favImages.slice(0, favVisibleCount)
    : [];
  const isEndFavs = Array.isArray(favImages)
    ? favVisibleCount >= favImages.length
    : true;

  const [productsLoading, setProductsLoading] = useState(false);

  // Track which products have their isQuantityUpdateInc tag turned off
  const [quantityUpdateIncOff, setQuantityUpdateIncOff] = useState({});

  // Helper for rarity sort
  const rarityOrder = {
    legendary: 0,
    epic: 1,
    rare: 2,
    uncommon: 3,
    common: 4,
  };
  function sortByRarity(a, b) {
    const aRank = rarityOrder[a.rarityName?.toLowerCase()] ?? 99;
    const bRank = rarityOrder[b.rarityName?.toLowerCase()] ?? 99;
    return aRank - bRank;
  }

  useEffect(() => {
    const fetchFavImages = async () => {
      try {
        const data = await getFavoriteImages();
        setFavImages(data.data);
      } catch (err) {
        console.error("Failed to fetch favorite images:", err);
      }
    };
    fetchFavImages();
  }, []);

  // const handleShowFavProducts = () => {
  //   navigate("/favorite-list")
  // };

  const handleShowFavProducts = async (collectionId) => {
    setSelectedCollectionId(collectionId);
    setSellResult(null);
    setFavProducts([]);
    setProductsLoading(true);
    await getFavoriteProductList();
    setProductsLoading(false);
    setShowProducts(true);
  };

  // const handleHostAuction = async () => {
  //   console.log("Starting handleHostAuction...");
  //   console.log("mode:", mode);
  //   console.log("auctionForm data:", auctionForm);
  //   console.log("auctionProduct data:", auctionProduct);

  //   if (!auctionProduct) {
  //     console.warn("auctionProduct is missing, cannot proceed.");
  //     return;
  //   }
  //   setAuctionLoading(true);
  //   try {
  //     if (mode === "newAuction") {
  //       const startTimeISO = auctionForm.start_time?.toDate().toISOString();
  //       console.log("Auction start time (ISO):", startTimeISO);
  //       // 1️⃣ Tạo auction mới
  //       console.log(" Sending newAuction request...");
  //       const auctionRes = await newAuction({
  //         title: auctionForm.title,
  //         description: auctionForm.description,
  //         start_time: startTimeISO
  //       });

  //       console.log("📥 newAuction API response:", auctionRes);

  //       const auctionSessionId =
  //         auctionRes?.data?.id || auctionRes?.data?.auction_session_id;
  //       console.log("🆔 auctionSessionId:", auctionSessionId);

  //       if (!auctionSessionId) throw new Error(" Auction session ID not found");

  //       // 2️⃣ Gán sản phẩm vào auction
  //       console.log("Sending productOfAuction request...");
  //       const productRes = await productOfAuction({
  //         product_id: auctionProduct.productId,
  //         auction_session_id: auctionSessionId,
  //         quantity: auctionForm.quantity,
  //         starting_price: auctionForm.starting_price
  //       });
  //       console.log("productOfAuction API response:", productRes);

  //     } else if (mode === "addProduct") {
  //       console.log("Sending productOfAuction request (existing auction)...");
  //       const productRes = await productOfAuction({
  //         product_id: auctionProduct.productId,
  //         auction_session_id: auctionForm.auction_session_id,
  //         quantity: auctionForm.quantity,
  //         starting_price: auctionForm.starting_price
  //       });
  //       console.log("productOfAuction API response:", productRes);
  //     }
  //     showModal('default', 'Auction Request Sent', "Please wait for our moderater approve and you're ready to go!");
  //     setAuctionModalOpen(false);
  //   } catch (error) {
  //     console.error("handleHostAuction error:", error);
  //     return showModal('error', 'Something wrong', "Failed to host auction");
  //   } finally {
  //     setAuctionLoading(false);
  //     console.log("handleHostAuction finished.");
  //   }
  // };

  useEffect(() => {
    fetchFavourites();
  }, []);
  const fetchFavourites = async () => {
    try {
      setLoading(true);
      const res = await getFavoriteList();
      console.log("API getFavoriteList:", res);

      const favList = Array.isArray(res) ? res : res?.data || [];

      setFavourites(favList);
    } catch (err) {
      console.error("Error loading Favourites", err);
      setFavourites([]); // tránh null
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (favId) => {
    showConfirmModal(
      "Remove Favorite",
      "Are you sure you want to remove this product from your favorite list?",
      async () => {
        try {
          await removeFavourite(favId);
          setFavourites((prev) => prev.filter((item) => item.id !== favId));
          await getFavoriteProductList();
        } catch (err) {
          console.error("Error removing favorite:", err);
        }
      }
    );
  };

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await getAllCollectionOfProfile();
        if (res.status && Array.isArray(res.data)) {
          setCollections(res.data);
        } else {
          setCollections([]);
        }
      } catch {
        setCollections([]);
        setError("Failed to load products.");
      }
      setLoading(false);
    };
    fetchCollections();
  }, []);

  // Fetch products of selected collection
  const getFavoriteProductList = async () => {
    const res = await getFavoriteList();
    if (res.status && Array.isArray(res.data)) {
      setFavProducts(res.data);
    } else {
      setFavProducts([]);
    }
  };

  // Fetch products of selected collection
  const fetchProductsOfCollection = async (collectionId) => {
    const res = await getAllProductOfUserCollection(collectionId);
    if (res.status && Array.isArray(res.data)) {
      setProducts(res.data);
    } else {
      setProducts([]);
    }
  };

  // Show loading skeleton while fetching data
  if (loading) {
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

  // Check for error after loading
  if (error) {
    return <div className="text-red-500 text-center mt-6">{error}</div>;
  }

  // Pagination for collections
  const visibleCollections = collections.slice(0, visibleCount);
  const filteredProducts = products.filter((p) => p.quantity > 0);
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const filteredFavProducts = favProducts;
  const visiblefavProducts = filteredFavProducts.slice(0, visibleCount);
  const isEnd =
    visibleCount >=
    (showProducts ? filteredProducts.length : collections.length);

  const handleShowProducts = async (collectionId) => {
    setSelectedCollectionId(collectionId);
    setSellResult(null);

    // Clear previous products to avoid stale render (tùy ý)
    setProducts([]);

    // Bật loading cho khu vực product
    setProductsLoading(true);

    // Fetch rồi mới show UI
    await fetchProductsOfCollection(collectionId);

    setProductsLoading(false);
    setShowProducts(true);
  };
  // const toggleDropdown = (idx) => {
  //   setDropdownStates(prev => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), [idx]: !prev[idx] }));
  // };

  // Open sell modal
  const openSellModal = (product) => {
    setSellModalProduct(product);
    setSellForm({ quantity: 1, description: "", price: "" });
    setSellModalOpen(true);
    setSellResult(null);
  };

  // Handle sell product from modal
  const handleSellProduct = async (e) => {
    e.preventDefault();
    // Validation: all fields required
    if (
      !sellForm.quantity ||
      !sellForm.description.trim() ||
      sellForm.price === "" ||
      sellForm.price === null ||
      isNaN(Number(sellForm.price))
    ) {
      return showModal(
        "warning",
        "Required Action",
        "Please enter all fields to sell."
      );
    }
    // Validation: price must be positive and not zero
    if (Number(sellForm.price) <= 0) {
      return showModal(
        "warning",
        "Invalid Price",
        "Price must be greater than 0."
      );
    }
    // Validation: description length 10-300 characters
    const descLength = sellForm.description.trim().length;
    if (descLength < 10 || descLength > 300) {
      return showModal(
        "warning",
        "Description length",
        "Description must be between 10 and 300 characters."
      );
    }
    // Validation: price between 1000 and 100000000
    // if (Number(sellForm.price) < 1000 || Number(sellForm.price) > 100000000) {
    //   return showModal('warning', 'Price out of range', "Price must be between 1,000 and 100,000,000.");
    // }
    // Validation: quantity must be > 0
    if (sellForm.quantity <= 0) {
      return showModal(
        "warning",
        "Invalid price input",
        "Quantity can't be lower than 0"
      );
    }
    // Validation: quantity must not exceed owned
    if (sellForm.quantity > (sellModalProduct?.quantity || 0)) {
      return showModal(
        "warning",
        "Imbalance stock",
        "This collection does not have enough quantity to sell."
      );
    }
    // Try to get userProductId from multiple possible fields for robustness
    let userProductId =
      sellModalProduct?.userProductId ||
      sellModalProduct?.UserProductId ||
      sellModalProduct?.id;
    if (!userProductId) {
      // Try to find any key that looks like userProductId (case-insensitive)
      const possibleIdKey = Object.keys(sellModalProduct || {}).find((k) =>
        k.toLowerCase().includes("userproductid")
      );
      if (possibleIdKey) {
        userProductId = sellModalProduct[possibleIdKey];
      }
    }
    if (!userProductId) {
      console.error("Sell modal product object:", sellModalProduct);
      return showModal(
        "error",
        "Error",
        "Product ID is missing. Cannot sell this product."
      );
    }
    setSellLoading(true);
    setSellResult(null);
    const { quantity, description, price } = sellForm;
    // Debug log
    console.log(
      "Selling with UserProductId:",
      userProductId,
      "Full product:",
      sellModalProduct
    );
    try {
      const res = await createSellProduct({
        userProductId,
        quantity,
        description,
        price,
      });
      setSellLoading(false);
      setSellResult(res);
      if (res && res.status) {
        // Refetch on-sale products for UI update
        if (typeof refreshOnSaleProducts === "function") {
          refreshOnSaleProducts();
        }
        // Refresh the user's collection products after selling
        if (selectedCollectionId) {
          await fetchProductsOfCollection(selectedCollectionId);
        }
        // Show user a confirmation and refetch their on-sale products
        showModal(
          "default",
          "Your product is now on sale",
          "After a successful sale, 5% of your profit will be deducted."
        );
        // Close the modal
        setSellModalOpen(false);
      }
    } catch (error) {
      const data = error.response.data;
        if (data.errorCode === 400) {
          return showModal(
          "error",
          "Invalid Input",
          `${data.error}`
        );
      }
    } finally {
       setSellLoading(false);
    }
  };

  const handleAddFavourite = async (userProductId, productName) => {
    try {
      await addFavourite(userProductId);
      showModal(
        "default",
        "Success",
        `Added "${productName}" to your favorites.`
      );
    } catch (err) {
      console.error("Error adding to favorites:", err);
    }
  };

  return (
    <>
      {/* Breadcrumbs section */}
      <div className="breadcrumb oxanium-bold text-purple-600 mt-6 text-center">
        {selectedCollectionId ? (
          <>
            <span
              className="cursor-pointer hover:underline"
              onClick={() => {
                setShowProducts(false);
                setSelectedCollectionId(null);
                setProducts([]);
              }}
            >
              Collection Topic
            </span>
            <span className="mx-2">{"›"}</span>
            <span className="cursor-default">
              {collections.find((col) => col.id === selectedCollectionId)
                ?.collectionTopic ||
                selectedCollectionId ||
                "Unknown"}
            </span>
          </>
        ) : (
          <span>Collection Topic</span>
        )}
      </div>

      {/* Collection cards */}
      {!showProducts && (
        <>
          <div className="userCollectionList-card-list-container">
            {visibleCollections.length === 0 ? (
              <div className="text-gray-500 mt-2 oxanium-regular">
                No collections found.
              </div>
            ) : (
              <div className="userCollectionList-card-grid">
                {visibleFavs.length === 0 ? (
                  ""
                ) : (
                  <div className="userCollectionList-card-grid">
                    {visibleFavs.map((col, idx) => {
                      const isExpanded = favExpandedIndex === idx;
                      return (
                        <div
                          key={col.id || idx}
                          className={`userCollectionList-card-item ${
                            isExpanded
                              ? "userCollectionList-card-item--expanded"
                              : ""
                          }`}
                          onMouseEnter={() => setFavExpandedIndex(idx)}
                          onMouseLeave={() => setFavExpandedIndex(null)}
                        >
                          <div className="userCollectionList-card-background-preview">
                            {col.image.length === 0 ? (
                              <div className="userCollectionList-card-background-none">
                                <span>No preview image shown</span>
                              </div>
                            ) : col.image.length === 1 ? (
                              <div className="userCollectionList-card-background-single">
                                <img
                                  src={buildImageUrl(
                                    col.image[0].urlImage,
                                    favUseBackupImg
                                  )}
                                  onError={() => setFavUseBackupImg(true)}
                                  alt={`${col.collectionTopic} background`}
                                  className="userCollectionList-card-background-img-single"
                                />
                              </div>
                            ) : (
                              <div className="userCollectionList-card-background-group">
                                {col.image.map((img, index) => (
                                  <img
                                    key={img.id || index}
                                    src={buildImageUrl(
                                      img.urlImage,
                                      favUseBackupImg
                                    )}
                                    onError={() => setFavUseBackupImg(true)}
                                    alt={`${col.collectionTopic} background-${index}`}
                                    className="userCollectionList-card-background-img-group"
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          <div
                            className={`userCollectionList-card-image-preview ${
                              col.image.length === 0
                                ? "none"
                                : col.image.length === 1
                                ? "single"
                                : "multi"
                            }`}
                          >
                            {col.image.length === 0 ? (
                              <span className="userCollectionList-card-no-image oxanium-semibold">
                                No preview image shown
                              </span>
                            ) : col.image.length === 1 ? (
                              <img
                                src={buildImageUrl(
                                  col.image[0].urlImage,
                                  favUseBackupImg
                                )}
                                onError={() => setFavUseBackupImg(true)}
                                alt={`collection-0`}
                                className="userCollectionList-card-image-single"
                              />
                            ) : (
                              col.image.map((img, i) => (
                                <img
                                  key={img.id || i}
                                  src={buildImageUrl(
                                    img.urlImage,
                                    favUseBackupImg
                                  )}
                                  onError={() => setFavUseBackupImg(true)}
                                  alt={`collection-${i}`}
                                  className="userCollectionList-card-image-multi"
                                />
                              ))
                            )}
                          </div>

                          <div
                            className={`userCollectionList-card-overlay ${
                              isExpanded
                                ? "userCollectionList-card-overlay--expanded"
                                : ""
                            }`}
                            style={{
                              transition:
                                "max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s",
                              maxHeight: isExpanded ? "200px" : "60px",
                              opacity: isExpanded ? 1 : 0.9,
                              overflow: "hidden",
                            }}
                          >
                            <div className="userCollectionList-card-toggle">
                              <img
                                src={DetailArrow}
                                alt="Toggle"
                                className={`w-4 h-4 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                            <div
                              className="userCollectionList-card-slide-content"
                              style={{
                                transition:
                                  "transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s",
                                transform: isExpanded
                                  ? "translateY(0)"
                                  : "translateY(20px)",
                                opacity: isExpanded ? 1 : 0,
                                pointerEvents: isExpanded ? "auto" : "none",
                              }}
                            >
                              <div className="userCollectionList-card-title oxanium-bold">
                                {col.collectionTopic}
                              </div>
                              {/* <div className="userCollectionList-card-quantity oxanium-bold">Cards achieved: {col.count}</div> */}
                              <div className="userCollectionList-card-actions">
                                <button
                                  className="userCollectionList-view-button"
                                  onClick={() =>
                                    handleShowFavProducts(col.collectionTopic)
                                  }
                                >
                                  <span className="userCollectionList-view-button-text oleo-script-bold">
                                    View Collection
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {visibleCollections.map((col, idx) => {
                  const isExpanded = expandedCardIndex === idx;
                  return (
                    <div
                      key={col.id}
                      className={`userCollectionList-card-item ${
                        isExpanded
                          ? "userCollectionList-card-item--expanded"
                          : ""
                      }`}
                      onMouseEnter={() => setExpandedCardIndex(idx)}
                      onMouseLeave={() => setExpandedCardIndex(null)}
                    >
                      <div className="userCollectionList-card-background-preview">
                        {col.image.length === 0 ? (
                          <div className="userCollectionList-card-background-none">
                            <span>No preview image shown</span>
                          </div>
                        ) : col.image.length === 1 ? (
                          <div className="userCollectionList-card-background-single">
                            <img
                              src={buildImageUrl(
                                col.image[0].urlImage,
                                useBackupImg
                              )}
                              onError={() => setUseBackupImg(true)}
                              alt={`${col.collectionTopic} background`}
                              className="userCollectionList-card-background-img-single"
                            />
                          </div>
                        ) : (
                          <div className="userCollectionList-card-background-group">
                            {col.image.map((img, index) => (
                              <img
                                key={img.id || index}
                                src={buildImageUrl(img.urlImage, useBackupImg)}
                                onError={() => setUseBackupImg(true)}
                                alt={`${col.collectionTopic} background-${index}`}
                                className="userCollectionList-card-background-img-group"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div
                        className={`userCollectionList-card-image-preview ${
                          col.image.length === 0
                            ? "none"
                            : col.image.length === 1
                            ? "single"
                            : "multi"
                        }`}
                      >
                        {col.image.length === 0 ? (
                          <span className="userCollectionList-card-no-image oxanium-semibold">
                            No preview image shown
                          </span>
                        ) : col.image.length === 1 ? (
                          <img
                            src={buildImageUrl(
                              col.image[0].urlImage,
                              useBackupImg
                            )}
                            onError={() => setUseBackupImg(true)}
                            alt={`collection-0`}
                            className="userCollectionList-card-image-single"
                          />
                        ) : (
                          col.image.map((img, i) => (
                            <img
                              key={img.id}
                              src={buildImageUrl(img.urlImage, useBackupImg)}
                              onError={() => setUseBackupImg(true)}
                              alt={`collection-${i}`}
                              className="userCollectionList-card-image-multi"
                            />
                          ))
                        )}
                      </div>

                      <div
                        className={`userCollectionList-card-overlay ${
                          isExpanded
                            ? "userCollectionList-card-overlay--expanded"
                            : ""
                        }`}
                        style={{
                          transition:
                            "max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s",
                          maxHeight: isExpanded ? "200px" : "60px",
                          opacity: isExpanded ? 1 : 0.9,
                          overflow: "hidden",
                        }}
                      >
                        <div className="userCollectionList-card-toggle">
                          <img
                            src={DetailArrow}
                            alt="Toggle"
                            className={`w-4 h-4 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                        <div
                          className="userCollectionList-card-slide-content"
                          style={{
                            transition:
                              "transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s",
                            transform: isExpanded
                              ? "translateY(0)"
                              : "translateY(20px)",
                            opacity: isExpanded ? 1 : 0,
                            pointerEvents: isExpanded ? "auto" : "none",
                          }}
                        >
                          <div className="userCollectionList-card-title oxanium-bold">
                            {col.collectionTopic}
                          </div>
                          <div className="userCollectionList-card-quantity oxanium-bold">
                            Cards achieved: {col.count}
                          </div>
                          <div className="userCollectionList-card-actions">
                            <button
                              className="userCollectionList-view-button"
                              onClick={() => handleShowProducts(col.id)}
                            >
                              <span className="userCollectionList-view-button-text oleo-script-bold">
                                View Collection
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* End Line or Load More */}
            {/* {isEnd ? (
              <div className="userCollectionList-end-content oxanium-semibold divider divider-warning">
                * Favourite List *
              </div>
            ) : (
              <button
                className="userCollectionList-loadmore-button oxanium-semibold"
                onClick={() =>
                  setVisibleCount(count =>
                    Math.min(count + PAGE_SIZE, collections.length)
                  )
                }
              >
                Load more
              </button>
            )}*/}
          </div>
          <div className="userCollectionList-card-list-container">
            {/* End Line or Load More */}
            {isEndFavs ? (
              <div className="userCollectionList-end-content oxanium-semibold divider divider-warning">
                End of content
              </div>
            ) : (
              <button
                className="userCollectionList-loadmore-button oxanium-semibold"
                onClick={() =>
                  setFavVisibleCount((count) =>
                    Math.min(count + PAGE_SIZE, favImages.length)
                  )
                }
              >
                Load more
              </button>
            )}
          </div>
        </>
      )}

      {/* Product cards */}
      {showProducts && (
        <div className="userCollectionList-card-list-container">
          {productsLoading ? (
            // hiển thị skeleton giống phần loading global (hoặc 1 spinner nhỏ)
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
          ) : visibleProducts.length === 0 &&
            visiblefavProducts.length === 0 ? (
            <div className="text-gray-500 mt-2">This collection is empty.</div>
          ) : (
            (() => {
              // Chuẩn bị 2 list đã filter
              const primaryList = visibleProducts
                .filter((p) => (p.quantity ?? 0) > 0)
                .map((p) => ({ ...p, isFavorite: false }))
                .sort(sortByRarity); // <-- sort by rarity

              const secondaryList = visiblefavProducts
                .filter((p) => (p.quantity ?? 0) > 0)
                .map((p) => ({ ...p, isFavorite: true }));
              const listToRender =
                primaryList.length > 0 ? primaryList : secondaryList;
              const isPrimary = primaryList.length > 0;

              return (
                <div className="userCollectionList-card-grid">
                  {listToRender.map((prod) => {
                    // uniqueKey (an toàn nếu product đã được normalize)
                    const key = prod.userProductId ?? prod.id ?? prod.productId;
                    const isExpanded = expandedCardIndex === key;
                    const isDropdownOpen = !!dropdownStates[key];

                    // Ensure anchorRefs is an object keyed by product id
                    if (!anchorRefs.current) anchorRefs.current = {};
                    if (!anchorRefs.current[key])
                      anchorRefs.current[key] = React.createRef();

                    // Tag logic
                    const showQuantityUpdateIncTag =
                      prod.isQuantityUpdateInc && !quantityUpdateIncOff[key];
                    const showProductIsBlockTag = prod.product_isBlock;

                    return (
                      <div
                        key={key}
                        className={`userCollectionList-card-item ${
                          isExpanded
                            ? "userCollectionList-card-item--expanded"
                            : ""
                        }`}
                        onMouseEnter={() => setExpandedCardIndex(key)}
                        onMouseLeave={() => {
                          setExpandedCardIndex(null);
                          setDropdownStates({});
                        }}
                        onClick={() => {
                          // Only toggle isQuantityUpdateInc tag if it's showing
                          if (showQuantityUpdateIncTag) {
                            setQuantityUpdateIncOff((prev) => ({
                              ...prev,
                              [key]: true,
                            }));
                          }
                        }}
                      >
                        {/* product_isBlock tag (top left, always visible if true) */}
                        {showProductIsBlockTag && (
                          <div className="userCollectionList-tag-block oxanium-regular">
                            System Banned
                          </div>
                        )}

                        {/* isQuantityUpdateInc tag (top right, can be toggled off) */}
                        {showQuantityUpdateIncTag && (
                          <div
                            className={`userCollectionList-tag-quantity-update oxanium-regular ${
                              showProductIsBlockTag ? "with-block" : ""
                            }`}
                          >
                            Collection Updated
                          </div>
                        )}

                        <div className="userCollectionList-card-background">
                          <img
                            src={buildImageUrl(prod.urlImage, useBackupImg)}
                            onError={() => setUseBackupImg(true)}
                            alt={`${prod.productName} background`}
                          />
                        </div>

                        <img
                          src={buildImageUrl(prod.urlImage, useBackupImg)}
                          onError={() => setUseBackupImg(true)}
                          alt={prod.productName}
                          className="userCollectionList-card-image"
                        />

                        <div
                          className={`userCollectionList-card-overlay ${
                            isExpanded
                              ? "userCollectionList-card-overlay--expanded"
                              : ""
                          }`}
                          style={{
                            transition:
                              "max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s",
                            maxHeight: isExpanded ? "300px" : "60px",
                            opacity: isExpanded ? 1 : 0.85,
                            overflow: "hidden",
                          }}
                        >
                          <div className="userCollectionList-card-toggle">
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

                          <div
                            className="userCollectionList-card-slide-content"
                            style={{
                              transition:
                                "transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s",
                              transform: isExpanded
                                ? "translateY(0)"
                                : "translateY(30px)",
                              opacity: isExpanded ? 1 : 0,
                              pointerEvents: isExpanded ? "auto" : "none",
                            }}
                          >
                            {isExpanded && (
                              <>
                                <div className="userCollectionList-card-title oxanium-bold">
                                  {prod.productName}
                                </div>
                                {/* nếu model có quantity */}
                                {!prod.isFavorite &&
                                  typeof prod.quantity !== "undefined" && (
                                    <div className="userCollectionList-card-quantity oxanium-bold">
                                      Qty: {prod.quantity}
                                    </div>
                                  )}

                                <div className="userCollectionList-card-actions">
                                  <button
                                    className="userCollectionList-view-button"
                                    onClick={() =>
                                      navigate(
                                        `/collectiondetailpage/${
                                          prod.productId ?? prod.id
                                        }`
                                      )
                                    }
                                  >
                                    <span className="userCollectionList-view-button-text oleo-script-bold">
                                      View Detail
                                    </span>
                                  </button>

                                  <div className="userCollectionList-dropdown-container">
                                    <button
                                      ref={anchorRefs.current[key]}
                                      onClick={() =>
                                        setDropdownStates((prev) => ({
                                          ...prev,
                                          [key]: !prev[key],
                                        }))
                                      }
                                      className="userCollectionList-more-button oxanium-bold"
                                    >
                                      <img
                                        src={ThreeDots}
                                        alt="More Icon"
                                        className="userCollectionList-more-icon"
                                      />
                                    </button>

                                    <DropdownMenu
                                      anchorRef={anchorRefs.current[key]}
                                      isOpen={isDropdownOpen}
                                      onClose={() =>
                                        setDropdownStates((prev) => ({
                                          ...prev,
                                          [key]: false,
                                        }))
                                      }
                                    >
                                      {(isPrimary
                                        ? [
                                            {
                                              text: "Add to Favorite",
                                              action: () =>
                                                handleAddFavourite(
                                                  prod.id ?? prod.userProductId,
                                                  prod.productName
                                                ),
                                            },
                                            // Hide "Public to Sell" and "Host an Auction" if product_isBlock is true
                                            ...(!prod.product_isBlock
                                              ? [
                                                  {
                                                    text: "Public to Sell",
                                                    action: () =>
                                                      openSellModal(prod),
                                                  },
                                                  {
                                                    text: "Host an Auction",
                                                    action: () =>
                                                      openAuctionModal(
                                                        prod.productId ??
                                                          prod.userProductId
                                                      ),
                                                  },
                                                ]
                                              : []),
                                          ]
                                        : [
                                            {
                                              text: "Remove from Favorites",
                                              action: () =>
                                                handleRemove(
                                                  prod.id ?? prod.userProductId
                                                ),
                                            },
                                          ]
                                      ).map((item, i) => (
                                        <div
                                          key={i}
                                          className="userCollectionList-dropdown-item oxanium-regular"
                                          onClick={() => {
                                            item.action();
                                            setDropdownStates({});
                                          }}
                                        >
                                          {item.text}
                                        </div>
                                      ))}
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}

          {/* Sell Modal */}
          <SellFormModal
            isOpen={sellModalOpen}
            onClose={() => setSellModalOpen(false)}
            onSubmit={handleSellProduct}
            product={sellModalProduct}
            form={sellForm}
            setForm={setSellForm}
            loading={sellLoading}
            result={sellResult}
            minDescLength={10}
            maxDescLength={300}
            minPrice={1000}
            maxPrice={100000000}
            multilineDescription={true}
          />

          {isEnd ? (
            <div className="userCollectionList-end-content oxanium-semibold divider divider-warning">
              End of content
            </div>
          ) : (
            <button
              className="userCollectionList-loadmore-button oxanium-semibold"
              onClick={() =>
                setVisibleCount((count) =>
                  Math.min(count + PAGE_SIZE, products.length)
                )
              }
            >
              Load more
            </button>
          )}
        </div>
      )}

      {/* Message Modal */}
      <MessageModal
        open={modal.open}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
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

      {/* Host Auction request modal */}
      <HostAuctionModal
        open={auctionModalOpen}
        onClose={() => setAuctionModalOpen(false)}
        productId={auctionProductId}
        collectionId={selectedCollectionId}
        onSuccess={(res) => {
          // optional: refresh state, show message
          showModal?.(
            "default",
            "Auction Request Sent",
            "Please wait for moderator approval."
          );
          setAuctionModalOpen(false);
          // maybe trigger refreshOnSaleProducts or reload collection
          // if (typeof refreshOnSaleProducts === "function") refreshOnSaleProducts();
        }}
      />
    </>
  );
}
