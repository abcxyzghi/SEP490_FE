import React, { useEffect, useState } from 'react';
import { getAllCollectionOfProfile } from '../../../services/api.user';
import CollectionDetail from '../../pages/CollectionDetail/CollectionDetail';

export default function UserCollectionList() {
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      const res = await getAllCollectionOfProfile();
      if (res.status && Array.isArray(res.data)) {
        setCollections(res.data);
      } else {
        setCollections([]);
      }
    };
    fetchCollections();
  }, []);

  return (
    <div>
      <h3>User Collections</h3>
      {collections.length === 0 ? (
        <div>No collections found.</div>
      ) : (
        <ul>
          {collections.map(col => (
            <li key={col.id}>
              <strong>{col.collectionTopic}</strong> (Count: {col.count})
              <button style={{ marginLeft: 8 }} onClick={() => setSelectedCollectionId(col.id)}>
                View Detail
              </button>
            </li>
          ))}
        </ul>
      )}
      {selectedCollectionId && (
        <div style={{ marginTop: 16 }}>
          <CollectionDetail collectionId={selectedCollectionId} />
          <button style={{ marginTop: 8 }} onClick={() => setSelectedCollectionId(null)}>
            Close Detail
          </button>
        </div>
      )}
    </div>
  );
}
