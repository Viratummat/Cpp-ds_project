import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Layers, AlertCircle, RefreshCw, Calculator, User } from 'lucide-react';
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
    setErrors({});
  };

  // Find if selected user already owns this stock
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

  // Preview calculations
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

  // Quick Indian stock symbol suggestion buttons
  const popularSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'TATAMOTORS', 'ITC', 'LT', 'SBIN', 'BHARTIARTL'];

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
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Target User Profile <span className="text-emerald-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <select
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                if (errors.userId) setErrors((prev) => ({ ...prev, userId: null }));
              }}
              className="fintech-input pl-9"
            >
              {users.map((u) => (
                <option key={u.userID} value={u.userID} className="bg-[#111827] text-white">
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
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Stock Symbol / Name <span className="text-emerald-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Layers className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={stockName}
              onChange={(e) => {
                setStockName(e.target.value.toUpperCase());
                if (errors.stockName) setErrors((prev) => ({ ...prev, stockName: null }));
              }}
              placeholder="e.g. TCS, RELIANCE, INFY"
              className={`fintech-input pl-9 font-mono font-semibold tracking-wider ${
                errors.stockName ? 'border-rose-500' : ''
              }`}
            />
          </div>
          {errors.stockName && (
            <p className="mt-1 text-xs text-rose-400">{errors.stockName}</p>
          )}

          {/* Quick symbol picker */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-slate-500 mr-1">Suggestions:</span>
            {popularSymbols.slice(0, 6).map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => setStockName(sym)}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1E293B] hover:bg-[#28384E] text-slate-300 hover:text-emerald-300 transition-colors"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity & Price Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Quantity (Shares) <span className="text-emerald-400">*</span>
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
              placeholder="e.g. 25"
              className={`fintech-input font-mono ${errors.quantity ? 'border-rose-500' : ''}`}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-rose-400">{errors.quantity}</p>
            )}
            <p className="mt-1 text-[11px] text-slate-500">Whole positive integer.</p>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Price per Share (₹) <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-semibold">
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
                placeholder="e.g. 3500.50"
                className={`fintech-input pl-8 font-mono ${errors.price ? 'border-rose-500' : ''}`}
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-xs text-rose-400">{errors.price}</p>
            )}
            <p className="mt-1 text-[11px] text-slate-500">Purchase acquisition cost.</p>
          </div>
        </div>

        {/* Dynamic Calculation / Merge Notification */}
        {existingHolding && (
          <div className="p-3.5 bg-amber-950/40 border border-amber-800/50 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Stock Already Owned — Will Merge via Weighted Average</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
              <div>
                <span className="text-slate-400 block">Current Holding:</span>
                {existingHolding.quantity} shares @ {formatINR(existingHolding.price)}
                <span className="block text-slate-400">({formatINR(existingHolding.totalInvested)})</span>
              </div>
              {previewCalculation && (
                <div>
                  <span className="text-emerald-400 font-bold block">New Merged Total:</span>
                  {previewCalculation.quantity} shares @ {formatINR(previewCalculation.price)}
                  <span className="block text-emerald-400 font-bold">({formatINR(previewCalculation.totalInvested)})</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* New Stock Preview */}
        {!existingHolding && previewCalculation && (
          <div className="p-3 bg-[#0B0F19] border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              Calculated Total Invested:
            </span>
            <span className="font-bold font-mono text-emerald-400 text-sm">
              {formatINR(previewCalculation.totalInvested)}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
          <button
            type="button"
            onClick={handleClose}
            className="fintech-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="fintech-btn-primary"
          >
            {existingHolding ? 'Merge & Update Holding' : 'Add Investment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
