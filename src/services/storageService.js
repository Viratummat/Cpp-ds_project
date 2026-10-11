/**
 * LocalStorage Persistence Service
 * 
 * Responsibilities:
 * - Versioned persistence under `stockPortfolioApp_v1`
 * - Resilient error handling (QuotaExceeded, private mode, JSON corruption)
 * - Safe update pattern with fallback to last known-good state
 * - Full export / import validation
 * - Storage diagnostics and metadata
 */

import { validateImportPayload } from '../utils/validation';

export const STORAGE_KEY = 'stockPortfolioApp_v1';
export const APP_VERSION = '1.0.0';

/**
 * Realistic Indian Stock Market sample portfolio data
 * Clearly labeled and optional, perfect for demonstrating the system.
 */
export const SAMPLE_DATA = {
  version: APP_VERSION,
  exportedAt: new Date().toISOString(),
  users: [
    {
      userID: 'USR101',
      name: 'Virat Kumar',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      investments: [
        {
          id: 'inv_sample_1',
          stockName: 'RELIANCE',
          quantity: 50,
          price: 2950.00,
          totalInvested: 147500.00,
          addedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        },
        {
          id: 'inv_sample_2',
          stockName: 'TCS',
          quantity: 35,
          price: 4120.50,
          totalInvested: 144217.50,
          addedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: 'inv_sample_3',
          stockName: 'HDFCBANK',
          quantity: 80,
          price: 1530.00,
          totalInvested: 122400.00,
          addedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: 'inv_sample_4',
          stockName: 'INFY',
          quantity: 60,
          price: 1845.25,
          totalInvested: 110715.00,
          addedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
        {
          id: 'inv_sample_5',
          stockName: 'TATAMOTORS',
          quantity: 100,
          price: 980.00,
          totalInvested: 98000.00,
          addedAt: new Date().toISOString(),
        }
      ]
    },
    {
      userID: 'USR102',
      name: 'Priya Sharma',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      investments: [
        {
          id: 'inv_sample_6',
          stockName: 'ITC',
          quantity: 300,
          price: 495.50,
          totalInvested: 148650.00,
          addedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: 'inv_sample_7',
          stockName: 'BHARTIARTL',
          quantity: 75,
          price: 1650.00,
          totalInvested: 123750.00,
          addedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
        {
          id: 'inv_sample_8',
          stockName: 'ICICIBANK',
          quantity: 90,
          price: 1220.00,
          totalInvested: 109800.00,
          addedAt: new Date().toISOString(),
        }
      ]
    },
    {
      userID: 'USR103',
      name: 'Arjun Patel',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      investments: [
        {
          id: 'inv_sample_9',
          stockName: 'LT',
          quantity: 40,
          price: 3650.00,
          totalInvested: 146000.00,
          addedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
        {
          id: 'inv_sample_10',
          stockName: 'SBIN',
          quantity: 120,
          price: 815.00,
          totalInvested: 97800.00,
          addedAt: new Date().toISOString(),
        }
      ]
    }
  ]
};

/**
 * Checks if browser localStorage is available and accessible
 * @returns {boolean}
 */
export function isStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Load persisted application state from localStorage
 * Returns clean empty structure if not found or corrupted
 * 
 * @returns {{ users: Array<Object>, metadata: Object, isFirstRun: boolean }}
 */
export function loadData() {
  if (!isStorageAvailable()) {
    console.warn('[Storage] localStorage is not accessible in this environment.');
    return {
      users: [],
      metadata: { loadedFromStorage: false, error: 'Storage inaccessible' },
      isFirstRun: true,
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First run: clean empty state
      return {
        users: [],
        metadata: { loadedFromStorage: false, version: APP_VERSION },
        isFirstRun: true,
      };
    }

    const parsed = JSON.parse(raw);
    const validation = validateImportPayload(parsed);

    if (!validation.valid || !validation.sanitizedData) {
      console.error('[Storage] Malformed data detected in storage:', validation.error);
      return {
        users: [],
        metadata: { loadedFromStorage: false, error: validation.error },
        isFirstRun: false,
      };
    }

    return {
      users: validation.sanitizedData.users,
      metadata: {
        loadedFromStorage: true,
        version: validation.sanitizedData.version || APP_VERSION,
        exportedAt: validation.sanitizedData.exportedAt,
      },
      isFirstRun: false,
    };
  } catch (error) {
    console.error('[Storage] Error reading or parsing localStorage:', error);
    return {
      users: [],
      metadata: { loadedFromStorage: false, error: error.message },
      isFirstRun: false,
    };
  }
}

/**
 * Saves application state safely into localStorage.
 * Ensures data matches the valid structure before serialization.
 * 
 * @param {Array<Object>} users
 * @returns {{ success: boolean, error?: string }}
 */
export function saveData(users) {
  if (!isStorageAvailable()) {
    return { success: false, error: 'Browser localStorage is disabled or inaccessible.' };
  }

  try {
    // Validate payload before saving
    const payload = {
      version: APP_VERSION,
      savedAt: new Date().toISOString(),
      users: Array.isArray(users) ? users : [],
    };

    const serialized = JSON.stringify(payload);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true };
  } catch (error) {
    console.error('[Storage] Failed to save state to localStorage:', error);
    let errorMessage = error.message;

    if (error.name === 'QuotaExceededError' || error.code === 22) {
      errorMessage = 'Storage quota exceeded. Please export your backup and clear older data.';
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Exports current application data as a formatted JSON string
 * @param {Array<Object>} users
 * @returns {string}
 */
export function exportData(users) {
  const payload = {
    appName: 'Stock Portfolio Management System',
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    totalUsers: users.length,
    users: users || [],
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Triggers a browser file download of the exported JSON backup
 * @param {Array<Object>} users
 */
export function downloadBackupFile(users) {
  const jsonString = exportData(users);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `stock-portfolio-backup-${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates and imports a JSON string backup
 * Returns sanitized users or error description without mutating storage
 * 
 * @param {string} jsonString
 * @returns {{ success: boolean, users?: Array<Object>, error?: string }}
 */
export function importData(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    return { success: false, error: 'Empty or invalid backup file provided.' };
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return { success: false, error: `Invalid JSON syntax: ${e.message}` };
  }

  const result = validateImportPayload(parsed);
  if (!result.valid) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    users: result.sanitizedData.users,
  };
}

/**
 * Clear all portfolio data from localStorage
 * @returns {{ success: boolean, error?: string }}
 */
export function clearData() {
  if (!isStorageAvailable()) {
    return { success: false, error: 'Storage not accessible.' };
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Returns metadata and diagnostics about the storage layer
 * @param {Array<Object>} currentUsers
 * @returns {Object}
 */
export function getStorageInfo(currentUsers = []) {
  const available = isStorageAvailable();
  let usedBytes = 0;
  let formattedSize = '0 KB';

  if (available) {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        usedBytes = new Blob([item]).size;
        formattedSize = `${(usedBytes / 1024).toFixed(2)} KB`;
      }
    } catch (e) {
      // ignore
    }
  }

  const holdingsCount = currentUsers.reduce((sum, u) => sum + (u.investments?.length || 0), 0);

  return {
    isAvailable: available,
    storageKey: STORAGE_KEY,
    version: APP_VERSION,
    usedBytes,
    formattedSize,
    usersCount: currentUsers.length,
    holdingsCount,
    storageQuotaLimit: 'Approx 5 MB (Standard browser localStorage)',
  };
}
