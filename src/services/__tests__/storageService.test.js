import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadData,
  saveData,
  exportData,
  importData,
  clearData,
  getStorageInfo,
  STORAGE_KEY,
  SAMPLE_DATA,
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

  it('loads clean empty state when storage is empty', () => {
    const result = loadData();
    expect(result.users).toEqual([]);
    expect(result.isFirstRun).toBe(true);
  });

  it('saves and reloads user portfolio state accurately', () => {
    const testUsers = [
      {
        userID: 'USR101',
        name: 'Virat Kumar',
        investments: [
          {
            id: 'inv_1',
            stockName: 'TCS',
            quantity: 20,
            price: 3500,
            totalInvested: 70000,
          },
        ],
      },
    ];

    const saveRes = saveData(testUsers);
    expect(saveRes.success).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.stringContaining('USR101')
    );

    const loaded = loadData();
    expect(loaded.users).toHaveLength(1);
    expect(loaded.users[0].userID).toBe('USR101');
    expect(loaded.users[0].investments[0].stockName).toBe('TCS');
    expect(loaded.users[0].investments[0].totalInvested).toBe(70000);
  });

  it('exports structured JSON backup with required metadata', () => {
    const users = SAMPLE_DATA.users;
    const jsonStr = exportData(users);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.appName).toBe('Stock Portfolio Management System');
    expect(parsed.users).toHaveLength(users.length);
    expect(parsed.exportedAt).toBeDefined();
  });

  it('imports valid JSON backup successfully', () => {
    const backupJson = JSON.stringify({
      version: '1.0.0',
      users: [
        {
          userID: 'TEST99',
          name: 'Backup Investor',
          investments: [
            {
              id: 'inv_test',
              stockName: 'INFY',
              quantity: 15,
              price: 1800,
              totalInvested: 27000,
            },
          ],
        },
      ],
    });

    const importRes = importData(backupJson);
    expect(importRes.success).toBe(true);
    expect(importRes.users).toHaveLength(1);
    expect(importRes.users[0].userID).toBe('TEST99');
  });

  it('rejects corrupt or invalid JSON backup without mutating storage', () => {
    const badJson = '{"notAValidBackup": true}';
    const importRes = importData(badJson);
    expect(importRes.success).toBe(false);
    expect(importRes.error).toBeDefined();
  });

  it('clears data and resets storage correctly', () => {
    saveData(SAMPLE_DATA.users);
    expect(loadData().users.length).toBeGreaterThan(0);

    const clearRes = clearData();
    expect(clearRes.success).toBe(true);
    expect(loadData().users).toEqual([]);
  });

  it('computes storage diagnostics correctly', () => {
    const info = getStorageInfo(SAMPLE_DATA.users);
    expect(info.isAvailable).toBe(true);
    expect(info.storageKey).toBe(STORAGE_KEY);
    expect(info.usersCount).toBe(SAMPLE_DATA.users.length);
  });
});
