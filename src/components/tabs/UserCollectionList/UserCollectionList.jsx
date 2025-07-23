import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserCollectionList.css';
import { getAllCollectionOfProfile } from '../../../services/api.user';
import { getAllProductOfUserCollection, createSellProduct } from '../../../services/api.user';
import DetailArrow from '../../../assets/Icon_line/Chevron_Up.svg';
import ThreeDots from '../../../assets/Icon_fill/Meatballs_menu.svg';
import MessageModal from '../../libs/MessageModal/MessageModal';
import DropdownMenu from '../../libs/DropdownMenu/DropdownMenu';
import SellFormModal from '../../libs/SellFormModal/SellFormModal';

const PAGE_SIZE = 8;

export default function UserCollectionList({ refreshOnSaleProducts }) {
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingBtnId, setLoadingBtnId] = useState(null);
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });
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
  const buttonRef = useRef();

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

  // Open sell modal
  const openSellModal = (product) => {
    setSellModalProduct(product);
    setSellForm({ quantity: 1, description: '', price: 100000 });
    setSellModalOpen(true);
    setSellResult(null);
  };

  // Handle sell product from modal
  const handleSellProduct = async (e) => {
    e.preventDefault();
    // Validation: all fields required
    if (!sellForm.quantity || !sellForm.description.trim() || !sellForm.price) {
      return showModal('warning', 'Required Action', "Please enter all fields to sell.");
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
    // <div>
    //   <h3>User Collections</h3>
    //   {collections.length === 0 ? (
    //     <div>No collections found.</div>
    //   ) : (
    //     <ul>
    //       {collections.map(col => (
    //         <li key={col.id}>
    //           <strong>{col.collectionTopic}</strong> (Count: {col.count})
    //           <button style={{ marginLeft: 8 }} onClick={() => handleShowProducts(col.id)}>
    //             View Products
    //           </button>
    //         </li>
    //       ))}
    //     </ul>
    //   )}

    //   {showProducts && (
    //     <div style={{ marginTop: 16 }}>
    //       <button style={{ marginBottom: 8 }} onClick={() => { setShowProducts(false); setSelectedCollectionId(null); setProducts([]); }}>Close Products</button>
    //       <h4>Products in Collection</h4>
    //       {products.length === 0 ? (
    //         <div>No products found in this collection.</div>
    //       ) : (
    //         <ul>
    //           {products.map(prod => (
    //             <li key={prod.userProductId} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
    //               <img
    //                 src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${prod.urlImage}`}
    //                 alt={prod.productName}
    //                 style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginRight: 12 }}
    //               />
    //               <div style={{ flex: 1 }}>
    //                 <div><b>{prod.productName}</b></div>
    //                 <div>Quantity: <span style={{ fontWeight: 500 }}>{prod.quantity}</span></div>
    //               </div>
    //               <button style={{ marginLeft: 8 }} onClick={() => openSellModal(prod)}>
    //                 Sell
    //               </button>
    //             </li>
    //           ))}
    //           {/* Sell Modal */}
    //           {sellModalOpen && (
    //             <div style={{
    //               position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    //               background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    //             }} onClick={() => setSellModalOpen(false)}>
    //               <div style={{ background: '#fff', color: '#222', borderRadius: 12, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.3)', position: 'relative' }} onClick={e => e.stopPropagation()}>
    //                 <button style={{ position: 'absolute', top: 8, right: 12, background: 'none', border: 'none', color: '#222', fontSize: 22, cursor: 'pointer' }} onClick={() => setSellModalOpen(false)}>&times;</button>
    //                 <h4>Sell Product</h4>
    //                 <div style={{ marginBottom: 12 }}><b>{sellModalProduct?.productName}</b></div>
    //                 <form onSubmit={handleSellProduct}>
    //                   <div style={{ marginBottom: 8 }}>

    //                     <label>Quantity: </label>
    //                     <input type="number" min={1} value={sellForm.quantity} onChange={e => setSellForm(f => ({ ...f, quantity: Number(e.target.value) }))} required style={{ width: 60 }} />
    //                   </div>
    //                   <div style={{ marginBottom: 8 }}>
    //                     <label>Description: </label>
    //                     <input type="text" value={sellForm.description} onChange={e => setSellForm(f => ({ ...f, description: e.target.value }))} required style={{ width: '90%' }} />
    //                   </div>
    //                   <div style={{ marginBottom: 8 }}>
    //                     <label>Price: </label>
    //                     <input type="number" min={1000} step={1000} value={sellForm.price} onChange={e => setSellForm(f => ({ ...f, price: Number(e.target.value) }))} required style={{ width: 100 }} />
    //                   </div>
    //                   <button type="submit" disabled={sellLoading} style={{ marginTop: 8 }}>
    //                     {sellLoading ? 'Selling...' : 'Confirm Sell'}
    //                   </button>
    //                 </form>
    //                 {sellResult && (
    //                   <div style={{ marginTop: 8, color: sellResult.status ? 'green' : 'red' }}>
    //                     {sellResult.status ? sellResult.data?.message : (sellResult.error || 'Failed to sell product.')}
    //                     {sellResult.status && sellResult.data?.exchangeCode && (
    //                       <div>Exchange Code: <b>{sellResult.data.exchangeCode}</b>
    //                         <p>After you sell successful , we will deduct 5% of your profit</p>
    //                       </div>
    //                     )}
    //                   </div>
    //                 )}
    //               </div>
    //             </div>
    //           )}
    //         </ul>
    //       )}
    //       {sellResult && (
    //         <div style={{ marginTop: 8, color: sellResult.status ? 'green' : 'red' }}>
    //           {sellResult.status ? sellResult.data?.message : (sellResult.error || 'Failed to sell product.')}
    //           {sellResult.status && sellResult.data?.exchangeCode && (
    //             <div>Exchange Code: <b>{sellResult.data.exchangeCode}</b>
    //               <p>After you sell successful , we will deduct 5% of your profit</p>
    //             </div>
    //           )}
    //         </div>
    //       )}
    //     </div>
    //   )}
    // </div>
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
                      {col.image.length === 1 ? (
                        <div className="userCollectionList-card-background-single">
                          <img
                            src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${col.image[0].urlImage}`}
                            alt={`${col.collectionTopic} background`}
                            className="userCollectionList-card-background-img"
                          />
                        </div>
                      ) : (
                        <div className="userCollectionList-card-background-group">
                          {col.image.map((img, index) => (
                            <img
                              key={img.id || index}
                              src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${img.urlImage}`}
                              alt={`${col.collectionTopic} background-${index}`}
                              className="userCollectionList-card-background-img"
                            />
                          ))}
                        </div>
                      )}
                    </div>


                    <div className={`userCollectionList-card-image-preview ${col.image.length === 1 ? "single" : "multi"}`}>
                      {col.image.length === 1 ? (
                        <img
                          src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${col.image[0].urlImage}`}
                          alt={`collection-0`}
                          className="userCollectionList-card-image-single"
                        />
                      ) : (
                        col.image.map((img, i) => (
                          <img
                            key={img.id}
                            src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${img.urlImage}`}
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
            <div className="text-gray-500 mt-2">No products found in this collection.</div>
          ) : (
            <div className="userCollectionList-card-grid">
              {visibleProducts
                .filter(prod => prod.quantity > 0)
                .map((prod, idx) => {
                  const isExpanded = expandedCardIndex === idx;
                  return (
                    <div
                      key={prod.userProductId}
                      className={`userCollectionList-card-item ${isExpanded ? 'userCollectionList-card-item--expanded' : ''}`}
                      onMouseEnter={() => setExpandedCardIndex(idx)}
                      onMouseLeave={() => setExpandedCardIndex(null)}
                    >
                      <div className="userCollectionList-card-background">
                        <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${prod.urlImage}`} alt={`${prod.productName} background`} />
                      </div>
                      <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${prod.urlImage}`} alt={prod.productName} className="userCollectionList-card-image" />
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
                                <div className="userCollectionList-dropdown-container"
                                  onMouseEnter={() => setIsDropdownOpen(idx)}
                                  onMouseLeave={() => setIsDropdownOpen(null)}
                                >
                                  <button
                                    ref={buttonRef}
                                    className="userCollectionList-more-button oxanium-bold"
                                  >
                                    <img src={ThreeDots} alt="More Icon" className='userCollectionList-more-icon' />
                                  </button>
                                  <DropdownMenu anchorRef={buttonRef} isOpen={isDropdownOpen === idx} onClose={() => setIsDropdownOpen(null)}>
                                    <div
                                      className="userCollectionList-dropdown-item oxanium-regular"
                                      onClick={() => {
                                        // Add your API handling for Add to Favorite here
                                        setIsDropdownOpen(null); // Close menu
                                      }}
                                    >
                                      Add to Favorite
                                    </div>
                                    <div
                                      className="userCollectionList-dropdown-item oxanium-regular"
                                      onClick={() => {
                                        openSellModal(prod);
                                        setIsDropdownOpen(null); // Close menu
                                      }}
                                    >
                                      Public to sell
                                    </div>
                                    <div
                                      className="userCollectionList-dropdown-item oxanium-regular"
                                      onClick={() => {
                                        // Add your API handling for Host an auction here
                                        setIsDropdownOpen(null); // Close menu
                                      }}
                                    >
                                      Host an auction
                                    </div>
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
