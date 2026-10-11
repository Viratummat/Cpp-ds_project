import { describe, it, expect } from 'vitest';
import { selectionSortInvestments } from '../sorting';
import {
  calculateHoldingTotal,
  calculateWeightedAverage,
  calculatePortfolioTotal,
  calculateAllocationPercentage,
  calculateSystemMetrics
} from '../calculations';
import { formatINR, formatPercentage } from '../currency';
import {
  validateUserId,
  validateUserName,
  validateStockName,
  validateQuantity,
  validatePrice,
  validateImportPayload
} from '../validation';

describe('Selection Sort Algorithm', () => {
  it('correctly sorts investments in descending order of totalInvested', () => {
    const holdings = [
      { stockName: 'INFY', quantity: 10, price: 1000, totalInvested: 10000 },
      { stockName: 'TCS', quantity: 10, price: 3000, totalInvested: 30000 },
      { stockName: 'RELIANCE', quantity: 5, price: 5000, totalInvested: 25000 },
      { stockName: 'ITC', quantity: 20, price: 200, totalInvested: 4000 },
    ];

    const { sortedInvestments, stats } = selectionSortInvestments(holdings);

    expect(sortedInvestments.map(i => i.stockName)).toEqual([
      'TCS',       // 30000
      'RELIANCE',  // 25000
      'INFY',      // 10000
      'ITC'        // 4000
    ]);
    expect(stats.comparisons).toBeGreaterThan(0);
    expect(stats.swaps).toBeGreaterThanOrEqual(0);
  });

  it('is completely non-mutating on the input array and objects', () => {
    const original = [
      { stockName: 'A', totalInvested: 100 },
      { stockName: 'B', totalInvested: 500 },
    ];
    const originalSnapshot = JSON.parse(JSON.stringify(original));

    selectionSortInvestments(original);

    expect(original).toEqual(originalSnapshot);
    expect(original[0].stockName).toBe('A');
  });

  it('handles empty and single-element arrays gracefully', () => {
    expect(selectionSortInvestments([]).sortedInvestments).toEqual([]);
    expect(selectionSortInvestments(null).sortedInvestments).toEqual([]);

    const single = [{ stockName: 'TCS', totalInvested: 5000 }];
    const result = selectionSortInvestments(single);
    expect(result.sortedInvestments).toHaveLength(1);
    expect(result.sortedInvestments[0].stockName).toBe('TCS');
  });

  it('handles ties consistently using alphabetical secondary order', () => {
    const ties = [
      { stockName: 'WIPRO', totalInvested: 10000 },
      { stockName: 'INFY', totalInvested: 10000 },
      { stockName: 'HCLTECH', totalInvested: 10000 },
    ];

    const { sortedInvestments } = selectionSortInvestments(ties);
    expect(sortedInvestments.map(i => i.stockName)).toEqual(['HCLTECH', 'INFY', 'WIPRO']);
  });
});

describe('Portfolio Calculations', () => {
  it('calculates individual holding total accurately', () => {
    expect(calculateHoldingTotal(50, 2950)).toBe(147500);
    expect(calculateHoldingTotal(35, 4120.50)).toBe(144217.50);
  });

  it('calculates weighted-average purchase price and merged totals when adding shares', () => {
    const existing = {
      quantity: 10,
      price: 100.00,
      totalInvested: 1000.00,
    };

    // Adding 10 shares @ ₹200
    // Total invested should be 1000 + 2000 = 3000
    // New quantity = 20
    // Weighted avg price = 3000 / 20 = 150
    const result = calculateWeightedAverage(existing, 10, 200);

    expect(result.quantity).toBe(20);
    expect(result.totalInvested).toBe(3000);
    expect(result.price).toBe(150);
  });

  it('calculates complex real-world weighted averages correctly', () => {
    const existing = {
      quantity: 35,
      price: 4120.50,
      totalInvested: 144217.50,
    };

    // Adding 15 shares @ ₹4000
    // Cost of new shares: 15 * 4000 = 60000
    // New total: 144217.50 + 60000 = 204217.50
    // New qty: 50
    // New avg price: 204217.50 / 50 = 4084.35
    const result = calculateWeightedAverage(existing, 15, 4000);

    expect(result.quantity).toBe(50);
    expect(result.totalInvested).toBe(204217.50);
    expect(result.price).toBe(4084.35);
  });

  it('calculates total portfolio sum correctly', () => {
    const investments = [
      { totalInvested: 1000 },
      { totalInvested: 2500.50 },
      { totalInvested: 500 },
    ];
    expect(calculatePortfolioTotal(investments)).toBe(4000.50);
    expect(calculatePortfolioTotal([])).toBe(0);
  });

  it('calculates allocation percentage and prevents division by zero', () => {
    expect(calculateAllocationPercentage(5000, 20000)).toBe(25);
    expect(calculateAllocationPercentage(0, 20000)).toBe(0);
    expect(calculateAllocationPercentage(5000, 0)).toBe(0);
    expect(calculateAllocationPercentage(0, 0)).toBe(0);
  });

  it('calculates system metrics across multiple users', () => {
    const sampleUsers = [
      {
        userID: 'U1',
        name: 'User 1',
        investments: [
          { stockName: 'TCS', quantity: 10, price: 3000, totalInvested: 30000 },
          { stockName: 'INFY', quantity: 10, price: 1000, totalInvested: 10000 },
        ]
      },
      {
        userID: 'U2',
        name: 'User 2',
        investments: [
          { stockName: 'TCS', quantity: 5, price: 3200, totalInvested: 16000 },
          { stockName: 'RELIANCE', quantity: 10, price: 2500, totalInvested: 25000 },
        ]
      }
    ];

    const metrics = calculateSystemMetrics(sampleUsers);
    expect(metrics.totalUsers).toBe(2);
    expect(metrics.totalHoldingsCount).toBe(4);
    expect(metrics.uniqueStocksCount).toBe(3); // TCS, INFY, RELIANCE
    expect(metrics.totalInvested).toBe(81000);
    expect(metrics.largestHolding.stockName).toBe('TCS');
    expect(metrics.largestHolding.totalInvested).toBe(30000);
  });
});

