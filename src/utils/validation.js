/**
 * Centralized Validation Utilities
 * 
 * Enforces business rules and data constraints:
 * - Unique, non-empty User IDs (alphanumeric, hyphens, underscores)
 * - Valid User Names (supports spaces e.g., "Virat Kumar")
 * - Valid Stock Names (normalized to uppercase)
 * - Integer quantities strictly > 0
 * - Purchase prices strictly > 0
 * - Deep validation for JSON backup imports
 */

export const MAX_USERS_LIMIT = 100; // Matching original C++ MAX_USERS
export const MAX_QUANTITY_LIMIT = 10000000;
export const MAX_PRICE_LIMIT = 100000000;

/**
 * Validate User ID
 * @param {string} userId
 * @param {Array<Object>} existingUsers
 * @param {string} [excludeUserId] - For edit operations
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateUserId(userId, existingUsers = [], excludeUserId = null) {
  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    return { valid: false, error: 'User ID cannot be empty.' };
  }

  const cleanId = userId.trim();

  if (cleanId.length < 1 || cleanId.length > 30) {
    return { valid: false, error: 'User ID must be between 1 and 30 characters.' };
  }

  // Check valid characters (letters, numbers, underscores, hyphens)
  if (!/^[a-zA-Z0-9_\-]+$/.test(cleanId)) {
    return { valid: false, error: 'User ID can only contain letters, numbers, hyphens, and underscores.' };
  }

  // Duplicate check (case-insensitive for safety)
  const isDuplicate = existingUsers.some(user => {
    if (excludeUserId && user.userID.toLowerCase() === excludeUserId.toLowerCase()) {
      return false;
    }
    return user.userID.toLowerCase() === cleanId.toLowerCase();
  });

  if (isDuplicate) {
    return { valid: false, error: `User ID "${cleanId}" already exists. Please choose a unique ID.` };
  }

  if (!excludeUserId && existingUsers.length >= MAX_USERS_LIMIT) {
    return { valid: false, error: `Maximum user limit of ${MAX_USERS_LIMIT} reached.` };
  }

  return { valid: true };
}

/**
 * Validate User Name
 * Supports spaces e.g., "Virat Kumar"
 * @param {string} name
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateUserName(name) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { valid: false, error: 'User name cannot be empty.' };
  }

  const cleanName = name.trim();

  if (cleanName.length < 2 || cleanName.length > 60) {
    return { valid: false, error: 'User name must be between 2 and 60 characters.' };
  }

  return { valid: true };
}

/**
 * Validate Stock Name / Symbol
 * @param {string} stockName
 * @returns {{ valid: boolean, error?: string, normalized?: string }}
 */
export function validateStockName(stockName) {
  if (!stockName || typeof stockName !== 'string' || !stockName.trim()) {
    return { valid: false, error: 'Stock name cannot be empty.' };
  }

  const clean = stockName.trim().toUpperCase();

  if (clean.length < 1 || clean.length > 20) {
    return { valid: false, error: 'Stock symbol/name must be between 1 and 20 characters.' };
  }

  // Allow letters, numbers, dots, and hyphens (e.g., M&M, BRK.B, TCS)
  if (!/^[A-Z0-9&.\-_]+$/.test(clean)) {
    return { valid: false, error: 'Stock name contains invalid characters. Use letters, numbers, and standard symbols.' };
  }

  return { valid: true, normalized: clean };
}

/**
 * Validate Quantity
 * Must be a positive integer > 0
 * @param {any} quantity
 * @returns {{ valid: boolean, error?: string, parsed?: number }}
 */
export function validateQuantity(quantity) {
  if (quantity === undefined || quantity === null || quantity === '') {
    return { valid: false, error: 'Quantity is required.' };
  }

  const num = Number(quantity);

  if (isNaN(num) || !Number.isInteger(num)) {
    return { valid: false, error: 'Quantity must be a whole integer.' };
  }

  if (num <= 0) {
    return { valid: false, error: 'Quantity must be greater than 0.' };
  }

  if (num > MAX_QUANTITY_LIMIT) {
    return { valid: false, error: `Quantity cannot exceed ${MAX_QUANTITY_LIMIT.toLocaleString('en-IN')}.` };
  }

  return { valid: true, parsed: num };
}

