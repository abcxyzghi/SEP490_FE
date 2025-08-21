import React, { useEffect, useState } from 'react';
import './Auctionpage.css';
import SearchBar from '../../libs/SearchFilterSort/SearchBar';
import SwitchTabs from '../../libs/SwitchTabs/SwitchTabs';
import AuctionRoomList from '../../tabs/AuctionRoomList/AuctionRoomList';
import MyAuction from '../../tabs/MyAuction/MyAuction';

import ConfirmModal from '../../libs/ConfirmModal/ConfirmModal';
import Guidebook from '../../libs/Guidebook/Guidebook';
import { useNavigate } from "react-router-dom";
import ConfirmNavigateModal from '../../libs/ConfirmNavigateModal/ConfirmNavigateModal';

export default function Auctionpage() {
  const [activeTab, setActiveTab] = useState('Auction Rooms');
  const [searchText, setSearchText] = useState('');

  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, title: "", message: "", onConfirm: null });
  const navigate = useNavigate();

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleConfirm = () => {
    alert('Confirmed!');
    setModalOpen(false);
  };

  const handleNavConfirm = () => {
    setConfirmModal({
      open: true,
      title: "Exchange complete!",
      message: "Check out your new collection.",
      onConfirm: () => navigate(`/`),
      onCancel: () => setConfirmModal({ ...confirmModal, open: false }),
    });
  };

  const steps = [
    {
      step: 1,
      image: "https://ik.imagekit.io/vbvs3wes4/505765803_2159492884475338_5424204106079022562_n.jpg",
      description: "First, click on the button to start."
    },
    {
      step: 2,
      image: "https://ik.imagekit.io/vbvs3wes4/507316604_1250566799971890_5112051987196343130_n.jpg",
      description: "Next, fill in your details."
    },
    {
      step: 3,
      image: "https://ik.imagekit.io/vbvs3wes4/489867502_1903303543828754_4593810167683299426_n.jpg",
      description: "Finally, confirm and submit."
    }
  ];

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


      {/* Guidebook */}
      {/* <div className="p-10">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={() => setOpen(true)}
        >
          Open Guidebook
        </button>

        <Guidebook isOpen={open} onClose={() => setOpen(false)} steps={steps} />
      </div> */}

      {/* Confirm modal */}
      {/* <div style={{ padding: '2rem' }}>
        <button className="bg-green-600 text-white px-4 py-2 rounded-l" onClick={handleOpenModal}>
          Open Confirm Modal
        </button>

        <ConfirmModal
          open={modalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirm}
          title="Are you sure?"
          message="This action cannot be undone."
        />
      </div> */}

      {/* Nav Confirm modal */}
      {/* <div className="p-10">
        <button
          className="bg-orange-600 text-white px-4 py-2 rounded-lg"
          onClick={handleNavConfirm}
        >
          Open nav confirm
        </button>

        <ConfirmNavigateModal
          open={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel="Take me there"
          cancelLabel="Maybe later"
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
        />
      </div> */}
    </div>
  )
}