describe('Currency and Formatting', () => {
  it('formats Indian Rupee currency correctly with 2 decimal places', () => {
    const formatted = formatINR(125000);
    // Should include currency symbol ₹ and grouping
    expect(formatted).toContain('1,25,000.00');
    expect(formatINR(0)).toContain('0.00');
    expect(formatINR('invalid')).toContain('0.00');
  });

  it('formats percentages safely', () => {
    expect(formatPercentage(33.3333)).toBe('33.33%');
    expect(formatPercentage(0)).toBe('0.00%');
    expect(formatPercentage(NaN)).toBe('0.00%');
  });
});

describe('Validation Logic', () => {
  const existingUsers = [
    { userID: 'USR101', name: 'Virat Kumar' },
    { userID: 'USR102', name: 'Rohit Sharma' },
  ];

  it('validates user ID uniqueness (case-insensitive)', () => {
    expect(validateUserId('USR101', existingUsers).valid).toBe(false);
    expect(validateUserId('usr101', existingUsers).valid).toBe(false);
    expect(validateUserId('USR103', existingUsers).valid).toBe(true);
    expect(validateUserId('', existingUsers).valid).toBe(false);
    expect(validateUserId('   ', existingUsers).valid).toBe(false);
  });

  it('allows same user ID when updating current user', () => {
    expect(validateUserId('USR101', existingUsers, 'USR101').valid).toBe(true);
    expect(validateUserId('usr101', existingUsers, 'USR101').valid).toBe(true);
  });

  it('validates user name including names with spaces', () => {
    expect(validateUserName('Virat Kumar').valid).toBe(true);
    expect(validateUserName('A').valid).toBe(false);
    expect(validateUserName('').valid).toBe(false);
  });

  it('validates stock symbols and normalizes to uppercase', () => {
    const res = validateStockName('tcs');
    expect(res.valid).toBe(true);
    expect(res.normalized).toBe('TCS');
    expect(validateStockName('').valid).toBe(false);
  });

  it('validates quantity as positive whole integers', () => {
    expect(validateQuantity(10).valid).toBe(true);
    expect(validateQuantity(0).valid).toBe(false);
    expect(validateQuantity(-5).valid).toBe(false);
    expect(validateQuantity(10.5).valid).toBe(false);
    expect(validateQuantity('abc').valid).toBe(false);
  });

  it('validates price as positive number', () => {
    expect(validatePrice(2500.50).valid).toBe(true);
    expect(validatePrice(0).valid).toBe(false);
    expect(validatePrice(-100).valid).toBe(false);
    expect(validatePrice('abc').valid).toBe(false);
  });

  it('validates backup JSON payloads strictly', () => {
    const validPayload = {
      version: '1.0.0',
      users: [
        {
          userID: 'TEST1',
          name: 'Test User',
          investments: [
            { stockName: 'TCS', quantity: 10, price: 3000 }
          ]
        }
      ]
    };
    const res = validateImportPayload(validPayload);
    expect(res.valid).toBe(true);
    expect(res.sanitizedData.users).toHaveLength(1);

    // Duplicate user IDs in payload
    const duplicatePayload = {
      users: [
        { userID: 'TEST1', name: 'User 1', investments: [] },
        { userID: 'TEST1', name: 'User 2', investments: [] },
      ]
    };
    expect(validateImportPayload(duplicatePayload).valid).toBe(false);

    // Invalid stock quantity
    const invalidQtyPayload = {
      users: [
        {
          userID: 'TEST1',
          name: 'User 1',
          investments: [{ stockName: 'TCS', quantity: -5, price: 100 }]
        }
      ]
    };
    expect(validateImportPayload(invalidQtyPayload).valid).toBe(false);
  });
});
