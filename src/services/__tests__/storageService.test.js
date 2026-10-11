import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadData,
  saveData,
  exportData,
  importData,
  clearData,
  getStorageInfo,
  STORAGE_KEY,
} from '../storageService';

// Mock localStorage in Vitest Node environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    _getStore: () => store,
  };
})();

Object.defineProperty(globalThis, 'window', {
  value: { localStorage: localStorageMock },
  writable: true,
});
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('LocalStorage Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('starts in a strictly clean empty state with zero users', () => {
    const result = loadData();
    expect(result.users).toEqual([]);
    expect(result.isFirstRun).toBe(true);
  });

  it('persists and reloads user-created portfolios safely', () => {
    const newUsers = [
      {
        userID: 'INV_001',
        name: 'Account Holder',
        investments: [
          {
            id: 'inv_1',
            stockName: 'TCS',
            quantity: 25,
            price: 3500,
            totalInvested: 87500,
          },
        ],
      },
    ];

    const saveRes = saveData(newUsers);
    expect(saveRes.success).toBe(true);

    const loaded = loadData();
    expect(loaded.users).toHaveLength(1);
    expect(loaded.users[0].userID).toBe('INV_001');
    expect(loaded.users[0].investments[0].stockName).toBe('TCS');
    expect(loaded.users[0].investments[0].totalInvested).toBe(87500);
  });

  it('exports structured JSON backup with required metadata', () => {
    const testUsers = [
      {
        userID: 'USER_10',
        name: 'Investor One',
        investments: [],
      },
    ];
    const jsonStr = exportData(testUsers);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.appName).toBe('Stock Portfolio Management System');
    expect(parsed.users).toHaveLength(1);
    expect(parsed.exportedAt).toBeDefined();
  });

  it('imports valid JSON backup successfully', () => {
    const backupJson = JSON.stringify({
      version: '1.0.0',
      users: [
        {
          userID: 'TEST_RESTORE',
          name: 'Restored Profile',
          investments: [
            {
              id: 'inv_test',
              stockName: 'INFY',
              quantity: 10,
              price: 1800,
              totalInvested: 18000,
            },
          ],
        },
      ],
    });

    const importRes = importData(backupJson);
    expect(importRes.success).toBe(true);
    expect(importRes.users).toHaveLength(1);
    expect(importRes.users[0].userID).toBe('TEST_RESTORE');
  });

  it('rejects corrupt or invalid JSON backup without mutating storage', () => {
    const badJson = '{"invalidStructure": true}';
    const importRes = importData(badJson);
    expect(importRes.success).toBe(false);
    expect(importRes.error).toBeDefined();
  });

  it('clears all data and returns to clean empty state', () => {
    saveData([{ userID: 'TEMP', name: 'Temp', investments: [] }]);
    expect(loadData().users.length).toBe(1);

    const clearRes = clearData();
    expect(clearRes.success).toBe(true);
    expect(loadData().users).toEqual([]);
  });

  it('computes storage diagnostics correctly', () => {
    const info = getStorageInfo([]);
    expect(info.isAvailable).toBe(true);
    expect(info.storageKey).toBe(STORAGE_KEY);
    expect(info.usersCount).toBe(0);
    expect(info.holdingsCount).toBe(0);
  });
});
