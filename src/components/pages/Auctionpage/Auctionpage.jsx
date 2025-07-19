import React, { useEffect, useState } from 'react';
import './Auctionpage.css';
import SearchBar from '../../libs/SearchFilterSort/SearchBar';
import SwitchTabs from '../../libs/SwitchTabs/SwitchTabs';
import AuctionRoomList from '../../tabs/AuctionRoomList/AuctionRoomList';
import MyAuction from '../../tabs/MyAuction/MyAuction';

export default function Auctionpage() {
  const [activeTab, setActiveTab] = useState('Auction Rooms');
  const [searchText, setSearchText] = useState('');


  return (
    <div className="auctionpage-container">
      <div className="auctionpage-search-wrapper">
        {/* Search bar */}
        <SearchBar value={searchText} onChange={setSearchText} />
      </div>

      {/* Tabs switcher */}
      <div className='tabs-switcher-section'>
        <SwitchTabs
          tabs={[
            {
              label: 'Auction Rooms',
              content:
                <AuctionRoomList />
            },
            {
              label: 'My Auction',
              content:
                <MyAuction />
            },
          ]}
          activeTab={activeTab}
          onTabChange={(label) => setActiveTab(label)}
        />

      </div>
    </div>
  )
}
