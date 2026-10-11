/**
 * LocalStorage Persistence Service
 * 
 * Strict behavioral rules:
 * - Starts in 100% clean, empty state with ZERO users and ZERO investments.
 * - Absolutely NO automatic seeding of example users or prefilled personal names.
 * - Safe versioned persistence under `stockPortfolioApp_v1`.
 * - Deep validation for all JSON imports and exports.
 */

import { validateImportPayload } from '../utils/validation';

export const STORAGE_KEY = 'stockPortfolioApp_v1';
export const APP_VERSION = '1.0.0';

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
 * Load persisted application state from localStorage.
 * Always returns clean empty structure ([]) on first run or if storage is empty.
 * 
 * @returns {{ users: Array<Object>, metadata: Object, isFirstRun: boolean }}
 */
export function loadData() {
  if (!isStorageAvailable()) {
    return {
      users: [],
      metadata: { loadedFromStorage: false, error: 'Storage inaccessible' },
      isFirstRun: true,
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First run: strictly clean empty state
      return {
        users: [],
        metadata: { loadedFromStorage: false, version: APP_VERSION },
        isFirstRun: true,
      };
    }

    const parsed = JSON.parse(raw);
    const validation = validateImportPayload(parsed);

    if (!validation.valid || !validation.sanitizedData) {
      return {
        users: [],
        metadata: { loadedFromStorage: false, error: validation.error },
        isFirstRun: false,
      };
    }

    return {
      users: validation.sanitizedData.users || [],
      metadata: {
        loadedFromStorage: true,
        version: validation.sanitizedData.version || APP_VERSION,
        exportedAt: validation.sanitizedData.exportedAt,
      },
      isFirstRun: false,
    };
  } catch (error) {
    return {
      users: [],
      metadata: { loadedFromStorage: false, error: error.message },
      isFirstRun: false,
    };
  }
}

/**
 * Saves application state safely into localStorage.
 * 
 * @param {Array<Object>} users
 * @returns {{ success: boolean, error?: string }}
 */
export function saveData(users) {
  if (!isStorageAvailable()) {
    return { success: false, error: 'Browser localStorage is disabled or inaccessible.' };
  }

  try {
    const payload = {
      appName: 'Stock Portfolio Management System',
      version: APP_VERSION,
      savedAt: new Date().toISOString(),
      users: Array.isArray(users) ? users : [],
    };

    const serialized = JSON.stringify(payload);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true };
  } catch (error) {
    let errorMessage = error.message;
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      errorMessage = 'Storage quota exceeded. Please export a backup and delete older entries.';
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Exports current genuine user-created application data as JSON
 * @param {Array<Object>} users
 * @returns {string}
 */
export function exportData(users) {
  const payload = {
    appName: 'Stock Portfolio Management System',
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    totalUsers: (users || []).length,
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
  const filename = `portfolio-backup-${dateStr}.json`;

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
 * Returns storage metadata and diagnostics
 * @param {Array<Object>} currentUsers
 * @returns {Object}
 */
export function getStorageInfo(currentUsers = []) {
  const available = isStorageAvailable();
  let usedBytes = 0;
  let formattedSize = '0.00 KB';

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

  const users = currentUsers || [];
  const holdingsCount = users.reduce((sum, u) => sum + (u.investments?.length || 0), 0);

  return {
    isAvailable: available,
    storageKey: STORAGE_KEY,
    version: APP_VERSION,
    usedBytes,
    formattedSize,
    usersCount: users.length,
    holdingsCount,
  };
}
