import React, { useState, useEffect } from 'react';
import './Cartpage.css';
import SearchBar from '../../libs/SearchFilterSort/SearchBar';
import FilterPanel from '../../libs/SearchFilterSort/FilterPanel';
import SwitchTabs from '../../libs/SwitchTabs/SwitchTabs';
import CartBoxList from '../../tabs/CartBoxList/CartBoxList';
import CartProductList from '../../tabs/CartProductList/CartProductList';

export default function Cartpage() {
  const [searchText, setSearchText] = useState('');
  const [priceRange, setPriceRange] = useState(500);
  const [selectedRarities, setSelectedRarities] = useState([]);
  const [activeTab, setActiveTab] = useState('Mystery Boxes');
  const [selectedItemsData, setSelectedItemsData] = useState([]);

  useEffect(() => {
    if (activeTab !== 'Collection Store') {
      setSelectedRarities([]);
    }
  }, [activeTab]);

  const totalSelectedPrice = selectedItemsData.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

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
          <button className="cartpage-buy-button oxanium-bold">Buy</button>
        </div>
      </div>
    </>
  );
}