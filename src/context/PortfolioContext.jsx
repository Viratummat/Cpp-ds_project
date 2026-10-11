import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  loadData,
  saveData,
  clearData as storageClearData,
  downloadBackupFile,
  importData as storageImportData,
  getStorageInfo,
} from '../services/storageService';
import {
  validateUserId,
  validateUserName,
  validateStockName,
  validateQuantity,
  validatePrice,
} from '../utils/validation';
import {
  calculateHoldingTotal,
  calculateWeightedAverage,
  calculateSystemMetrics,
} from '../utils/calculations';
import { formatINR } from '../utils/currency';

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  // Primary application state — strictly starts empty
  const [users, setUsers] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'portfolio' | 'ranking' | 'settings'

  // Modals state — all inputs start clean and empty
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editUserModal, setEditUserModal] = useState({ isOpen: false, user: null });
  const [addHoldingModal, setAddHoldingModal] = useState({ isOpen: false, userId: null });
  const [editHoldingModal, setEditHoldingModal] = useState({ isOpen: false, userId: null, holding: null });
  const [searchUserModalOpen, setSearchUserModalOpen] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDestructive: false,
    onConfirm: () => {},
  });

  // Toast notification state
  const [toasts, setToasts] = useState([]);

  // Toast manager
  const addToast = useCallback((toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast = {
      id,
      type: toast.type || 'info', // 'success' | 'error' | 'warning' | 'info'
      title: toast.title || '',
      message: toast.message || '',
      duration: toast.duration || 4000,
    };
    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Safe confirm dialog
  const openConfirm = useCallback(({ title, message, confirmText, cancelText, isDestructive, onConfirm }) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText: confirmText || (isDestructive ? 'Delete' : 'Confirm'),
      cancelText: cancelText || 'Cancel',
      isDestructive: !!isDestructive,
      onConfirm: () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        onConfirm();
      },
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Safe persistence helper
  const commitUsersState = useCallback((nextUsers, successMessage) => {
    const saveResult = saveData(nextUsers);
    if (!saveResult.success) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: `Could not save to browser storage: ${saveResult.error}. Changes were rolled back.`,
      });
      return false;
    }

    setUsers(nextUsers);
    if (successMessage) {
      addToast({
        type: 'success',
        title: 'Success',
        message: successMessage,
      });
    }
    return true;
  }, [addToast]);

  // Load from localStorage on initial mount
  useEffect(() => {
    const loaded = loadData();
    const existingUsers = Array.isArray(loaded.users) ? loaded.users : [];
    setUsers(existingUsers);
    if (existingUsers.length > 0) {
      setSelectedUserId(existingUsers[0].userID);
    } else {
      setSelectedUserId(null);
    }
    setIsLoaded(true);
  }, []);

  // Keep selected user valid
  useEffect(() => {
    if (users.length === 0) {
      setSelectedUserId(null);
    } else if (!selectedUserId || !users.some((u) => u.userID === selectedUserId)) {
      setSelectedUserId(users[0].userID);
    }
  }, [users, selectedUserId]);

  const selectedUser = useMemo(() => {
    return users.find((u) => u.userID === selectedUserId) || null;
  }, [users, selectedUserId]);

  const systemMetrics = useMemo(() => {
    return calculateSystemMetrics(users);
  }, [users]);

  const storageInfo = useMemo(() => {
    return getStorageInfo(users);
  }, [users]);

  // ==========================================
  // USER ACTIONS
  // ==========================================

  const addUser = useCallback((userId, name) => {
    const idValidation = validateUserId(userId, users);
    if (!idValidation.valid) {
      addToast({ type: 'error', title: 'Invalid User ID', message: idValidation.error });
      return false;
    }

    const nameValidation = validateUserName(name);
    if (!nameValidation.valid) {
      addToast({ type: 'error', title: 'Invalid User Name', message: nameValidation.error });
      return false;
    }

    const newUser = {
      userID: userId.trim(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      investments: [],
    };

    const nextUsers = [...users, newUser];
    const ok = commitUsersState(nextUsers, `User "${newUser.name}" (ID: ${newUser.userID}) created successfully.`);
    if (ok) {
      setSelectedUserId(newUser.userID);
      setAddUserModalOpen(false);
    }
    return ok;
  }, [users, commitUsersState, addToast]);

  const editUserName = useCallback((userId, newName) => {
    const nameValidation = validateUserName(newName);
    if (!nameValidation.valid) {
      addToast({ type: 'error', title: 'Invalid Name', message: nameValidation.error });
      return false;
    }

    const nextUsers = users.map((u) => {
      if (u.userID === userId) {
        return { ...u, name: newName.trim() };
      }
      return u;
    });

    const ok = commitUsersState(nextUsers, `User ID "${userId}" name updated to "${newName.trim()}".`);
    if (ok) {
      setEditUserModal({ isOpen: false, user: null });
    }
    return ok;
  }, [users, commitUsersState, addToast]);

  const deleteUser = useCallback((userId) => {
    const targetUser = users.find((u) => u.userID === userId);
    if (!targetUser) {
      addToast({ type: 'error', title: 'Error', message: 'User not found.' });
      return;
    }

    openConfirm({
      title: `Delete User "${targetUser.name}"?`,
      message: `Are you sure you want to delete User ID "${targetUser.userID}"? This will permanently remove this user and all ${targetUser.investments?.length || 0} stock holdings.`,
      confirmText: 'Delete User & Portfolio',
      isDestructive: true,
      onConfirm: () => {
        const nextUsers = users.filter((u) => u.userID !== userId);
        commitUsersState(nextUsers, `User "${targetUser.name}" was removed.`);
      },
    });
  }, [users, openConfirm, commitUsersState, addToast]);

  // ==========================================
  // INVESTMENT ACTIONS
  // ==========================================

  const addInvestment = useCallback((userId, stockName, quantity, price) => {
    const targetUser = users.find((u) => u.userID === userId);
    if (!targetUser) {
      addToast({ type: 'error', title: 'User Not Found', message: `Cannot add investment: User "${userId}" not found.` });
      return false;
    }

    const stockValidation = validateStockName(stockName);
    if (!stockValidation.valid) {
      addToast({ type: 'error', title: 'Invalid Stock Name', message: stockValidation.error });
      return false;
    }

    const qtyValidation = validateQuantity(quantity);
    if (!qtyValidation.valid) {
      addToast({ type: 'error', title: 'Invalid Quantity', message: qtyValidation.error });
      return false;
    }

    const priceValidation = validatePrice(price);
    if (!priceValidation.valid) {
      addToast({ type: 'error', title: 'Invalid Price', message: priceValidation.error });
      return false;
    }

    const normalizedStock = stockValidation.normalized;
    const qty = qtyValidation.parsed;
    const prc = priceValidation.parsed;

    const existingIndex = (targetUser.investments || []).findIndex(
      (inv) => inv.stockName.toUpperCase() === normalizedStock
    );

    let nextInvestments = [...(targetUser.investments || [])];
    let successMessage = '';

    if (existingIndex !== -1) {
      // Merge holding with weighted-average price
      const existingHolding = nextInvestments[existingIndex];
      const merged = calculateWeightedAverage(existingHolding, qty, prc);

      nextInvestments[existingIndex] = {
        ...existingHolding,
        quantity: merged.quantity,
        price: merged.price,
        totalInvested: merged.totalInvested,
        lastAddedAt: new Date().toISOString(),
      };

      successMessage = `Added ${qty} shares to existing ${normalizedStock} holding. Weighted average price: ${formatINR(merged.price)}.`;
    } else {
      const total = calculateHoldingTotal(qty, prc);
      const newHolding = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        stockName: normalizedStock,
        quantity: qty,
        price: prc,
        totalInvested: total,
        addedAt: new Date().toISOString(),
      };
      nextInvestments.push(newHolding);
      successMessage = `Added ${normalizedStock} (${qty} shares @ ${formatINR(prc)}) to ${targetUser.name}'s portfolio.`;
    }

    const nextUsers = users.map((u) => {
      if (u.userID === userId) {
        return { ...u, investments: nextInvestments };
      }
      return u;
    });

    const ok = commitUsersState(nextUsers, successMessage);
    if (ok) {
      setAddHoldingModal({ isOpen: false, userId: null });
    }
    return ok;
  }, [users, commitUsersState, addToast]);

  const editHolding = useCallback((userId, holdingId, newQuantity, newPrice) => {
    const targetUser = users.find((u) => u.userID === userId);
    if (!targetUser) return false;

    const qtyValidation = validateQuantity(newQuantity);
    if (!qtyValidation.valid) {
      addToast({ type: 'error', title: 'Invalid Quantity', message: qtyValidation.error });
      return false;
    }

    const priceValidation = validatePrice(newPrice);
    if (!priceValidation.valid) {
      addToast({ type: 'error', title: 'Invalid Price', message: priceValidation.error });
      return false;
    }

    const qty = qtyValidation.parsed;
    const prc = priceValidation.parsed;
    const newTotal = calculateHoldingTotal(qty, prc);

    let holdingName = '';
    const nextInvestments = (targetUser.investments || []).map((inv) => {
      if (inv.id === holdingId) {
        holdingName = inv.stockName;
        return {
          ...inv,
          quantity: qty,
          price: prc,
          totalInvested: newTotal,
          modifiedAt: new Date().toISOString(),
        };
      }
      return inv;
    });

    const nextUsers = users.map((u) => {
      if (u.userID === userId) {
        return { ...u, investments: nextInvestments };
      }
      return u;
    });

    const ok = commitUsersState(nextUsers, `Updated ${holdingName} holding: ${qty} shares @ ${formatINR(prc)}.`);
    if (ok) {
      setEditHoldingModal({ isOpen: false, userId: null, holding: null });
    }
    return ok;
  }, [users, commitUsersState, addToast]);

  const deleteHolding = useCallback((userId, holdingId) => {
    const targetUser = users.find((u) => u.userID === userId);
    if (!targetUser) return;

    const holding = (targetUser.investments || []).find((h) => h.id === holdingId);
    if (!holding) return;

    openConfirm({
      title: `Remove ${holding.stockName}?`,
      message: `Are you sure you want to remove ${holding.quantity} shares of ${holding.stockName} (${formatINR(holding.totalInvested)}) from ${targetUser.name}'s portfolio?`,
      confirmText: 'Remove Holding',
      isDestructive: true,
      onConfirm: () => {
        const nextInvestments = targetUser.investments.filter((h) => h.id !== holdingId);
        const nextUsers = users.map((u) => {
          if (u.userID === userId) {
            return { ...u, investments: nextInvestments };
          }
          return u;
        });
        commitUsersState(nextUsers, `Removed ${holding.stockName} from portfolio.`);
      },
    });
  }, [users, openConfirm, commitUsersState]);

  // ==========================================
  // DATA MANAGEMENT ACTIONS
  // ==========================================

  const clearAllApplicationData = useCallback(() => {
    openConfirm({
      title: 'Reset All Application Data?',
      message: 'Are you sure you want to clear all registered users and investments? This will reset local storage to a clean empty state.',
      confirmText: 'Clear All Data',
      isDestructive: true,
      onConfirm: () => {
        storageClearData();
        setUsers([]);
        setSelectedUserId(null);
        addToast({
          type: 'info',
          title: 'System Reset',
          message: 'All application data has been cleared from browser storage.',
        });
      },
    });
  }, [openConfirm, addToast]);

  const importBackup = useCallback((jsonString) => {
    const result = storageImportData(jsonString);
    if (!result.success) {
      addToast({
        type: 'error',
        title: 'Import Failed',
        message: result.error || 'Invalid backup file format.',
      });
      return false;
    }

    const importedUsers = result.users || [];
    const ok = commitUsersState(
      importedUsers,
      `Successfully imported backup with ${importedUsers.length} user(s).`
    );

    if (ok && importedUsers.length > 0) {
      setSelectedUserId(importedUsers[0].userID);
    }
    return ok;
  }, [commitUsersState, addToast]);

  const exportBackup = useCallback(() => {
    if (users.length === 0) {
      addToast({
        type: 'warning',
        title: 'Export Warning',
        message: 'No user data to export. Register users and investments first.',
      });
      return;
    }
    downloadBackupFile(users);
    addToast({
      type: 'success',
      title: 'Export Complete',
      message: 'Portfolio data backup downloaded as JSON.',
    });
  }, [users, addToast]);

  const value = {
    users,
    isLoaded,
    selectedUserId,
    setSelectedUserId,
    selectedUser,
    activeTab,
    setActiveTab,
    systemMetrics,
    storageInfo,
    toasts,
    addToast,
    removeToast,
    confirmDialog,
    openConfirm,
    closeConfirm,
    // Modals
    addUserModalOpen,
    setAddUserModalOpen,
    editUserModal,
    setEditUserModal,
    addHoldingModal,
    setAddHoldingModal,
    editHoldingModal,
    setEditHoldingModal,
    searchUserModalOpen,
    setSearchUserModalOpen,
    // Operations
    addUser,
    editUserName,
    deleteUser,
    addInvestment,
    editHolding,
    deleteHolding,
    clearAllApplicationData,
    importBackup,
    exportBackup,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
