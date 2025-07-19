import React, { useEffect, useState } from 'react';
import './Notificationpage.css';
import SearchBar from '../../libs/SearchFilterSort/SearchBar';
import SwitchTabs from '../../libs/SwitchTabs/SwitchTabs';
import TransactionHistory from '../../tabs/TransactionHistory/TransactionHistory';
import ExchangeHistory from '../../tabs/ExchangeHistory/ExchangeHistory';
import OrderHistory from '../../tabs/OrderHistory/OrderHistory';
import AuctionHistoryList from '../../tabs/AuctionHistoryList/AuctionHistoryList';
import ReportHistory from '../../tabs/ReportHistory/ReportHistory';

export default function Notificationpage() {
    const [activeTab, setActiveTab] = useState('Auction Rooms');
    const [searchText, setSearchText] = useState('');
    const [priceRange, setPriceRange] = useState(500);
    const [selectedRarities, setSelectedRarities] = useState([]); // This need clearer tab or selected section
    const [selectedSort, setSelectedSort] = useState('Date');
    const [ascending, setAscending] = useState(true);

    return (
        <div className="notificationPage-container">
            <div className="notificationPage-searchFilterSort-wrapper">
                {/* Search bar */}
                <SearchBar value={searchText} onChange={setSearchText} />
            </div>

            {/* Tabs switcher */}
            <div className='tabs-switcher-section'>
                <SwitchTabs
                    tabs={[
                        {
                            label: 'Transaction',
                            content:
                                <TransactionHistory />
                        },
                        {
                            label: 'Exchange',
                            content:
                                <ExchangeHistory />
                        },
                        {
                            label: 'Order',
                            content:
                                <OrderHistory />
                        },
                        {
                            label: 'Auction',
                            content:
                                <AuctionHistoryList />
                        },
                        {
                            label: 'Report',
                            content:
                                <ReportHistory />
                        },
                    ]}
                    activeTab={activeTab}
                    onTabChange={(label) => setActiveTab(label)}
                />
            </div>
        </div>
    )
}
