import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserCollectionList.css';
import { getAllCollectionOfProfile } from '../../../services/api.user';
import { getAllProductOfUserCollection, createSellProduct } from '../../../services/api.user';
import { buildImageUrl } from '../../../services/api.imageproxy';
import DetailArrow from '../../../assets/Icon_line/Chevron_Up.svg';
import ThreeDots from '../../../assets/Icon_fill/Meatballs_menu.svg';
import MessageModal from '../../libs/MessageModal/MessageModal';
import DropdownMenu from '../../libs/DropdownMenu/DropdownMenu';
import SellFormModal from '../../libs/SellFormModal/SellFormModal';

const PAGE_SIZE = 8;

export default function UserCollectionList({ refreshOnSaleProducts }) {
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [useBackupImg, setUseBackupImg] = useState(false);
  const [loadingBtnId, setLoadingBtnId] = useState(null);
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });
  const [dropdownStates, setDropdownStates] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [products, setProducts] = useState([]);
  const [showProducts, setShowProducts] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);
  const [sellResult, setSellResult] = useState(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellModalProduct, setSellModalProduct] = useState(null);
  const [sellForm, setSellForm] = useState({ quantity: 1, description: '', price: 100000 });

  const navigate = useNavigate();
  const anchorRefs = useRef([]);

  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
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
        setError('Failed to load products.');
      }
      setLoading(false);
    };
    fetchCollections();
  }, []);

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

  // Pagination for collections
  const visibleCollections = collections.slice(0, visibleCount);
  const filteredProducts = products.filter(p => p.quantity > 0);
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const isEnd = visibleCount >= (showProducts ? filteredProducts.length : collections.length) || visibleCount >= 16;

  const handleShowProducts = async (collectionId) => {
    setSelectedCollectionId(collectionId);
    setShowProducts(true);
    setSellResult(null);
    await fetchProductsOfCollection(collectionId);
  };

    const toggleDropdown = (idx) => {
    setDropdownStates(prev => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), [idx]: !prev[idx] }));
  };

  // Open sell modal
  const openSellModal = (product) => {
    setSellModalProduct(product);
    setSellForm({ quantity: 1, description: '', price: '' });
    setSellModalOpen(true);
    setSellResult(null);
  };

  // Handle sell product from modal
  const handleSellProduct = async (e) => {
    e.preventDefault();
    // Validation: all fields required
    if (!sellForm.quantity || !sellForm.description.trim() || sellForm.price === "" || sellForm.price === null || isNaN(Number(sellForm.price))) {
      return showModal('warning', 'Required Action', "Please enter all fields to sell.");
    }
    // Validation: price must be positive and not zero
    if (Number(sellForm.price) <= 0) {
      return showModal('warning', 'Invalid Price', "Price must be greater than 0.");
    }
    // Validation: description length 10-300 characters
    const descLength = sellForm.description.trim().length;
    if (descLength < 10 || descLength > 300) {
      return showModal('warning', 'Description length', "Description must be between 10 and 300 characters.");
    }
    // Validation: price between 1000 and 100000000
    if (Number(sellForm.price) < 1000 || Number(sellForm.price) > 100000000) {
      return showModal('warning', 'Price out of range', "Price must be between 1,000 and 100,000,000.");
    }
    // Validation: quantity must be > 0
    if (sellForm.quantity <= 0) {
      alert('Quantity must be greater than 0.');
      return;
    }
    // Validation: quantity must not exceed owned
    if (sellForm.quantity > (sellModalProduct?.quantity || 0)) {
      return showModal('warning', 'Imbalance stock', "This collection does not have enough quantity to sell.");
    }
    // Try to get userProductId from multiple possible fields for robustness
    let userProductId = sellModalProduct?.userProductId || sellModalProduct?.UserProductId || sellModalProduct?.id;
    if (!userProductId) {
      // Try to find any key that looks like userProductId (case-insensitive)
      const possibleIdKey = Object.keys(sellModalProduct || {}).find(k => k.toLowerCase().includes('userproductid'));
      if (possibleIdKey) {
        userProductId = sellModalProduct[possibleIdKey];
      }
    }
    if (!userProductId) {
      console.error('Sell modal product object:', sellModalProduct);
      return showModal('error', 'Error', 'Product ID is missing. Cannot sell this product.');;
    }
    setSellLoading(true);
    setSellResult(null);
    const { quantity, description, price } = sellForm;
    // Debug log
    console.log('Selling with UserProductId:', userProductId, 'Full product:', sellModalProduct);
    const res = await createSellProduct({ userProductId, quantity, description, price });
    setSellLoading(false);
    setSellResult(res);
    if (res && res.status) {
      // Refetch on-sale products for UI update
      if (typeof refreshOnSaleProducts === 'function') {
        refreshOnSaleProducts();
      }
      // Refresh the user's collection products after selling
      if (selectedCollectionId) {
        await fetchProductsOfCollection(selectedCollectionId);
      }
      // Show user a confirmation and refetch their on-sale products
      showModal('default', 'Your product is now on sale', 'After a successful sale, 5% of your profit will be deducted.');
      // Close the modal
      setSellModalOpen(false);
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
            <span className="mx-2">{'›'}</span>
            <span className="cursor-default">
              {collections.find(col => col.id === selectedCollectionId)?.collectionTopic || 'Unknown'}
            </span>
          </>
        ) : (
          <span>Collection Topic</span>
        )}
      </div>

      {/* Collection cards */}
      {!showProducts && (
        <div className="userCollectionList-card-list-container">
          {visibleCollections.length === 0 ? (
            <div className="text-gray-500 mt-2">No collections found.</div>
          ) : (
            <div className="userCollectionList-card-grid">
              {visibleCollections.map((col, idx) => {
                const isExpanded = expandedCardIndex === idx;
                return (
                  <div
                    key={col.id}
                    className={`userCollectionList-card-item ${isExpanded ? 'userCollectionList-card-item--expanded' : ''}`}
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
                            src={buildImageUrl(col.image[0].urlImage, useBackupImg)}
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

                    <div className={`userCollectionList-card-image-preview ${col.image.length === 0 ? "none" : col.image.length === 1 ? "single" : "multi"
                      }`}>
                      {col.image.length === 0 ? (
                        <span className="userCollectionList-card-no-image oxanium-semibold">No preview image shown</span>
                      ) : col.image.length === 1 ? (
                        <img
                          src={buildImageUrl(col.image[0].urlImage, useBackupImg)}
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
                      className={`userCollectionList-card-overlay ${isExpanded ? 'userCollectionList-card-overlay--expanded' : ''}`}
                      style={{
                        transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
                        maxHeight: isExpanded ? '200px' : '60px',
                        opacity: isExpanded ? 1 : 0.9,
                        overflow: 'hidden',
                      }}
                    >
                      <div className="userCollectionList-card-toggle">
                        <img src={DetailArrow} alt="Toggle" className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                      <div
                        className="userCollectionList-card-slide-content"
                        style={{
                          transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
                          transform: isExpanded ? 'translateY(0)' : 'translateY(20px)',
                          opacity: isExpanded ? 1 : 0,
                          pointerEvents: isExpanded ? 'auto' : 'none',
                        }}
                      >
                        <div className="userCollectionList-card-title oxanium-bold">{col.collectionTopic}</div>
                        <div className="userCollectionList-card-quantity oxanium-bold">Cards achieved: {col.count}</div>
                        <div className="userCollectionList-card-actions">
                          <button
                            className="userCollectionList-view-button"
                            onClick={() => handleShowProducts(col.id)}
                          >
                            <span className="userCollectionList-view-button-text oleo-script-bold">View Collection</span>
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
          {isEnd ? (
            <div className="userCollectionList-end-content oxanium-semibold divider divider-warning">
              End of content
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
          )}
        </div>
      )}


      {/* Product cards */}
      {showProducts && (
        <div className="userCollectionList-card-list-container">
          {visibleProducts.length === 0 ? (
            <div className="text-gray-500 mt-2">This collection is empty.</div>
          ) : (
            <div className="userCollectionList-card-grid">
              {visibleProducts
                .filter(prod => prod.quantity > 0)
                .map((prod, idx) => {
                  const isExpanded = expandedCardIndex === idx;
                  const isDropdownOpen = !!dropdownStates[idx];
                  // Ensure anchorRefs.current[idx] exists
                  if (!anchorRefs.current[idx]) anchorRefs.current[idx] = React.createRef();
                  return (
                    <div
                      key={prod.userProductId}
                      className={`userCollectionList-card-item ${isExpanded ? 'userCollectionList-card-item--expanded' : ''}`}
                      onMouseEnter={() => setExpandedCardIndex(idx)}
                      onMouseLeave={() => { setExpandedCardIndex(null); setDropdownStates({}); }}
                    >
                      <div className="userCollectionList-card-background">
                        <img src={buildImageUrl(prod.urlImage, useBackupImg)} onError={() => setUseBackupImg(true)} alt={`${prod.productName} background`} />
                      </div>
                      <img src={buildImageUrl(prod.urlImage, useBackupImg)} onError={() => setUseBackupImg(true)} alt={prod.productName} className="userCollectionList-card-image" />
                      <div
                        className={`userCollectionList-card-overlay ${isExpanded ? 'userCollectionList-card-overlay--expanded' : ''}`}
                        style={{
                          transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
                          maxHeight: isExpanded ? '300px' : '60px',
                          opacity: isExpanded ? 1 : 0.85,
                          overflow: 'hidden',
                        }}
                      >
                        <div className="userCollectionList-card-toggle">
                          <img src={DetailArrow} style={{ width: '16px', height: '16px', transition: 'transform 0.3s' }} className={isExpanded ? 'rotate-180' : ''} />
                        </div>
                        <div
                          className="userCollectionList-card-slide-content"
                          style={{
                            transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
                            transform: isExpanded ? 'translateY(0)' : 'translateY(30px)',
                            opacity: isExpanded ? 1 : 0,
                            pointerEvents: isExpanded ? 'auto' : 'none',
                          }}
                        >
                          {isExpanded && (
                            <>
                              <div className="userCollectionList-card-title oxanium-bold">{prod.productName}</div>
                              <div className="userCollectionList-card-quantity oxanium-bold">Qty: {prod.quantity}</div>
                              <div className="userCollectionList-card-actions">
                                <button
                                  className="userCollectionList-view-button"
                                  onClick={() => navigate(`/collectiondetailpage/${prod.productId}`)}
                                >
                                  <span className="userCollectionList-view-button-text oleo-script-bold">View Detail</span>
                                </button>
                                <div className="userCollectionList-dropdown-container">
                                  <button
                                    ref={anchorRefs.current[idx]}
                                    onClick={() => toggleDropdown(idx)}
                                    className="userCollectionList-more-button oxanium-bold"
                                  >
                                    <img src={ThreeDots} alt="More Icon" className='userCollectionList-more-icon' />
                                  </button>
                                  <DropdownMenu anchorRef={anchorRefs.current[idx]} isOpen={isDropdownOpen} onClose={() => toggleDropdown(idx)}>
                                    {[
                                      { text: "Add to Favorite", action: () => { } },
                                      { text: "Public to Sell", action: () => openSellModal(prod) },
                                      { text: "Host an Auction", action: () => { } },
                                    ].map((item, i) => (
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

            </div>
          )}

          {isEnd ? (
            <div className="userCollectionList-end-content oxanium-semibold divider divider-warning">
              End of content
            </div>
          ) : (
            <button
              className="userCollectionList-loadmore-button oxanium-semibold"
              onClick={() => setVisibleCount(count => Math.min(count + PAGE_SIZE, 16, products.length))}
            >
              Load more
            </button>
          )}
        </div>
      )}

      {/* Message Modal */}
      <MessageModal
        open={modal.open}
        onClose={() => setModal(prev => ({ ...prev, open: false }))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </>


  );
}
