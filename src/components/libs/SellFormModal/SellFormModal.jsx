import React from 'react';
import './SellFormModal.css';

export default function SellFormModal({
    isOpen,
    onClose,
    onSubmit,
    product,
    form,
    setForm,
    loading,
    result,
    minDescLength = 0,
    maxDescLength = 10000,
    minPrice = 1000,
    maxPrice = 100000000,
    multilineDescription = false,
}) {
    if (!isOpen) return null;

    return (
        <div className="sellModal-overlay">
            <div className="sellModal-container">
                <div className="sellModal-box" onClick={(e) => e.stopPropagation()}>
                    {/* Border Animation */}
                    <div className="sellModal-border"></div>

                    {/* Close button */}
                    <button className="sellModal-close" onClick={onClose} aria-label="Close">
                        &times;
                    </button>

                    {/* Header */}
                    <div className="sellModal-header">
                        <div className="sellModal-title oxanium-bold">Sell Product</div>
                        <div className="sellModal-subtitle oleo-script-regular">
                            {product?.productName}
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="sellModal-form">
                        <div className='flex gap-4 flex-col md:flex-row'>
                            <div className="sellModal-field">
                                <label className='oxanium-regular'>Quantity:</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={form.quantity}
                                    onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                                    className="sellModal-input oxanium-regular"
                                />
                            </div>

                            <div className="sellModal-field">
                                <label className='oxanium-regular'>Price (min {minPrice.toLocaleString()} and {maxPrice.toLocaleString()} max):</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.price}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        // Prevent negative input visually
                                        if (val === "" || Number(val) < 0) {
                                            setForm((f) => ({ ...f, price: "" }));
                                        } else {
                                            setForm((f) => ({ ...f, price: Number(val) }));
                                        }
                                    }}
                                    className="sellModal-input oxanium-regular"
                                />
                            </div>
                        </div>

                        <div className="sellModal-field">
                            <label className='oxanium-regular'>Description:</label>
                            <textarea
                                type="text"
                                minLength={minDescLength}
                                maxLength={maxDescLength}
                                value={form.description}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (val.length > maxDescLength) val = val.slice(0, maxDescLength);
                                    setForm((f) => ({ ...f, description: val }));
                                }}
                                className="sellModal-input oxanium-regular"
                                rows={multilineDescription ? 4 : 1}
                                style={multilineDescription ? { resize: 'vertical' } : {}}
                            />
                            <div
                                className='oxanium-regular'
                                style={{ fontSize: '11px', color: form.description.length < minDescLength || form.description.length > maxDescLength ? 'red' : '#888' }}
                            >
                                {`Description: ${form.description.length}/${maxDescLength} characters. (Min: ${minDescLength}, Max: ${maxDescLength})`}
                            </div>
                        </div>

                        <button type="submit" className="oxanium-bold sellModal-submitBtn" disabled={loading}>
                            {loading ? (
                                <span className="loading loading-bars loading-md"></span>
                            ) :
                                'Confirm Sell'
                            }
                        </button>
                    </form>

                    {/* Result */}
                    {result && (
                        <div className={`sellModal-result ${result.status ? 'success' : 'error'}`}>
                            {result.status && result.data?.exchangeCode && (
                                <div className="sellModal-code">
                                    Exchange Code: <b>{result.data.exchangeCode}</b>
                                </div>
                            )}
                            {result.status
                                ? result.data?.message
                                : result.error || 'Failed to sell product.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
