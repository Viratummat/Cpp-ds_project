import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  loadData,
  saveData,
  clearData as storageClearData,
  downloadBackupFile,
  importData as storageImportData,
  getStorageInfo,
  SAMPLE_DATA,
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
  // Primary application state
  const [users, setUsers] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'portfolio' | 'ranking' | 'settings'

  // Modals state
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
      duration: toast.duration || 4500,
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

  // Safe confirm dialog triggers
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

  // Safe state persistence helper
  const commitUsersState = useCallback((nextUsers, successMessage, failureContext = 'saving data') => {
    const saveResult = saveData(nextUsers);
    if (!saveResult.success) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: `Could not save to localStorage: ${saveResult.error}. Changes were rolled back.`,
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
    setUsers(loaded.users || []);
    if (loaded.users && loaded.users.length > 0) {
      setSelectedUserId(loaded.users[0].userID);
    }
    setIsLoaded(true);

    if (loaded.metadata?.error) {
      addToast({
        type: 'warning',
        title: 'Storage Warning',
        message: `Saved data could not be fully restored: ${loaded.metadata.error}. Initialized empty state.`,
      });
    }
  }, [addToast]);

  // Keep selected user valid if users list changes
  useEffect(() => {
    if (users.length === 0) {
      setSelectedUserId(null);
    } else if (!selectedUserId || !users.some((u) => u.userID === selectedUserId)) {
      setSelectedUserId(users[0].userID);
    }
  }, [users, selectedUserId]);

  // Selected User helper
  const selectedUser = useMemo(() => {
    return users.find((u) => u.userID === selectedUserId) || null;
  }, [users, selectedUserId]);

  // Derived system metrics
  const systemMetrics = useMemo(() => {
    return calculateSystemMetrics(users);
  }, [users]);

  // Storage info
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
    const ok = commitUsersState(nextUsers, `User "${newUser.name}" (ID: ${newUser.userID}) added successfully.`);
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
      message: `Are you sure you want to delete user ID "${targetUser.userID}"? This will permanently delete all ${targetUser.investments?.length || 0} stock holdings in their portfolio.`,
      confirmText: 'Delete User & Portfolio',
      isDestructive: true,
      onConfirm: () => {
        const nextUsers = users.filter((u) => u.userID !== userId);
        commitUsersState(nextUsers, `User "${targetUser.name}" and their portfolio were deleted.`);
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

    // Check if user already owns this stock
    const existingIndex = (targetUser.investments || []).findIndex(
      (inv) => inv.stockName.toUpperCase() === normalizedStock
    );

    let nextInvestments = [...(targetUser.investments || [])];
    let successMessage = '';

    if (existingIndex !== -1) {
      // Merge with existing holding using weighted average price
      const existingHolding = nextInvestments[existingIndex];
      const merged = calculateWeightedAverage(existingHolding, qty, prc);

      nextInvestments[existingIndex] = {
        ...existingHolding,
        quantity: merged.quantity,
        price: merged.price,
        totalInvested: merged.totalInvested,
        lastAddedAt: new Date().toISOString(),
      };

      successMessage = `Added ${qty} shares to existing ${normalizedStock} holding. New total: ${merged.quantity} shares @ avg price ${formatINR(merged.price)} (${formatINR(merged.totalInvested)} invested).`;
    } else {
      // Add new holding node
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
      successMessage = `Added ${normalizedStock} (${qty} shares @ ${formatINR(prc)}) to portfolio. Total invested: ${formatINR(total)}.`;
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
    if (!targetUser) {
      addToast({ type: 'error', title: 'Error', message: 'User not found.' });
      return false;
    }

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

    const ok = commitUsersState(nextUsers, `Updated ${holdingName} holding: ${qty} shares @ ${formatINR(prc)} (${formatINR(newTotal)} total).`);
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
      title: `Remove ${holding.stockName} from Portfolio?`,
      message: `Are you sure you want to remove ${holding.quantity} shares of ${holding.stockName} (${formatINR(holding.totalInvested)} invested) from ${targetUser.name}'s portfolio?`,
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

        commitUsersState(nextUsers, `Removed ${holding.stockName} from ${targetUser.name}'s portfolio.`);
      },
    });
  }, [users, openConfirm, commitUsersState]);

  // ==========================================
  // DATA MANAGEMENT ACTIONS
  // ==========================================

  const loadSampleDataset = useCallback(() => {
    openConfirm({
      title: 'Load Realistic Sample Dataset?',
      message: 'This will replace current portfolio data with a comprehensive sample dataset featuring 3 users and realistic Indian equity investments (Reliance, TCS, HDFC Bank, Infosys, etc.).',
      confirmText: 'Load Sample Data',
      isDestructive: false,
      onConfirm: () => {
        const ok = commitUsersState(SAMPLE_DATA.users, 'Sample dataset loaded successfully!');
        if (ok) {
          setSelectedUserId('USR101');
          setActiveTab('overview');
        }
      },
    });
  }, [openConfirm, commitUsersState]);

  const clearAllApplicationData = useCallback(() => {
    openConfirm({
      title: 'Reset All Application Data?',
      message: 'Are you sure you want to clear all users, portfolios, and holdings? This action will reset localStorage to an empty state and cannot be undone unless you have an exported JSON backup.',
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
      `Successfully imported backup with ${importedUsers.length} users and their portfolios!`
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
        message: 'No data to export. Add some users and investments first.',
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
    loadSampleDataset,
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
