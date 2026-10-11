import React, { useState, useEffect, useMemo } from 'react';
import { Layers, RefreshCw, Calculator, User } from 'lucide-react';
import { Modal } from '../common/Modal';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  validateStockName,
  validateQuantity,
  validatePrice,
} from '../../utils/validation';
import {
  calculateHoldingTotal,
  calculateWeightedAverage,
} from '../../utils/calculations';
import { formatINR } from '../../utils/currency';

export function InvestmentModal() {
  const {
    addHoldingModal,
    setAddHoldingModal,
    users,
    addInvestment,
  } = usePortfolio();

  const isOpen = addHoldingModal.isOpen;
  const initialUserId = addHoldingModal.userId;

  // Form fields strictly empty with no prefilled values
  const [userId, setUserId] = useState('');
  const [stockName, setStockName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setUserId(initialUserId || (users[0]?.userID || ''));
      setStockName('');
      setQuantity('');
      setPrice('');
      setErrors({});
    }
  }, [isOpen, initialUserId, users]);

  const handleClose = () => {
    setAddHoldingModal({ isOpen: false, userId: null });
    setStockName('');
    setQuantity('');
    setPrice('');
    setErrors({});
  };

  const selectedUser = useMemo(() => {
    return users.find((u) => u.userID === userId) || null;
  }, [users, userId]);

  const normalizedStock = stockName.trim().toUpperCase();

  const existingHolding = useMemo(() => {
    if (!selectedUser || !normalizedStock) return null;
    return (selectedUser.investments || []).find(
      (inv) => inv.stockName.toUpperCase() === normalizedStock
    ) || null;
  }, [selectedUser, normalizedStock]);

  const parsedQty = parseInt(quantity, 10);
  const parsedPrice = parseFloat(price);
  const isValidInputs = !isNaN(parsedQty) && parsedQty > 0 && !isNaN(parsedPrice) && parsedPrice > 0;

  const previewCalculation = useMemo(() => {
    if (!isValidInputs) return null;

    if (existingHolding) {
      return calculateWeightedAverage(existingHolding, parsedQty, parsedPrice);
    } else {
      const total = calculateHoldingTotal(parsedQty, parsedPrice);
      return {
        quantity: parsedQty,
        price: parsedPrice,
        totalInvested: total,
      };
    }
  }, [isValidInputs, existingHolding, parsedQty, parsedPrice]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!userId) {
      newErrors.userId = 'Please select a user.';
    }

    const stockVal = validateStockName(stockName);
    if (!stockVal.valid) {
      newErrors.stockName = stockVal.error;
    }

    const qtyVal = validateQuantity(quantity);
    if (!qtyVal.valid) {
      newErrors.quantity = qtyVal.error;
    }

    const priceVal = validatePrice(price);
    if (!priceVal.valid) {
      newErrors.price = priceVal.error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addInvestment(userId, stockName, quantity, price);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Stock Investment"
      subtitle="Replicating C++ addInvestment() with weighted-average merge logic"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Selection */}
        <div>
          <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
            Target User Profile <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <select
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                if (errors.userId) setErrors((prev) => ({ ...prev, userId: null }));
              }}
              className="cosmic-input pl-10 text-xs"
            >
              {users.map((u) => (
                <option key={u.userID} value={u.userID} className="bg-[#0B0D14] text-white">
                  {u.name} ({u.userID}) — {u.investments?.length || 0} stocks
                </option>
              ))}
            </select>
          </div>
          {errors.userId && (
            <p className="mt-1 text-xs text-rose-400">{errors.userId}</p>
          )}
        </div>

        {/* Stock Symbol */}
        <div>
          <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
            Stock Symbol / Name <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Layers className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={stockName}
              onChange={(e) => {
                setStockName(e.target.value.toUpperCase());
                if (errors.stockName) setErrors((prev) => ({ ...prev, stockName: null }));
              }}
              placeholder="Enter stock symbol (e.g. TCS)"
              className={`cosmic-input pl-10 font-mono uppercase tracking-wider ${
                errors.stockName ? 'border-rose-500' : ''
              }`}
            />
          </div>
          {errors.stockName && (
            <p className="mt-1 text-xs text-rose-400">{errors.stockName}</p>
          )}
        </div>

        {/* Quantity & Price Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
              Quantity (Shares) <span className="text-purple-400">*</span>
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
              Price per Share (₹) <span className="text-purple-400">*</span>
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

        {/* Existing stock merge preview */}
        {existingHolding && (
          <div className="p-3.5 bg-purple-950/40 border border-purple-500/40 rounded-xl text-xs space-y-2 font-mono">
            <div className="flex items-center gap-1.5 font-bold text-purple-300">
              <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              <span>Stock Already Owned — Merging with Weighted Average</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-400 block">Current Holding:</span>
                {existingHolding.quantity} shares @ {formatINR(existingHolding.price)}
              </div>
              {previewCalculation && (
                <div>
                  <span className="text-purple-300 font-bold block">New Merged Total:</span>
                  {previewCalculation.quantity} shares @ {formatINR(previewCalculation.price)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Total preview for new stock */}
        {!existingHolding && previewCalculation && (
          <div className="p-3 bg-black/60 border border-white/[0.08] rounded-xl flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-purple-400" />
              Calculated Total Invested:
            </span>
            <span className="font-bold text-white text-sm">
              {formatINR(previewCalculation.totalInvested)}
            </span>
          </div>
        )}

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
            {existingHolding ? 'Merge & Update Holding' : 'Add Investment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
