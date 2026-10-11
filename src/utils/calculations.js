/**
 * Portfolio Calculation Utilities
 * 
 * Strict financial calculations based on acquisition costs:
 * - Total Invested = Quantity * Average Price
 * - Weighted Average Price upon share addition:
 *     New Quantity = Old Quantity + Add Quantity
 *     New Total = Old Total + (Add Quantity * New Price)
 *     New Avg Price = New Total / New Quantity
 * - Safe percentage allocation with zero division safeguards
 */

/**
 * Calculate total invested for an individual holding.
 * Rounded to 2 decimal places to avoid floating-point drift.
 * @param {number} quantity
 * @param {number} price
 * @returns {number}
 */
export function calculateHoldingTotal(quantity, price) {
  const qty = Math.max(0, parseInt(quantity, 10) || 0);
  const prc = Math.max(0, parseFloat(price) || 0);
  return Number((qty * prc).toFixed(2));
}

/**
 * Calculates weighted-average purchase price and updated total when adding more shares
 * to an existing holding.
 * 
 * Formula:
 * New Quantity = Old Quantity + Additional Quantity
 * New Total Invested = Old Total Invested + (Additional Quantity * New Purchase Price)
 * New Average Purchase Price = New Total Invested / New Quantity
 * 
 * @param {Object} existingHolding - { quantity, price, totalInvested }
 * @param {number} additionalQuantity - Shares being added
 * @param {number} newPurchasePrice - Price paid per new share
 * @returns {{ quantity: number, price: number, totalInvested: number }}
 */
export function calculateWeightedAverage(existingHolding, additionalQuantity, newPurchasePrice) {
  const oldQty = Math.max(0, parseInt(existingHolding.quantity, 10) || 0);
  const oldTotal = Math.max(0, parseFloat(existingHolding.totalInvested) || (oldQty * parseFloat(existingHolding.price || 0)));

  const addQty = Math.max(0, parseInt(additionalQuantity, 10) || 0);
  const addPrice = Math.max(0, parseFloat(newPurchasePrice) || 0);

  const addCost = addQty * addPrice;
  const newQty = oldQty + addQty;

  if (newQty === 0) {
    return {
      quantity: 0,
      price: 0,
      totalInvested: 0,
    };
  }

  const newTotal = Number((oldTotal + addCost).toFixed(2));
  const newAvgPrice = Number((newTotal / newQty).toFixed(2));

  return {
    quantity: newQty,
    price: newAvgPrice,
    totalInvested: newTotal,
  };
}

/**
 * Calculate total amount invested in a user's portfolio
 * @param {Array<Object>} investments
 * @returns {number}
 */
export function calculatePortfolioTotal(investments) {
  if (!Array.isArray(investments) || investments.length === 0) {
    return 0;
  }
  const sum = investments.reduce((acc, inv) => {
    const total = Number(inv.totalInvested) || (Number(inv.quantity) * Number(inv.price)) || 0;
    return acc + total;
  }, 0);
  return Number(sum.toFixed(2));
}

/**
 * Calculate the portfolio allocation percentage for a holding
 * @param {number} holdingTotal
 * @param {number} portfolioTotal
 * @returns {number} Percentage between 0 and 100
 */
export function calculateAllocationPercentage(holdingTotal, portfolioTotal) {
  const holding = Number(holdingTotal) || 0;
  const portfolio = Number(portfolioTotal) || 0;

  if (portfolio <= 0 || holding <= 0) {
    return 0;
  }

  const percentage = (holding / portfolio) * 100;
  return Number(percentage.toFixed(2));
}

/**
 * Computes system-wide aggregate statistics across all users
 * @param {Array<Object>} users
 * @returns {Object}
 */
export function calculateSystemMetrics(users) {
  if (!Array.isArray(users) || users.length === 0) {
    return {
      totalInvested: 0,
      totalUsers: 0,
      totalHoldingsCount: 0,
      uniqueStocksCount: 0,
      largestHolding: null,
      topHoldings: [],
    };
  }

  let totalInvested = 0;
  let totalHoldingsCount = 0;
  const uniqueStockSet = new Set();
  let largestHolding = null;
  const allHoldingsFlattened = [];

  for (const user of users) {
    const investments = Array.isArray(user.investments) ? user.investments : [];
    for (const inv of investments) {
      const invTotal = Number(inv.totalInvested) || (Number(inv.quantity) * Number(inv.price)) || 0;
      totalInvested += invTotal;
      totalHoldingsCount++;

      if (inv.stockName) {
        uniqueStockSet.add(inv.stockName.toUpperCase().trim());
      }

      const holdingInfo = {
        ...inv,
        totalInvested: Number(invTotal.toFixed(2)),
        userId: user.userID,
        userName: user.name,
      };
      allHoldingsFlattened.push(holdingInfo);

      if (!largestHolding || invTotal > largestHolding.totalInvested) {
        largestHolding = holdingInfo;
      }
    }
  }

  // Get top 5 holdings overall using selection sort logic
  const topHoldings = [...allHoldingsFlattened];
  for (let i = 0; i < Math.min(5, topHoldings.length); i++) {
    let maxIdx = i;
    for (let j = i + 1; j < topHoldings.length; j++) {
      if (topHoldings[j].totalInvested > topHoldings[maxIdx].totalInvested) {
        maxIdx = j;
      }
    }
    if (maxIdx !== i) {
      const temp = topHoldings[i];
      topHoldings[i] = topHoldings[maxIdx];
      topHoldings[maxIdx] = temp;
    }
  }

  return {
    totalInvested: Number(totalInvested.toFixed(2)),
    totalUsers: users.length,
    totalHoldingsCount,
    uniqueStocksCount: uniqueStockSet.size,
    largestHolding,
    topHoldings: topHoldings.slice(0, 5),
  };
}
