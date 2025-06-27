import React, { useEffect, useState } from 'react';
import './BoxList.css';
import { useNavigate } from 'react-router-dom';
import { getAllMysteryBoxes } from '../../../services/api.mysterybox';
import DetailArrow from '../../../assets/Icon_line/Chevron_Up.svg';
import AddToCart from '../../../assets/Icon_fill/Bag_fill.svg';
import { addToCart } from '../../../services/api.cart';
import { useDispatch } from 'react-redux'; // <-- Import useDispatch
import { addItemToCart } from '../../../redux/features/cartSlice'; // <-- Import addItemToCart

const PAGE_SIZE = 8;

export default function BoxList({ searchText, selectedSort, ascending, priceRange }) {
    const [boxes, setBoxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCardIndex, setExpandedCardIndex] = useState(null);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const navigate = useNavigate();
    const dispatch = useDispatch(); // <-- Add dispatch

    useEffect(() => {
        const fetchBoxes = async () => {
            try {
                const result = await getAllMysteryBoxes();
                if (result && result.status) {
                    setBoxes(result.data);
                    setError(null);
                } else {
                    setBoxes([]);
                    setError('Failed to load mystery boxes.');
                }
            } catch {
                setBoxes([]);
                setError('Failed to load mystery boxes.');
            }
            setLoading(false);
        };

        fetchBoxes();
    }, []);

    
    useEffect(() => {
        setVisibleCount(PAGE_SIZE); // Reset back to first page
    }, [searchText, priceRange, selectedSort, ascending]);


    // Show loading skeleton while fetching data
    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 p-4">
                {[...Array(PAGE_SIZE)].map((_, index) => (
                    <div key={index} className="flex justify-center w-full flex-col gap-4">
                        <div className="skeleton h-42 w-full bg-slate-300"></div>
                        <div className="skeleton h-4 w-28 bg-slate-300"></div>
                        <div className="skeleton h-4 w-full bg-slate-300"></div>
                        <div className="skeleton h-4 w-full bg-slate-300"></div>
                    </div>
                ))}
            </div>
        );
    }

    // Check for error after loading
    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    // Filter boxes based on search text, price range
    const filteredBoxes = boxes.filter(box =>
        box.mysteryBoxName?.toLowerCase().includes(searchText.toLowerCase()) &&
        (priceRange >= 500 || box.mysteryBoxPrice / 1000 <= priceRange)
    );

    // Sort filteredBoxes based on selectedSort and ascending
    const sortedBoxes = [...filteredBoxes].sort((a, b) => {
        let valA, valB;

        switch (selectedSort) {
            case 'Price':
                valA = a.mysteryBoxPrice;
                valB = b.mysteryBoxPrice;
                break;
            case 'Name':
                valA = a.mysteryBoxName.toLowerCase();
                valB = b.mysteryBoxName.toLowerCase();
                break;
            case 'Release date':
            default:
                // Use a fallback value of 0 for undefined releaseDate
                valA = new Date(a.createdAt || 0);
                valB = new Date(b.createdAt || 0);
                break;
        }

        if (valA < valB) return ascending ? -1 : 1;
        if (valA > valB) return ascending ? 1 : -1;
        return 0;
    });

    // Limit the number of visible boxes
    const visibleBoxes = sortedBoxes.slice(0, visibleCount);
    const isEnd = visibleCount >= filteredBoxes.length || visibleCount >= 16;
    // If no data fetched, show a message
    const noDataFetched = boxes.length === 0;
    const noSearchResults = boxes.length > 0 && filteredBoxes.length === 0;


    // Add to cart handler
    const handleAddToCart = async (boxId) => {
        try {
            await addToCart({ mangaBoxId: boxId });
            // Find the box info for Redux
            const box = boxes.find(b => b.id === boxId);
            if (box) {
                dispatch(addItemToCart({
                    id: box.id,
                    type: 'mangaBox',
                    name: box.mysteryBoxName,
                    price: box.mysteryBoxPrice,
                    image: box.urlImage,
                    quantity: 1
                }));
            }
            alert('✅ Added to cart!');
        } catch (error) {
            alert('❌ Failed to add to cart.');
            console.error(error);
        }
    };

    return (
        <div className="boxList-card-list-container">
            <div className="boxList-card-grid">
                {visibleBoxes.map((item, index) => {
                    const isExpanded = expandedCardIndex === index;
                    const truncate = (str, n) => (str.length > n ? str.slice(0, n - 1) + '…' : str);

                    return (
                        <div
                            className={`boxList-card-item ${isExpanded ? 'boxList-card-item--expanded' : ''}`}
                            key={index}
                            onMouseEnter={() => setExpandedCardIndex(index)}
                            onMouseLeave={() => setExpandedCardIndex(null)}
                        >
                            <div className="boxList-card-background">
                                <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${item.urlImage}`} alt={`${item.name} background`} />
                            </div>
                            <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${item.urlImage}`} alt={item.mysteryBoxName} className="boxList-card-image" />
                            <div
                                className={`boxList-card-overlay ${isExpanded ? 'boxList-card-overlay--expanded' : ''}`}
                                onClick={() => setExpandedCardIndex(isExpanded ? null : index)}
                                style={{
                                    transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
                                    maxHeight: isExpanded ? '300px' : '60px',
                                    opacity: isExpanded ? 1 : 0.85,
                                    overflow: 'hidden',
                                }}
                            >
                                <div className="boxList-card-toggle">
                                    <img src={DetailArrow} style={{ width: '16px', height: '16px', transition: 'transform 0.3s' }} className={isExpanded ? 'rotate-180' : ''} />
                                </div>
                                <div
                                    className="boxList-card-slide-content"
                                    style={{
                                        transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
                                        transform: isExpanded ? 'translateY(0)' : 'translateY(30px)',
                                        opacity: isExpanded ? 1 : 0,
                                        pointerEvents: isExpanded ? 'auto' : 'none',
                                    }}
                                >
                                    {isExpanded && (
                                        <>
                                            <div className="boxList-card-title oxanium-bold">
                                                {truncate(item.mysteryBoxName, 30)}
                                            </div>
                                            <div className="boxList-card-price oxanium-bold">{(item.mysteryBoxPrice / 1000).toFixed(3)} VND</div>
                                            <div className="boxList-card-actions">
                                                <button
                                                    className="boxList-view-button"
                                                    onClick={() => navigate(`/boxdetailpage/${item.id}`)}
                                                >
                                                    <span className="boxList-view-button-text oleo-script-bold">View Detail</span>
                                                </button>
                                                <button
                                                    className="boxList-cart-button oleo-script-bold"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCart(item.id);
                                                    }}
                                                >
                                                    <img src={AddToCart} alt="Cart Icon" className='boxList-cart-icon' />
                                                    Cart
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {noDataFetched && (
                <div className="text-center text-gray-400 mt-6">No boxes to display yet.</div>
            )}

            {noSearchResults && (
                <div className="text-center text-gray-400 mt-6">No boxes found for your search.</div>
            )}

            {isEnd ? (
                <div className="boxList-end-content oxanium-semibold divider divider-warning">
                    End of content
                </div>
            ) : (
                <button
                    className="boxList-loadmore-button oxanium-semibold"
                    onClick={() => setVisibleCount(count => Math.min(count + PAGE_SIZE, 16, boxes.length))}
                >
                    Load more
                </button>
            )}
        </div>
    );
}
