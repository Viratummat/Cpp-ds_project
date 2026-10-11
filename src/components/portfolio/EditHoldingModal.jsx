import React, { useState, useEffect, useMemo } from 'react';
import { Layers, Calculator } from 'lucide-react';
import { Modal } from '../common/Modal';
import { usePortfolio } from '../../context/PortfolioContext';
import { validateQuantity, validatePrice } from '../../utils/validation';
import { calculateHoldingTotal } from '../../utils/calculations';
import { formatINR } from '../../utils/currency';

export function EditHoldingModal() {
  const {
    editHoldingModal,
    setEditHoldingModal,
    editHolding,
  } = usePortfolio();

  const isOpen = editHoldingModal.isOpen;
  const holding = editHoldingModal.holding;
  const userId = editHoldingModal.userId;

  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && holding) {
      setQuantity(String(holding.quantity));
      setPrice(String(holding.price));
      setErrors({});
    }
  }, [isOpen, holding]);

  const handleClose = () => {
    setEditHoldingModal({ isOpen: false, userId: null, holding: null });
    setErrors({});
  };

  const previewTotal = useMemo(() => {
    const q = parseInt(quantity, 10);
    const p = parseFloat(price);
    if (!isNaN(q) && q > 0 && !isNaN(p) && p > 0) {
      return calculateHoldingTotal(q, p);
    }
    return 0;
  }, [quantity, price]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const qVal = validateQuantity(quantity);
    if (!qVal.valid) newErrors.quantity = qVal.error;

    const pVal = validatePrice(price);
    if (!pVal.valid) newErrors.price = pVal.error;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    editHolding(userId, holding.id, quantity, price);
  };

  if (!holding) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Edit Holding: ${holding.stockName}`}
      subtitle="Update quantity or purchase price directly"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Readonly Stock Name */}
        <div>
          <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
            Stock Symbol
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Layers className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={holding.stockName}
              disabled
              className="cosmic-input pl-10 font-mono font-bold text-purple-300 bg-black/60 cursor-not-allowed opacity-80"
            />
          </div>
        </div>

        {/* Quantity and Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
              Quantity <span className="text-purple-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: null }));
              }}
              placeholder="Enter quantity"
              className={`cosmic-input font-mono ${errors.quantity ? 'border-rose-500' : ''}`}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-rose-400">{errors.quantity}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
              Price (₹) <span className="text-purple-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-semibold font-mono">
                ₹
              </span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors((prev) => ({ ...prev, price: null }));
                }}
                placeholder="Enter purchase price"
                className={`cosmic-input pl-8 font-mono ${errors.price ? 'border-rose-500' : ''}`}
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-xs text-rose-400">{errors.price}</p>
            )}
          </div>
        </div>

        {/* Recalculated total */}
        <div className="p-3 bg-black/60 border border-white/[0.08] rounded-xl flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-purple-400" />
            Recalculated Acquisition Total:
          </span>
          <span className="font-bold text-white text-sm">
            {formatINR(previewTotal)}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={handleClose}
            className="pill-btn-secondary !text-xs !py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="pill-btn-neon !text-xs !py-2"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
