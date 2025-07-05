import React from 'react';
import "./BoxInformation.css";

export default function BoxInformation({ mysteryBoxDetail }) {
  if (!mysteryBoxDetail) {
    return <div>Loading...</div>;
  }
  return (
    <div className='boxInfotab-container'>
      <div className='boxInfotab-topic-container'>
        <h3 className='boxInfotab-topic oxanium-semibold'>Collection Topic:</h3>
        <p className='boxInfotab-topic-content oxanium-regular'>
          {mysteryBoxDetail.collectionTopic || "N/A"}
        </p>
      </div>

      <div className='mb-6'>
        <h2 className='boxInfotab-description oxanium-bold'>Description:</h2>
        <p className='boxInfotab-description-content oxanium-regular'>
          {mysteryBoxDetail.mysteryBoxDescription || "No description available."}
        </p>
      </div>
    </div>
  )
}
