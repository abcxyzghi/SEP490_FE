import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import './Auctionpage.css';
import SearchBar from '../../libs/SearchFilterSort/SearchBar';
import SwitchTabs from '../../libs/SwitchTabs/SwitchTabs';
import AuctionRoomList from '../../tabs/AuctionRoomList/AuctionRoomList';
import MyAuction from '../../tabs/MyAuction/MyAuction';

export default function Auctionpage() {
  const [activeTab, setActiveTab] = useState('Auction Rooms');
  const [searchText, setSearchText] = useState('');
  const user = useSelector((state) => state.auth.user);

  // Header + Subheader mapping
  const headers = {
    'Auction Rooms': {
      header: "Auction Rooms",
      subHeader: "Join and bid in ongoing auction rooms in real-time"
    },
    'My Auction': {
      header: "My Auction",
      subHeader: "Check your up-coming or ready to host auctions"
    }
  };

  // Tabs logic: show both tabs if logged in, else only Auction Rooms
  const tabs = user
    ? [
      {
        label: 'Auction Rooms',
        content: <AuctionRoomList searchText={searchText} />
      },
      {
        label: 'My Auction',
        content: <MyAuction searchText={searchText} />
      }
    ]
    : [
      {
        label: 'Auction Rooms',
        content: <AuctionRoomList searchText={searchText} />
      }
    ];

  return (
    <div className="auctionpage-container">
      {/* Dynamic Header Section */}
      <div className="auctionpage-header">
        <h1 className="auctionpage-title oleo-script-bold">
          {headers[activeTab]?.header}
        </h1>
        <p className="auctionpage-subtitle oxanium-regular">
          {headers[activeTab]?.subHeader}
        </p>
      </div>

      {/* Search bar */}
      <div className="auctionpage-search-wrapper">
        <SearchBar value={searchText} onChange={setSearchText} />
      </div>

      {/* Tabs switcher */}
      <div className='tabs-switcher-section'>
        <SwitchTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(label) => setActiveTab(label)}
        />
      </div>

    </div>
  )
}
