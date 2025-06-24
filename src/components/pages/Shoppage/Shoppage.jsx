/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import ImageCarousel from '../../libs/Carousel/Carousel';
import { getAllMysteryBoxes } from '../../../services/api.mysterybox'
import { getAllProductsOnSale } from '../../../services/api.product'
import { useNavigate } from 'react-router-dom'
import './Shoppage.css';
import searchIcon from '../../../assets/Search_alt.svg';
import filterIcon from '../../../assets/icon/filter_icon.svg';
import sortIcon from '../../../assets/icon/sort_icon.svg';
import vectorIcon from '../../../assets/icon/Vector.svg';
import CartIcon from '../../../assets/icon/Bag_fill.svg';
import { Carousel } from 'antd';
import CarouselCustom from '../../libs/CarouselCustom/CarouselCustom';
import { addToCart } from '../../../services/api.cart';
import { useDispatch } from 'react-redux';

import { addItemToCart } from '../../../redux/features/cartSlice';
export default function Shoppage() {
  const [boxes, setBoxes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);
  const [errorProducts, setErrorProducts] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchBoxes = async () => {
    try {
      const result = await getAllMysteryBoxes();
      if (result && result.status) {
        setBoxes(result.data);
        setError(null);
      } else {
        setBoxes([]);
        setError('Failed to load mystery boxes.');
      }
    } catch {
      setBoxes([]);
      setError('Failed to load mystery boxes.');
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const result = await getAllProductsOnSale();
      if (result && result.status) {
        setProducts(result.data);
        setErrorProducts(null);
      } else {
        setProducts([]);
        setErrorProducts('Failed to load products.');
      }
    } catch {
      setProducts([]);
      setErrorProducts('Failed to load products.');
    }
    setLoadingProducts(false);
  };

  useEffect(() => {
    fetchBoxes();
    fetchProducts();
  }, []);

  const handleAddToCart = async (item) => {
    try {
      let payload = {};
      let cartItem = {};

      if (selectedTab === 'Mystery Boxes') {
        payload.mangaBoxId = item.id;
        cartItem = {
          id: item.id,
          name: item.mysteryBoxName,
          image: item.urlImage,
          price: item.mysteryBoxPrice,
          type: 'box',
          quantity: 1,
        };
      } else if (selectedTab === 'Collection Store') {
        payload.sellProductId = item.id;
        cartItem = {
          id: item.id,
          name: item.name,
          image: item.productImage,
          price: item.price,
          type: 'product',
          quantity: 1,
        };
      }

      if (!payload.sellProductId && !payload.mangaBoxId) {
        alert('❌ Failed to add to cart: No valid product or box ID.');
        return;
      }

      // Gọi API
      await addToCart(payload);

      // Cập nhật vào Redux
      dispatch(addItemToCart(cartItem));

      alert('🛒 Added to cart successfully');
    } catch (error) {
      console.log(error)
      alert('❌ Failed to add to cart');
    }
  };


  const [selectedFilter, setSelectedFilter] = useState('');
  const [selectedSort, setSelectedSort] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Mystery Boxes');
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);

  const filterOptions = ['Category', 'Price', 'Brand'];
  const sortOptions = ['Release Date', 'Popularity', 'Price'];

  const handleFilterSelect = (option) => {
    setSelectedFilter(option);
    setShowFilterMenu(false);
  };

  const handleSortSelect = (option) => {
    setSelectedSort(option);
    setShowSortMenu(false);
  };

  if (loading || loadingProducts) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayedItems = selectedTab === 'Mystery Boxes' ? boxes : products;

  return (
    <div className="shoppage-container">
      <div className='shoppage-carousel'>
        <CarouselCustom
          images={[
            "https://fastcdn.hoyoverse.com/content-v2/hk4e/155721/6afd763b38f1255d26e3aaf8336bfa63_8683997898591472370.jpg",
            "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5e5896a5-4a79-496a-bea4-81f26cfa2650/dg68yoy-f436e5aa-1b8c-45a7-b35f-99cd7c0d0af4.png",
            "https://fastcdn.hoyoverse.com/content-v2/hk4e/155721/6afd763b38f1255d26e3aaf8336bfa63_8683997898591472370.jpg"
          ]}
        />
      </div>

      <div className="shoppage-divider" />
      <div className="shoppage-content-container">
        <div className="shoppage-content">
          <div className="shoppage-search-filter-wrapper">
            <div className="shoppage-search-bar">
              <button className="shoppage-search-button">
                <img src={searchIcon} alt="Search Icon" style={{ width: '16px', height: '16px', verticalAlign: 'middle', marginRight: '4px' }} /> Search
              </button>
              <input type="text" className="shoppage-search-input" />
            </div>

            <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <button className="shoppage-filter-button" onClick={() => setShowFilterMenu(!showFilterMenu)}>
                  <img src={filterIcon} alt="Filter Icon" style={{ width: '16px', height: '16px', verticalAlign: 'middle', marginRight: '4px' }} />
                  Filter by:{selectedFilter && (<p style={{ marginLeft: '4px', fontWeight: "500" }}>{selectedFilter}</p>)}
                </button>

                {showFilterMenu && (
                  <div className="dropdown-menu">
                    {filterOptions.map((option) => (
                      <div key={option} onClick={() => handleFilterSelect(option)}>{option}</div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <button className="shoppage-sort-button" onClick={() => setShowSortMenu(!showSortMenu)}>
                  <img src={sortIcon} alt="Sort Icon" style={{ width: '16px', height: '16px', verticalAlign: 'middle', marginRight: '4px' }} />
                  Sort by:{selectedSort && (<p style={{ marginLeft: '4px', fontWeight: "500" }}>{selectedSort}</p>)}
                </button>

                {showSortMenu && (
                  <div className="dropdown-menu">
                    {sortOptions.map((option) => (
                      <div key={option} onClick={() => handleSortSelect(option)}>{option}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="shoppage-tab-container">
            <div className="shoppage-tab-wrapper">
              <div className={`shoppage-tab ${selectedTab === 'Mystery Boxes' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTab('Mystery Boxes');
                  setExpandedCardIndex(null);
                }}>
                Mystery Boxes
              </div>
              <div className={`shoppage-tab ${selectedTab === 'Collection Store' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTab('Collection Store');
                  setExpandedCardIndex(null);
                }}>
                Collection Store
              </div>
            </div>
          </div>

          <div className="shoppage-card-container">
            <div className="shoppage-card-grid">
              {displayedItems.map((item, index) => {
                const isExpanded = expandedCardIndex === index;
                const type = selectedTab === 'Mystery Boxes' ? 'box' : 'product';
                return (
                  <div className={`shoppage-card-item ${isExpanded ? 'shoppage-card-item--expanded' : ''}`} key={index}>
                    {selectedTab === 'Mystery Boxes' && (
                      <div className="shoppage-card-background">
                        <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${item.urlImage}`} alt={`${item.name} background`} />
                      </div>
                    )}
                    <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${item.urlImage}`} alt={item.name} className="shoppage-card-image" />
                    <div className="shoppage-card-overlay" onClick={() => setExpandedCardIndex(isExpanded ? null : index)}>
                      <div className="shoppage-card-toggle">
                        <img src={vectorIcon} style={{ width: '16px', height: '16px' }} />
                      </div>
                      {isExpanded && (
                        <>
                          <div className="shoppage-card-title">
                            {selectedTab === 'Mystery Boxes' ? item.mysteryBoxName : item.name}
                          </div>
                          <div className="shoppage-card-price">
                            {((selectedTab === 'Mystery Boxes' ? item.mysteryBoxPrice : item.price) / 1000).toFixed(3)} VND
                          </div>
                          <div className="shoppage-card-actions">
                            <button
                              className="shoppage-view-button"
                              onClick={() => {
                                if (selectedTab === 'Mystery Boxes') {
                                  navigate(`/boxdetailpage/${item.id}`);
                                } else {
                                  navigate(`/productdetailpage/${item.id}`);
                                }
                              }}
                            >
                              <span className="shoppage-view-button-text">View Detail</span>
                            </button>

                            <button
                              className="shoppage-cart-button"
                              onClick={() => handleAddToCart(item, type)}
                            >
                              <img src={CartIcon} alt="Cart Icon" style={{ width: '16px', height: '16px', verticalAlign: 'middle', marginRight: '4px' }} />
                              Cart
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="shoppage-loadmore-button">Load more</button>
          </div>
        </div>
      </div>
    </div>
  );
}
