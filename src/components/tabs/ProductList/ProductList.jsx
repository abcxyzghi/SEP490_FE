// System Box  ||  System Product (from other user)  ||  User’s Box List  ||  User’s Product (Sell) List
import React, { useEffect, useState } from 'react';
import './ProductList.css';
import { useNavigate } from 'react-router-dom';
import { getAllProductsOnSale } from '../../../services/api.product';
import CubeLoader from '../../libs/CubeLoader/CubeLoader';
import DetailArrow from '../../../assets/Icon_line/Chevron_Up.svg';
import AddToCart from '../../../assets/Icon_fill/Bag_fill.svg';
import { addToCart } from '../../../services/api.cart';
import { useDispatch } from 'react-redux';
import { addItemToCart } from '../../../redux/features/cartSlice';

const PAGE_SIZE = 8;

export default function ProductList({ searchText, selectedSort, ascending, priceRange, selectedRarities, activeTab }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await getAllProductsOnSale();
        if (result && result.status) {
          setProducts(result.data);
          setError(null);
        } else {
          setProducts([]);
          setError('Failed to load products.');
        }
      } catch {
        setProducts([]);
        setError('Failed to load products.');
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);


  useEffect(() => {
    setVisibleCount(PAGE_SIZE); // Reset back to first page
  }, [searchText, priceRange, selectedRarities, selectedSort, ascending]);


  // Show loading skeleton while fetching data
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 p-4">
        {[...Array(PAGE_SIZE)].map((_, index) => (
          <div key={index} className="flex justify-center w-full flex-col gap-4">
            <div className="skeleton h-42 w-full bg-slate-300"></div>
            <div className="skeleton h-4 w-28 bg-slate-300"></div>
            <div className="skeleton h-4 w-full bg-slate-300"></div>
            <div className="skeleton h-4 w-full bg-slate-300"></div>
          </div>
        ))}
      </div>
    );
  }

  // Check for error after loading
  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  // Make it case-insensitive and defensive
  const normalizeRarity = (rarity) =>
    rarity ? rarity.trim().toLowerCase().replace(/^\w/, c => c.toUpperCase()) : '';

  // Filter products based on search text, price range, rarities
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchText.toLowerCase()) &&
    (priceRange >= 500 || product.price / 1000 <= priceRange) &&
    (selectedRarities.length === 0 || selectedRarities.includes(normalizeRarity(product.rarityName)))
    // (selectedRarities.length === 0 || selectedRarities.includes(product.rarity || ''))
  );

  // Sort filteredProducts based on selectedSort and ascending
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let valA, valB;
    switch (selectedSort) {
      case 'Price':
        valA = a.price;
        valB = b.price;
        break;
      case 'Name':
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        break;
      case 'Release date':
      default:
        valA = new Date(a.createdAt || 0);
        valB = new Date(b.createdAt || 0);
        break;
    }
    if (valA < valB) return ascending ? -1 : 1;
    if (valA > valB) return ascending ? 1 : -1;
    return 0;
  });

  // Limit the number of visible products
  const visibleProducts = sortedProducts.slice(0, visibleCount);
  const isEnd = visibleCount >= filteredProducts.length || visibleCount >= 16;
  const noDataFetched = products.length === 0;
  const noSearchResults = products.length > 0 && filteredProducts.length === 0;

  const truncate = (str, n) => (str.length > n ? str.slice(0, n - 1) + '…' : str);

  // Add to cart handler
  const handleAddToCart = async (productId) => {
    try {
      await addToCart({ sellProductId: productId });
      // Find the product info for Redux
      const product = products.find(p => p.id === productId);
      if (product) {
        dispatch(addItemToCart({
          id: product.id,
          type: 'product',
          name: product.name,
          price: product.price,
          image: product.urlImage,
          quantity: 1
        }));
      }
      alert('✅ Added to cart!');
    } catch (error) {
      alert('❌ Failed to add to cart.');
      console.error(error);
    }
  };

  return (
    <div className="productList-card-list-container">
      <div className="productList-card-grid">
        {visibleProducts.map((item, index) => {
          const isExpanded = expandedCardIndex === index;
          return (
            <div
              className={`productList-card-item ${isExpanded ? 'productList-card-item--expanded' : ''}`}
              key={index}
              onMouseEnter={() => setExpandedCardIndex(index)}
              onMouseLeave={() => setExpandedCardIndex(null)}
            >
              <div className="productList-card-background">
                <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${item.urlImage}`} alt={`${item.name} background`} />
              </div>
              <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${item.urlImage}`} alt={item.name} className="productList-card-image" />
              <div
                className={`productList-card-overlay ${isExpanded ? 'productList-card-overlay--expanded' : ''}`}
                onClick={() => setExpandedCardIndex(isExpanded ? null : index)}
                style={{
                  transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
                  maxHeight: isExpanded ? '300px' : '60px',
                  opacity: isExpanded ? 1 : 0.85,
                  overflow: 'hidden',
                }}
              >
                <div className="productList-card-toggle">
                  <img src={DetailArrow} style={{ width: '16px', height: '16px', transition: 'transform 0.3s' }} className={isExpanded ? 'rotate-180' : ''} />
                </div>
                <div
                  className="productList-card-slide-content"
                  style={{
                    transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
                    transform: isExpanded ? 'translateY(0)' : 'translateY(30px)',
                    opacity: isExpanded ? 1 : 0,
                    pointerEvents: isExpanded ? 'auto' : 'none',
                  }}
                >
                  {isExpanded && (
                    <>
                      <div className="productList-card-title oxanium-bold">
                        {truncate(item.name, 30)}
                      </div>
                      <div className='productList-sub-info'>
                        <div className="productList-card-price oxanium-bold">{(item.price / 1000).toFixed(3)} VND</div>
                        <div className="productList-card-sellerName oxanium-bold" >
                          {/* Add On-click to seller profile */}
                          {truncate(item.username, 10)}
                        </div>
                      </div>
                      <div className="productList-card-actions">
                        <button
                          className="productList-view-button"
                          onClick={() => navigate(`/productdetailpage/${item.id}`)}
                        >
                          <span className="productList-view-button-text oleo-script-bold">View Detail</span>
                        </button>
                        <button
                          className="productList-cart-button oleo-script-bold"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item.id);
                          }}
                        >
                          <img src={AddToCart} alt="Cart Icon" className='productList-cart-icon' />
                          Cart
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {noDataFetched && (
        <div className="text-center text-gray-400 mt-6">No products to display yet.</div>
      )}

      {noSearchResults && (
        <div className="text-center text-gray-400 mt-6">No products found for your search.</div>
      )}

      {isEnd ? (
        <div className="productList-end-content oxanium-semibold divider divider-warning">
          End of content
        </div>
      ) : (
        <button
          className="productList-loadmore-button oxanium-semibold"
          onClick={() => setVisibleCount(count => Math.min(count + PAGE_SIZE, 16, products.length))}
        >
          Load more
        </button>
      )}
    </div>
  );
}
