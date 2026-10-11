# Stock Portfolio Management System (C++)

A high-performance, polished, native **C++ Stock Portfolio Management System** designed with classical Data Structures and Algorithms (**Array + Singly Linked List + Selection Sort**).

---

## 📋 Project Overview & Architecture

This system is written entirely in **standard C++** and relies solely on the C++ Standard Library. It provides full user and investment portfolio tracking with native file persistence and defensive input handling.

### Core Data Structures
1. **User Array (`User users[MAX_USERS]`):**
   - Stores up to `100` registered user profiles.
   - Fixed-size array with `userCount` tracking active accounts.
   - Linear search `findUser(string id)` for $O(n)$ unique ID lookup.
2. **Holdings Singly Linked List (`Investment* head`):**
   - Each `User` structure holds a head pointer to a dynamically allocated linked list of stock holdings (`Investment`).
   - Dynamic node allocation (`new Investment`) ensures memory efficiency.
   - Linear search `findInvestment(User& user, string stockName)` traverses the list in $O(k)$ time.
3. **Selection Sort Algorithm ($O(k^2)$):**
   - Implemented from scratch on the linked list (no library `std::sort()`).
   - Supports both **Descending** (Highest to Lowest) and **Ascending** (Lowest to Highest) sorting directions.
   - **Non-mutating:** Deep copies the user's linked list before sorting, preserving the original portfolio order and preventing corruption.
   - Stable tie-breaker: Secondary alphabetical comparison on stock symbols.
4. **Weighted-Average Acquisition Price Merge:**
   - When adding additional shares of an already-owned stock, repeated purchases are merged automatically:
     $$\text{New Quantity} = \text{Old Quantity} + \text{Additional Quantity}$$
     $$\text{New Total Invested} = \text{Old Total Invested} + (\text{Additional Quantity} \times \text{New Purchase Price})$$
     $$\text{New Average Price} = \frac{\text{New Total Invested}}{\text{New Quantity}}$$

---

## 🛠️ Compilation & Execution

### Prerequisites
- Any standard C++ compiler supporting C++11 or higher (MinGW GCC `g++`, MSVC `cl.exe`, or Clang).

### 1. Build Using Windows Batch File
```cmd
build.bat
```

### 2. Build Using `g++` Directly
```bash
g++ -std=c++11 -Wall -O2 main.cpp Portfolio.cpp -o portfolio.exe
```

### 3. Run the Application
```cmd
portfolio.exe
```

### 4. Run Automated Test Suite
```bash
g++ -std=c++11 -Wall -O2 test_portfolio.cpp Portfolio.cpp -o test_runner.exe
test_runner.exe
```

---

## 🚀 Implemented Features

### 1. User Management
- **Add New User:** Rejects duplicate User IDs, supports full names with spaces, enforces maximum user limit ($100$).
- **View All Users:** Formatted tabular view displaying User ID, Full Name, Holdings Count, and Total Invested.
- **Search User by ID:** Instant lookup matching the C++ `findUser()` array search.
- **Edit User Name:** Safely updates user name.
- **Delete User:** Unlinks and deallocates all linked-list nodes in the user's portfolio and shifts array records cleanly.

### 2. Investment Management
- **Add / Merge Stock:** Validates positive integer quantities and positive prices. Automatically merges duplicate stocks using weighted-average pricing.
- **Edit Stock Holding:** Modifies quantity and purchase price, recalculating total acquisition costs.
- **Delete Stock Holding:** Unlinks and deletes the specific linked-list node with user confirmation.
- **View User Portfolio:** Displays formatted table with columns: `Stock`, `Quantity`, `Avg Price`, `Invested`, `Allocation (%)`.
- **Search Stock in Portfolio:** Searches for a stock symbol within a selected user's holdings.

### 3. Investment Ranking (Selection Sort)
- **Submenu with Sorting Directions:**
  1. `Sort by Investment -- Descending (Highest to Lowest)` (Rank 1 = largest investment).
  2. `Sort by Investment -- Ascending  (Lowest to Highest)` (Rank 1 = smallest investment).
  3. `Return to Main Menu`.
- **Display:** Shows Rank ($1, 2, 3\dots$), Stock Name, Quantity, Average Price, Total Invested, Allocation (%), plus Highest and Lowest investments.
- **Safe:** Sorts a cloned copy so the user's original linked-list sequence is never corrupted.

### 4. Portfolio Analytics
- **Individual User Analytics:** Total invested, distinct stocks held, average cost per holding, largest investment, smallest investment, and highest-allocation asset.
- **System-Wide Analytics:** Total registered users, total active holdings across all portfolios, total capital invested, and top portfolio account.

### 5. File Persistence & Backup / Restore
- **Auto-Load on Startup:** Automatically loads saved records from `portfolio_data.txt` if present. If no file exists, starts cleanly with 0 users.
- **Auto-Save on Changes & Exit:** Automatically updates `portfolio_data.txt` upon record mutations and clean application shutdown.
- **Export Data Backup:** Exports records to a custom backup file (`portfolio_backup.txt`).
- **Restore from Backup:** Validates file structure before applying changes, confirms before overwriting, and protects current state if restoration fails.

---

## 📁 Source File Breakdown

| File | Description |
| :--- | :--- |
| `Portfolio.h` | Header file defining `Investment`, `User`, constants (`MAX_USERS`), and function prototypes. |
| `Portfolio.cpp` | Implementation of linked list operations, Selection Sort (Asc/Desc), calculations, file I/O, and input validation. |
| `main.cpp` | Entry point containing the interactive console menu system. |
| `test_portfolio.cpp` | Automated test suite verifying all DSA operations, calculations, sorting, and persistence. |
| `build.bat` | Windows batch script for one-click compilation. |
| `Makefile` | Standard Makefile for build automation. |
