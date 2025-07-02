import React from 'react'

export default function BoxInformation({ mysteryBoxDetail }) {
  if (!mysteryBoxDetail) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h2>Description:</h2><p>{mysteryBoxDetail.mysteryBoxDescription}</p>
      <h3>Collection Topic:</h3><p>{mysteryBoxDetail.collectionTopic}</p>
    </div>
  )
}
