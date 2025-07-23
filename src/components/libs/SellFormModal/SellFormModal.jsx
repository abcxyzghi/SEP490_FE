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
}) {
    if (!isOpen) return null;

    return (
        <div className="sellModal-container" onClick={onClose}>
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
                                className="sellModal-input"
                            />
                        </div>

                        <div className="sellModal-field">
                            <label className='oxanium-regular'>Price:</label>
                            <input
                                type="number"
                                min={1000}
                                step={1000}
                                value={form.price}
                                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                                className="sellModal-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="sellModal-field">
                        <label className='oxanium-regular'>Description:</label>
                        <textarea
                            type="text"
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            className="sellModal-input"
                        />
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
    );
}
