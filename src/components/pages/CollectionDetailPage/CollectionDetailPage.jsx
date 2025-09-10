import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCollectionDetail } from '../../../services/api.product';
import { buildImageUrl } from '../../../services/api.imageproxy';
import Tilt from 'react-parallax-tilt';
import './CollectionDetailPage.css';
import LeftArrow from '../../../assets/Icon_line/Arrow_Left_LG.svg'

const rarityColors = {
    Legendary: '#FFD700',
    Epic: '#c318e6ff',
    Rare: '#4a75f5ff',
    Uncommon: '#32CD32',
    Common: '#A9A9A9',
};

const normalizeRarity = (rarity) =>
    rarity ? rarity.trim().toLowerCase().replace(/^\w/, c => c.toUpperCase()) : '';

export default function CollectionDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [useBackupImg, setUseBackupImg] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleBackout = () => {
        navigate(-1); // Go back one step in history
    };

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
        <>
            {/* Go back button */}
            <div className='collection-detail-header-btn oxanium-semibold backdrop-blur-lg border border-white/10 bg-gradient-to-tr from-black/60 to-black/40 shadow-lg hover:shadow-2xl hover:shadow-white/20 hover:scale-100  active:scale-95 active:rotate-0 transition-all duration-300 ease-out cursor-pointer hover:border-white/30 hover:bg-gradient-to-tr hover:from-white/10 hover:to-black/40 group relative overflow-hidden'
                onClick={handleBackout}>
                <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                ></div>
                <img
                    src={LeftArrow}
                    alt="LeftArrow icon"
                    className='collection-detail-header-icon'
                />
                Back
            </div>

            {/* Main content */}
            <div className="collection-detail-container">
                {loading ? (
                    <div className="collection-detail-card flex flex-col md:flex-row gap-8 w-full max-w-5xl p-8 rounded-xl shadow-lg">
                        <div className="skeleton w-64 h-80 rounded-xl bg-gray-700/40" />
                        <div className="flex flex-col flex-1 gap-4">
                            <div className="skeleton h-8 w-2/3 rounded bg-gray-700/40" />
                            <div className="skeleton h-6 w-1/2 rounded bg-gray-700/40" />
                            <div className="skeleton h-20 w-full rounded bg-gray-700/40" />
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-error text-lg oxanium-semibold">{error}</div>
                ) : (
                    <div className="collection-detail-card flex flex-col md:flex-row ">
                        {/* Image section on the left */}
                        <div className="collection-detail-image-wrapper" style={{ filter: glow }}>
                            <div className="collection-detail-image-bg">
                                <img src={buildImageUrl(data.urlImage, useBackupImg)} onError={() => setUseBackupImg(true)} alt={data.name} />
                            </div>
                            <Tilt
                                glareEnable={true}
                                glareMaxOpacity={0.45}
                                glareColor="#ffffff"
                                glareBorderRadius="20px"
                                glarePosition="all"
                                tiltMaxAngleX={10}
                                tiltMaxAngleY={10}
                                scale={1.1}
                                perspective={600}
                                gyroscope={true}
                            >
                                <img
                                    className="collection-detail-main-image"
                                    src={buildImageUrl(data.urlImage, useBackupImg)} 
                                    onError={() => setUseBackupImg(true)}
                                    alt={data.name}
                                />
                            </Tilt>
                        </div>

                        {/* <div className="divider divider-horizontal"></div> */}

                        {/* Information on the right side */}
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
        </>
    );
}
