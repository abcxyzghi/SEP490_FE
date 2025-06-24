/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import ImageCarousel from '../../libs/Carousel/Carousel';
import './Shoppage.css';
import SearchBar from '../../libs/SearchFilterSort/SearchBar';
import FilterPanel from '../../libs/SearchFilterSort/FilterPanel';
import SortDropdown from '../../libs/SearchFilterSort/SortDropdown';
import SwitchTabs from '../../libs/SwitchTabs/SwitchTabs';
import BoxList from '../../tabs/BoxList/BoxList';
import ProductList from '../../tabs/ProductList/ProductList';


export default function Shoppage() {
  const [activeTab, setActiveTab] = useState('Mystery Boxes');
  const [searchText, setSearchText] = useState('');
  const [priceRange, setPriceRange] = useState(500);
  const [selectedRarities, setSelectedRarities] = useState([]);
  const [selectedSort, setSelectedSort] = useState('Release date');
  const [ascending, setAscending] = useState(true);

  useEffect(() => {
    if (activeTab !== 'Collection Store') {
      setSelectedRarities([]); // Clear when switching tab
    }
  }, [activeTab]);

  // if (loading || loadingProducts) {
  //   return (
  //     <div className="flex justify-center items-center min-h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="shoppage-container">
      <ImageCarousel />

      <div className="shoppage-divider" />

      <div className="shoppage-content-container">
        <div className="shoppage-search-filter-wrapper">
          {/* Search bar */}
          <SearchBar value={searchText} onChange={setSearchText} />

          <div className='flex items-center gap-1.5 max-[480px]:flex-col'>
            {/* Filter button */}
            <FilterPanel
              showRarity={activeTab === 'Collection Store'}
              onPriceChange={(val) => setPriceRange(val)}
              onRaritySelect={(rarities) => setSelectedRarities(rarities)}
            />

            {/* Sort button */}
            <SortDropdown
              selectedSort={selectedSort}
              ascending={ascending}
              onSortSelect={(option) => setSelectedSort(option)}
              toggleOrder={() => setAscending(!ascending)}
            />
          </div>
        </div>

        {/* Tabs switcher */}
        <div className='tabs-switcher-section'>
          <SwitchTabs
            tabs={[
              {
                label: 'Mystery Boxes',
                content:
                  <BoxList
                    searchText={searchText}
                    selectedSort={selectedSort}
                    ascending={ascending}
                    priceRange={priceRange}
                  />
              },
              {
                label: 'Collection Store',
                content:
                  <ProductList
                    activeTab={activeTab}
                    searchText={searchText}
                    selectedSort={selectedSort}
                    ascending={ascending}
                    priceRange={priceRange}
                    selectedRarities={selectedRarities}
                  />
              },
            ]}
            // A way to track active tab label and call setActiveTab.
            onTabChange={(label) => setActiveTab(label)}
          />
        </div>
      </div>
    </div>
  )
}
