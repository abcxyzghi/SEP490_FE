import React, { useEffect, useState, useRef } from 'react';
import "./BoxDetailpage.css";
import { useParams } from 'react-router-dom'
import { getMysteryBoxDetail } from '../../../services/api.mysterybox'
import BoxInformation from '../../tabs/BoxInformation/BoxInformation'
import BoxRatelity from '../../tabs/BoxRatelity/BoxRatelity'
import SwitchTabs from '../../libs/SwitchTabs/SwitchTabs';
import Rating from '@mui/material/Rating';
//import icons
import AddQuantity from "../../../assets/Icon_line/add-01.svg";
import ReduceQuantity from "../../../assets/Icon_line/remove-01.svg";


export default function BoxDetailpage() {
  const { id } = useParams();
  const [box, setBox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Information');
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Fetch box details
  const fetchDetail = async () => {
    const result = await getMysteryBoxDetail(id);
    if (result && result.status) {
      setBox(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (loading) {
  return (
    <div className="boxdetailP-container mx-auto my-21 px-4 sm:px-8 md:px-12 lg:px-16">
      <div className="flex w-full flex-col lg:flex-row pb-8">
        {/* Image skeleton */}
        <div className="boxdetailP-image-wrapper">
          <div className="skeleton w-full h-90 rounded-lg bg-slate-300" />
        </div>
        <div className="boxdetailP-divider"></div>
        <div className="boxdetailP-info-content">
          {/* Review bar skeleton */}
          <div className="boxdetailP-boxReview-container oxanium-light">
            <div className="skeleton h-5 w-full rounded bg-slate-300" />
          </div>
          {/* Title and price skeleton */}
          <div className="boxdetailP-info-wrapper mt-5 mb-10">
            <div className="skeleton h-10 w-2/3 mb-4 rounded bg-slate-300" />
            <div className="skeleton h-7 w-1/3 rounded bg-slate-300" />
          </div>
          {/* Quantity and buy button skeleton */}
          <div className="boxdetailP-quantyNbuy-container">
            <div className="boxdetailP-quantity-measure">
              <div className="skeleton h-10 w-10 rounded-r bg-slate-300" />
              <div className="skeleton h-10 w-30 bg-slate-300" />
              <div className="skeleton h-10 w-10 rounded-l bg-slate-300" />
            </div>
            <div className="boxdetailP-buyDropdown-container">
              <div className="skeleton h-10 w-50 ml-6 rounded bg-slate-300" />
            </div>
          </div>
        </div>
      </div>
      {/* Tabs skeleton */}
      <div className="tabs-switcher-section flex flex-col mt-8">
        <div className="flex gap-4 justify-center items-center mb-4 ">
          <div className="skeleton h-10 w-32 rounded bg-slate-300" />
          <div className="skeleton h-10 w-32 rounded bg-slate-300" />
        </div>
        <div className="skeleton h-40 w-full rounded bg-slate-300" />
      </div>
    </div>
  );
}

  if (!box) {
    return <div className="text-center mt-10 text-red-500">Box not found or error loading data.</div>;
  }

  return (
    <div className="boxdetailP-container mx-auto my-21 px-4 sm:px-8 md:px-12 lg:px-16">
      <div className="flex w-full flex-col lg:flex-row pb-8">
        <div className="boxdetailP-image-wrapper">
          <div className="boxdetailP-box-imgBG">
            <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${box.urlImage}`} alt={`${box.mysteryBoxName} background`} />
          </div>

          <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${box.urlImage}`} alt={box.mysteryBoxName}
            className="boxdetailP-box-img" />
        </div>

        <div className="boxdetailP-divider"></div>

        <div className="boxdetailP-info-content">
          {/* REplace with actual api figure */}
          <div className="boxdetailP-boxReview-container oxanium-light">
            <span className='oxanium-semibold'>146</span> Reviews:
            <span className="boxdetailP-rating-responsive">
              <Rating
                name="read-only"
                value={3.2}
                precision={0.1}
                readOnly
                size="small"
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1rem', lg: '1rem' },
                  '& .MuiRating-iconFilled': {
                    color: '#FFD700',
                  },
                  '& .MuiRating-iconEmpty': {
                    color: '#666666',
                  },
                }}
              />
            </span>
          </div>

          <div className="boxdetailP-info-wrapper mb-10">
            <h1 className="boxdetailP-box-title oleo-script-bold">{box.mysteryBoxName}</h1>
            <p className="boxdetailP-box-prize oxanium-bold">{(box.mysteryBoxPrice / 1000).toFixed(3)} VND</p>

            {/* Add calculated prize when qunatity goes up */}

          </div>

          <div className="boxdetailP-quantyNbuy-container">
            <div className="boxdetailP-quantity-measure">
              <div className="boxdetailP-quantity-iconWrapper-left">
                <img src={ReduceQuantity} alt="-" className="boxdetailP-quantity-icon" />
              </div>
              <div className="boxdetailP-quantity-text oxanium-regular">
                {/* Replace with dynamic api number (default = 1) */}
                1
              </div>
              <div className="boxdetailP-quantity-iconWrapper-right">
                <img src={AddQuantity} alt="+" className="boxdetailP-quantity-icon" />
              </div>
            </div>

            <div className="boxdetailP-buyDropdown-container" ref={menuRef}>
              <button className="boxdetailP-buyNow-button oxanium-bold"
                onClick={() => setIsOpen((prev) => !prev)}>
                Buy now
              </button>

              {isOpen && (
                <ul className="boxdetailP-dropdown-menu">
                  <li
                    className="boxdetailP-dropdown-item oxanium-regular"
                    onClick={() => {
                      setIsOpen(false);
                      // Replace actual api handling
                    }}
                  >
                    Pay instant
                  </li>
                  <li
                    className="boxdetailP-dropdown-item oxanium-regular"
                    onClick={() => {
                      setIsOpen(false);
                      // Replace actual api handling
                    }}
                  >
                    Add to cart
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="tabs-switcher-section">
        <SwitchTabs
          tabs={[
            {
              label: 'Information',
              content: <BoxInformation mysteryBoxDetail={box} />
            },
            {
              label: 'Ratelity',
              content: <BoxRatelity mysteryBoxDetail={box} />
            },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
      
      {/* Comment Section */}

    </div>
  )
}
