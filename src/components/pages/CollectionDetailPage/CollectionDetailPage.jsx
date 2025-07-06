import React, { useEffect, useState } from 'react';
import "./CollectionDetailPage.css";
import { useParams } from 'react-router-dom';
import { getCollectionDetail } from '../../../services/api.product';

export default function CollectionDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await getCollectionDetail(id);
                setData(res.data);
            } catch (err) {
                setData({ error: 'Failed to load detail' });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (data?.error) return <div>{data.error}</div>;

    const normalizeRarity = (rarity) =>
        rarity ? rarity.trim().toLowerCase().replace(/^\w/, c => c.toUpperCase()) : '';

    return (
        <div>
            <h1>{data.name}</h1>
            <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${data.urlImage}`} alt={data.name} />
            <p>{data.description}</p>
            <p>Rarity: {data.rarityName}</p>
        </div>
    );
}
