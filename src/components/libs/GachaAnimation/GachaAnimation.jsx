import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { buildImageUrl } from '../../../services/api.imageproxy';
import './GachaAnimation.css';
import { motion, AnimatePresence } from 'framer-motion';
import MessageModal from '../../libs/MessageModal/MessageModal';

export default function GachaAnimation({ result, onViewDetail, onClose, onOpenMore, remainingQuantity, boxId, boxImageUrl }) {
    const [useBackupImg, setUseBackupImg] = useState(false);
    const [skipped, setSkipped] = useState(false);
    const [showCard, setShowCard] = useState(false);
    const [boxHasLanded, setBoxHasLanded] = useState(false);
    const [boxHasTorn, setBoxHasTorn] = useState(false);
    const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });

    const normalizeRarity = (rarity) =>
        rarity ? rarity.trim().toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : '';

    const getRateColorClass = (rarity) => {
        const normalized = normalizeRarity(rarity);
        return {
            Common: '#ede9e9',
            Uncommon: '#4ade80',
            Rare: '#60a5fa',
            Epic: '#c084fc',
            Legendary: '#facc15',
        }[normalized] || '#ffffff';
    };

    const rarityGlow = {
        common: '#ede9e9',
        uncommon: '#4ade80',
        rare: '#60a5fa',
        epic: '#c084fc',
        legendary: '#facc15',
    }[result.rarity] || '#ffffff';

    const showModal = (type, title, message) => {
        setModal({ open: true, type, title, message });
    };

    // Handle delayed tear and card show
    useEffect(() => {
        if (boxHasLanded) {
            const tearTimer = setTimeout(() => {
                setBoxHasTorn(true);
            }, 500); // tear after 0.5s

            const showCardTimer = setTimeout(() => {
                setShowCard(true);
            }, 1500); // show card after tear

            return () => {
                clearTimeout(tearTimer);
                clearTimeout(showCardTimer);
            };
        }
    }, [boxHasLanded, setShowCard]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!skipped) setShowCard(true);
        }, 4200); // full animation duration
        return () => clearTimeout(timeout);
    }, [skipped]);

    const handleSkip = () => {
        if (skipped) return; // prevent multiple skips
        setSkipped(true);
        setBoxHasLanded(true); // assume it already landed
        setBoxHasTorn(true);   // immediately tear it
        setShowCard(true);     // show the card
    };

    // Error Handling Before Animation
    if (!result) return null;

    useEffect(() => {
        if (result && result.error) {
            showModal('error', 'Error', result.error || 'An error occur while opening box');
        }
    }, [result]);

    if (result.error) {
        return createPortal(
            <>
                {/* Message Modal */}
                <MessageModal
                    open={modal.open}
                    onClose={() => setModal(prev => ({ ...prev, open: false }))}
                    type={modal.type}
                    title={modal.title}
                    message={modal.message}
                />
            </>,
            document.body
        );
    }

    if (!result.urlImage) return null;


    return createPortal(
        <div className={`gacha-overlay ${showCard ? 'overlay-pulse' : ''}`}
            style={{ '--rarity-glow': rarityGlow }}
            onClick={handleSkip}>
            <div className="gacha-background-blur" />

            {/* Box Animation */}
            {!showCard && (
                <AnimatePresence mode="wait">
                    {skipped ? (
                        // Render final torn box state immediately
                        <>
                            <motion.img
                                key="box-left-skipped"
                                src={buildImageUrl(boxImageUrl, useBackupImg)} 
                                onError={() => setUseBackupImg(true)}
                                alt="Box Left Skipped"
                                className="gacha-box-half gacha-box-left"
                                initial={{ opacity: 0, x: 0, rotate: 0 }}
                                animate={{ opacity: 1, x: -150, rotate: -30 }}
                                transition={{ duration: 0 }}
                            />
                            <motion.img
                                key="box-right-skipped"
                                src={buildImageUrl(boxImageUrl, useBackupImg)} 
                                onError={() => setUseBackupImg(true)}
                                alt="Box Right Skipped"
                                className="gacha-box-half gacha-box-right"
                                initial={{ opacity: 0, x: 0, rotate: 0 }}
                                animate={{ opacity: 1, x: 150, rotate: 30 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                            />
                        </>
                    ) : (
                        <>
                            {!boxHasLanded && (
                                <motion.img
                                    key="box-falling"
                                    src={buildImageUrl(boxImageUrl, useBackupImg)} 
                                    onError={() => setUseBackupImg(true)}
                                    alt="Box"
                                    className="gacha-box-image"
                                    initial={{ y: '-100vh', scale: 1 }}
                                    animate={{
                                        y: ['-100vh', 0, -20, 0],
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 1,
                                        ease: 'easeOut',
                                        times: [0, 0.7, 0.85, 1],
                                    }}
                                    onAnimationComplete={() => setBoxHasLanded(true)}
                                />
                            )}

                            {boxHasLanded && !boxHasTorn && (
                                <motion.img
                                    key="box-still"
                                    src={buildImageUrl(boxImageUrl, useBackupImg)} 
                                    onError={() => setUseBackupImg(true)}
                                    alt="Box Static"
                                    className="gacha-box-image"
                                    initial={{ scale: 1 }}
                                    animate={{ scale: [1, 1.3, 1, 1.5, 1.1, 1.6] }}
                                    transition={{ duration: 0.4 }}
                                />
                            )}

                            {boxHasTorn && (
                                <>
                                    <motion.img
                                        key="box-left"
                                        src={buildImageUrl(boxImageUrl, useBackupImg)} 
                                        onError={() => setUseBackupImg(true)}
                                        alt="Box Left"
                                        className="gacha-box-half gacha-box-left"
                                        initial={{ opacity: 0, x: 0, rotate: 0 }}
                                        animate={{ opacity: 1, x: -150, rotate: -30 }}
                                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                                    />
                                    <motion.img
                                        key="box-right"
                                        src={buildImageUrl(boxImageUrl, useBackupImg)} 
                                        onError={() => setUseBackupImg(true)}
                                        alt="Box Right"
                                        className="gacha-box-half gacha-box-right"
                                        initial={{ opacity: 0, x: 0, rotate: 0 }}
                                        animate={{ opacity: 1, x: 150, rotate: 30 }}
                                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                                    />
                                </>
                            )}
                        </>
                    )}
                </AnimatePresence>
            )}

            {/* Card Display Animation */}
            <AnimatePresence>
                {showCard && (
                    <motion.div
                        className="gacha-card-wrapper"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 1], opacity: 1 }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                    >
                        <div className={`gacha-card rarity-${result.rarity.toLowerCase()}`}
                        >
                            <img
                                src={buildImageUrl(result.urlImage, useBackupImg)} 
                                onError={() => setUseBackupImg(true)}
                                alt={result.productName}
                                className="gacha-card-image"
                            />
                            <div className="gacha-card-info">
                                <div className="gacha-card-name">{result.productName}</div>
                                <div className="gacha-card-rarity" style={{ color: getRateColorClass(result.rarity) }}>
                                    {normalizeRarity(result.rarity)}
                                </div>
                            </div>
                        </div>

                        <div className="gacha-actions">
                            <button onClick={onClose} className="gacha-button confirm">
                                <span>Confirm</span>
                            </button>
                            {remainingQuantity > 0 && (
                                <button onClick={() => onOpenMore?.(boxId)} className="gacha-button open-more">
                                    <span className='gacha-button-text'>Open More</span>
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>,
        document.body
    );
}
