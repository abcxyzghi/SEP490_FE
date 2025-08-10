import React, { useEffect, useState } from "react";
import { getAllCollection, createCollection } from '../../../services/api.collection';
import { toast } from "react-toastify";
 import './ModCollection.css';

 export default function ModCollection() {
  const [collections, setCollections] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newTopic, setNewTopic] = useState("");

  // Fetch collections
  useEffect(() => {
    const fetchData = async () => {
      const response = await getAllCollection();
      if (response?.status) {
        setCollections(response.data);
      }
    };
    fetchData();
  }, []);

  // Handle create new collection
  const handleCreate = async () => {
    console.log("Creating collection with topic:", newTopic);
    if (!newTopic.trim()) {
      toast.error("Collection topic is required");
      return;
    }

    const response = await createCollection({newTopic});
    if (response) {
      toast.success("Collection created!");
      setCollections((prev) => [...prev, response]);
      setNewTopic("");
      setShowPopup(false);
    }
  };

  return (
    <div className="mod-collection-container">
      <div className="mod-collection-header">
        <h1>Collections</h1>
        <button className="create-button" onClick={() => setShowPopup(true)}>
          + New Collection
        </button>
      </div>

      <div className="collection-grid">
        {collections.map((collection) => (
          <div className="collection-card" key={collection.id}>
            <h2>{collection.topic}</h2>
            <p>ID: {collection.id}</p>
            <p className={`badge ${collection.isSystem ? "system" : "user"}`}>
              {collection.isSystem ? "System" : "User"}
            </p>
          </div>
        ))}
      </div>

      {showPopup && (
        <div className="popup-overlay">
            <div className="popup">
            <h2>Create New Collection</h2>
            <input
                type="text"
                placeholder="Collection Name"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
            />
            <div className="popup-actions">
                <button className="cancel-button" onClick={() => setShowPopup(false)}>Cancel</button>
                <button className="create-button popup-create" onClick={handleCreate}>Create</button>
            </div>
            </div>
        </div>
        )}
    </div>
  );
};
 