import React, { useEffect, useState } from 'react';
import './Activitypage.css';
import SearchBar from '../../libs/SearchFilterSort/SearchBar';
import SwitchTabs from '../../libs/SwitchTabs/SwitchTabs';
import TransactionHistory from '../../tabs/TransactionHistory/TransactionHistory';
import ExchangeHistory from '../../tabs/ExchangeHistory/ExchangeHistory';
import OrderHistory from '../../tabs/OrderHistory/OrderHistory';
import AuctionHistoryList from '../../tabs/AuctionHistoryList/AuctionHistoryList';
import ReportHistory from '../../tabs/ReportHistory/ReportHistory';

export default function Activitypage() {
    const [activeTab, setActiveTab] = useState('Transaction');
    const [searchText, setSearchText] = useState('');
    const [priceRange, setPriceRange] = useState(500);
    const [selectedRarities, setSelectedRarities] = useState([]); // This need clearer tab or selected section
    const [selectedSort, setSelectedSort] = useState('Date');
    const [ascending, setAscending] = useState(true);

    // Header + Subheader mapping
    const headers = {
        Transaction: {
            header: "Transaction History",
            subHeader: "Track all your top-up and withdraw records in detail"
        },
        Exchange: {
            header: "Exchange History",
            subHeader: "View your completed and pending exchanges"
        },
        Order: {
            header: "Order History",
            subHeader: "Review your product and box order history"
        },
        Auction: {
            header: "Auction Rooms",
            subHeader: "See past auctions you joined or hosted"
        },
        Report: {
            header: "Report History",
            subHeader: "Check all reports you recieved"
        }
    };

    return (
        <div className="activitypage-container">
            {/* Search bar */}
            {/* <div className="activitypage-searchFilterSort-wrapper">
                  <SearchBar value={searchText} onChange={setSearchText} />
              </div> */}

            {/* Dynamic Header Section */}
            <div className="activitypage-header">
                <h1 className="activitypage-title oleo-script-bold">
                    {headers[activeTab]?.header}
                </h1>
                <p className="activitypage-subtitle oxanium-regular">
                    {headers[activeTab]?.subHeader}
                </p>
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
