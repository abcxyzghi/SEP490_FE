import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCollectionDetail } from '../../../services/api.product';
import Tilt from 'react-parallax-tilt';
import './CollectionDetailPage.css';

const rarityColors = {
    Legendary: '#FFD700',
    Epic: '#A915C6',
    Rare: '#4169E1',
    Uncommon: '#32CD32',
    Common: '#A9A9A9',
};

const normalizeRarity = (rarity) =>
    rarity ? rarity.trim().toLowerCase().replace(/^\w/, c => c.toUpperCase()) : '';

export default function CollectionDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await getCollectionDetail(id);
                if (res?.status) {
                    setData(res.data);
                } else {
                    setError(res?.error || 'Failed to fetch detail.');
                }
            } catch {
                setError('Something went wrong.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const rarity = normalizeRarity(data?.rarityName);
    const glow = `drop-shadow(0 0 16px ${rarityColors[rarity] || '#fff'})`;

    return (
        <div className="collection-detail-container">
            {loading ? (
                <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl p-8 rounded-xl shadow-lg">
                    <div className="skeleton w-64 h-80 rounded-xl" />
                    <div className="flex flex-col flex-1 gap-4">
                        <div className="skeleton h-8 w-2/3 rounded" />
                        <div className="skeleton h-6 w-1/2 rounded" />
                        <div className="skeleton h-20 w-full rounded" />
                    </div>
                </div>
            ) : error ? (
                <div className="text-error text-lg font-semibold">{error}</div>
            ) : (
                <div className="collection-detail-card flex flex-col md:flex-row ">
                    <div className="collection-detail-image-wrapper" style={{filter: glow}}>
                        <div className="collection-detail-image-bg">
                            <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${data.urlImage}`} alt={data.name} />
                        </div>
                        <Tilt 
                        glareEnable={true} 
                        glareMaxOpacity={0.45} 
                        glareColor="#ffffff" 
                        glarePosition="all"
                        tiltMaxAngleX={10} 
                        tiltMaxAngleY={10}
                        glareBorderRadius="20px"
                        perspective={600}
                        gyroscope={true}
                        >
                            <img
                                className="collection-detail-main-image"
                                src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${data.urlImage}`}
                                alt={data.name}
                            />
                        </Tilt>
                    </div>

                    {/* <div className="divider divider-horizontal"></div> */}

                    <div className="collection-detail-info-wrapper">
                        <h2 className="collection-detail-info-title">{data.name}</h2>
                        <p className="collection-detail-info-rarity oxanium-semibold" style={{ color: rarityColors[rarity] }}>
                            Rarity: {rarity}
                        </p>
                        <p className="collection-detail-info-desc oxanium-regular">{data.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