/**
 * Validate Purchase Price
 * Must be a positive numeric value > 0
 * @param {any} price
 * @returns {{ valid: boolean, error?: string, parsed?: number }}
 */
export function validatePrice(price) {
  if (price === undefined || price === null || price === '') {
    return { valid: false, error: 'Price is required.' };
  }

  const num = Number(price);

  if (isNaN(num)) {
    return { valid: false, error: 'Price must be a valid number.' };
  }

  if (num <= 0) {
    return { valid: false, error: 'Price must be greater than 0.' };
  }

  if (num > MAX_PRICE_LIMIT) {
    return { valid: false, error: `Price cannot exceed ₹${MAX_PRICE_LIMIT.toLocaleString('en-IN')}.` };
  }

  return { valid: true, parsed: Number(num.toFixed(2)) };
}

/**
 * Comprehensive schema validation for imported JSON backups.
 * Verifies structure, uniqueness, types, and values.
 * 
 * @param {any} rawData
 * @returns {{ valid: boolean, error?: string, sanitizedData?: Object }}
 */
export function validateImportPayload(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    return { valid: false, error: 'Imported file does not contain a valid JSON object.' };
  }

  // Must have a users array or be an array of users directly
  let usersList = null;

  if (Array.isArray(rawData)) {
    usersList = rawData;
  } else if (Array.isArray(rawData.users)) {
    usersList = rawData.users;
  } else {
    return { valid: false, error: 'Invalid backup structure: Expected a "users" array.' };
  }

  const sanitizedUsers = [];
  const seenUserIds = new Set();

  for (let uIdx = 0; uIdx < usersList.length; uIdx++) {
    const rawUser = usersList[uIdx];

    if (!rawUser || typeof rawUser !== 'object') {
      return { valid: false, error: `Invalid user entry at index ${uIdx}.` };
    }

    const userId = typeof rawUser.userID === 'string' ? rawUser.userID.trim() : String(rawUser.userID || '').trim();
    const name = typeof rawUser.name === 'string' ? rawUser.name.trim() : String(rawUser.name || '').trim();

    if (!userId) {
      return { valid: false, error: `User at index ${uIdx} has an empty User ID.` };
    }

    const lowerId = userId.toLowerCase();
    if (seenUserIds.has(lowerId)) {
      return { valid: false, error: `Duplicate User ID "${userId}" detected in import file.` };
    }
    seenUserIds.add(lowerId);

    if (!name) {
      return { valid: false, error: `User "${userId}" has an empty name.` };
    }

    const rawInvestments = Array.isArray(rawUser.investments) ? rawUser.investments : [];
    const sanitizedInvestments = [];
    const seenStocksForUser = new Set();

    for (let iIdx = 0; iIdx < rawInvestments.length; iIdx++) {
      const rawInv = rawInvestments[iIdx];
      if (!rawInv || typeof rawInv !== 'object') {
        return { valid: false, error: `Invalid investment for user "${userId}" at index ${iIdx}.` };
      }

      const stockName = String(rawInv.stockName || '').trim().toUpperCase();
      if (!stockName) {
        return { valid: false, error: `Missing stock name for user "${userId}".` };
      }

      if (seenStocksForUser.has(stockName)) {
        return { valid: false, error: `User "${userId}" has multiple entries for stock "${stockName}". Holdings per user must be unique.` };
      }
      seenStocksForUser.add(stockName);

      const qty = parseInt(rawInv.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return { valid: false, error: `Invalid quantity "${rawInv.quantity}" for stock "${stockName}" of user "${userId}". Must be a positive integer.` };
      }

      const price = parseFloat(rawInv.price);
      if (isNaN(price) || price <= 0) {
        return { valid: false, error: `Invalid price "${rawInv.price}" for stock "${stockName}" of user "${userId}". Must be positive.` };
      }

      const totalInvested = Number((qty * price).toFixed(2));
      const id = rawInv.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      sanitizedInvestments.push({
        id: String(id),
        stockName,
        quantity: qty,
        price: Number(price.toFixed(2)),
        totalInvested,
        addedAt: rawInv.addedAt || new Date().toISOString(),
      });
    }

    sanitizedUsers.push({
      userID: userId,
      name,
      createdAt: rawUser.createdAt || new Date().toISOString(),
      investments: sanitizedInvestments,
    });
  }

  return {
    valid: true,
    sanitizedData: {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      users: sanitizedUsers,
    }
  };
}
