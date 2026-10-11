/**
 * Selection Sort Implementation for Stock Portfolio Management
 * 
 * Replicates the exact algorithm from the original C++ project:
 * - Sorts investments by `totalInvested` in DESCENDING order (highest to lowest).
 * - Implemented purely using Selection Sort algorithm WITHOUT Array.prototype.sort().
 * - Non-mutating: Operates on a deep-cloned copy to ensure the user's stored portfolio order
 *   is never corrupted or mutated unexpectedly.
 * - Handles ties consistently (secondary sort by stockName ascending for stability).
 */

/**
 * Sorts an array of investment holdings by totalInvested in descending order
 * using the classic Selection Sort algorithm (O(n²) time complexity).
 * 
 * @param {Array<Object>} investments - Array of investment objects
 * @returns {{ sortedInvestments: Array<Object>, stats: { comparisons: number, swaps: number, timeMs: number } }}
 */
export function selectionSortInvestments(investments) {
  if (!Array.isArray(investments) || investments.length === 0) {
    return {
      sortedInvestments: [],
      stats: { comparisons: 0, swaps: 0, timeMs: 0 }
    };
  }

  // Clone array and objects to guarantee non-mutating behavior
  const arr = investments.map(inv => ({ ...inv }));
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  // Selection Sort in descending order
  for (let i = 0; i < n - 1; i++) {
    let maxIndex = i;

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const currentInvestment = Number(arr[j].totalInvested) || 0;
      const maxInvestment = Number(arr[maxIndex].totalInvested) || 0;

      if (currentInvestment > maxInvestment) {
        maxIndex = j;
      } else if (currentInvestment === maxInvestment) {
        // Stable tie-breaker: sort alphabetically by stock name if investments are equal
        const nameJ = (arr[j].stockName || '').toUpperCase();
        const nameMax = (arr[maxIndex].stockName || '').toUpperCase();
        if (nameJ < nameMax) {
          maxIndex = j;
        }
      }
    }

    // Swap elements if maximum is not at current index i
    if (maxIndex !== i) {
      swaps++;
      const temp = arr[i];
      arr[i] = arr[maxIndex];
      arr[maxIndex] = temp;
    }
  }

  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const timeMs = Math.max(0, Number((endTime - startTime).toFixed(3)));

  return {
    sortedInvestments: arr,
    stats: {
      comparisons,
      swaps,
      timeMs
    }
  };
}
