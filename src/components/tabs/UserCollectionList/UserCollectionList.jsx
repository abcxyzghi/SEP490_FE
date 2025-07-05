import React, { useEffect, useState } from 'react';
import { getAllCollectionOfProfile } from '../../../services/api.user';

export default function UserCollectionList() {
  const [collections, setCollections] = useState([]);

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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
