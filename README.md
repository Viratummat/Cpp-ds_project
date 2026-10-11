# Stock Portfolio Management System (PortfoliQ)

A modern, high-performance, fintech-grade web application adapted from an educational **C++ Stock Portfolio Management System**. Built with **React 18, Vite, Tailwind CSS, Lucide React, Recharts, and browser LocalStorage**.

---

## 🚀 Key Features & C++ Logic Preservation

| C++ Feature / Function | Web Implementation | Highlights |
| :--- | :--- | :--- |
| `addUser()` | **User Registration Modal** | Unique User ID validation, space-supported names (e.g., "Virat Kumar"), max limit check (100 users). |
| `addInvestment()` | **Add Stock Modal & Smart Merge** | Validates positive whole shares & price. **Automatically merges duplicate stock holdings** using the exact C++ **weighted-average purchase price formula**. |
| `viewPortfolio()` | **Portfolio Tracker & Allocation** | Displays User ID, Name, Total Portfolio Investment, holdings table, and interactive **Recharts Donut Allocation Chart**. |
| `selectionSort()` | **Selection Sort Algorithm** | Pure JavaScript implementation of the **Selection Sort** algorithm ($O(n^2)$) in descending order of Total Invested. Non-mutating copy avoids corrupting user's stored sequence. **No `Array.prototype.sort()` used**. |
| `searchUser()` | **C++ Find User Modal** | Instant lookup by User ID replicating array search, displaying formatted card with stocks count, total invested in INR, and quick action shortcuts. |
| `clearInvestments()` | **Reset & Purge Controls** | Destructive actions protected by accessible confirmation modals. |

---

## 🧮 Financial Calculation Formulas

This application tracks **historical acquisition costs only**. It does not fetch live stock market prices or pretend to execute live trading.

### 1. Individual Holding Cost
$$\text{Total Invested} = \text{Quantity} \times \text{Average Purchase Price}$$

### 2. Weighted-Average Price Merge (When adding more shares)
$$\text{New Quantity} = \text{Old Quantity} + \text{Additional Quantity}$$
$$\text{New Total Invested} = \text{Old Total Invested} + (\text{Additional Quantity} \times \text{New Purchase Price})$$
$$\text{New Average Price} = \frac{\text{New Total Invested}}{\text{New Quantity}}$$

### 3. Portfolio Allocation Percentage
$$\text{Portfolio Allocation (\%)} = \frac{\text{Holding Total Invested}}{\text{Total Portfolio Investment}} \times 100$$
*(Includes safe division-by-zero checks when total investment is zero)*

### 4. Currency Formatting
All monetary amounts are strictly formatted according to the Indian numbering system:
```
₹1,25,000.00
```

---

## 📂 Project Architecture

```
project/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx                     # Application entry point with ErrorBoundary
    ├── App.jsx                      # Primary layout and view router
    ├── styles/
    │   └── index.css                # Tailwind directives and fintech styling
    ├── utils/
    │   ├── currency.js              # Indian Rupee (INR) formatter & percentage helpers
    │   ├── sorting.js               # Selection Sort algorithm (O(n²)) implementation
    │   ├── calculations.js          # Weighted averages, holding totals & system metrics
    │   ├── validation.js            # User IDs, quantities, prices & JSON backup validator
    │   └── __tests__/
    │       └── portfolio.test.js    # Vitest unit test suite (19 unit tests)
    ├── services/
    │   ├── storageService.js        # LocalStorage persistence, JSON export/import, demo data
    │   └── __tests__/
    │       └── storageService.test.js # Vitest persistence tests (7 unit tests)
    ├── context/
    │   └── PortfolioContext.jsx     # Reactive state management and toast notifications
    └── components/
        ├── common/
        │   ├── Navbar.jsx           # Header with C++ findUser shortcut & storage indicator
        │   ├── Sidebar.jsx          # Collapsible desktop sidebar & mobile drawer
        │   ├── StatCard.jsx         # Metric display cards
        │   ├── Modal.jsx            # Reusable accessible modal dialog
        │   ├── ConfirmDialog.jsx    # Destructive action confirmation modal
        │   ├── Toast.jsx            # Toast alert notification system
        │   ├── EmptyState.jsx       # Empty states with action triggers
        │   └── ErrorBoundary.jsx    # React error boundary
        ├── dashboard/
        │   ├── DashboardOverview.jsx # Key metrics, allocation donut, top 5 holdings
        │   └── AllocationChart.jsx  # Interactive Recharts donut visualization
        ├── users/
        │   ├── UsersView.jsx        # Searchable users table with full CRUD actions
        │   ├── UserModal.jsx        # Add & Edit user modal with instant validation
        │   └── UserSearchModal.jsx  # C++ searchUser() modal
        ├── portfolio/
        │   ├── PortfolioView.jsx    # User portfolio tracker, holdings table, filters
        │   ├── InvestmentModal.jsx  # Add stock & live weighted average calculation preview
        │   └── EditHoldingModal.jsx # Direct holding quantity & price editor
        ├── ranking/
        │   └── RankingView.jsx      # Descending Selection Sort rank table & O(n²) telemetry
        └── settings/
            └── SettingsView.jsx     # JSON export/import, storage metrics, dataset reset
```

---

## 💾 LocalStorage Persistence Layer

- **Versioned Key**: `stockPortfolioApp_v1`
- **Integrity**: Validated against comprehensive schema on load and prior to import.
- **Fail-Safe**: If a save fails or exceeds browser quota, changes are rolled back to the last known-good state and a notification is displayed.
- **Full Backup**: Export the entire dataset as a `.json` file anytime and restore it on any machine.
- **Demo Data**: Includes realistic sample portfolios (Reliance, TCS, HDFC Bank, Infosys, etc.) for demonstration purposes.

---

## 🛠️ Getting Started Locally

### 1. Prerequisites
- **Node.js** (v18 or higher recommended, tested on Node v24)
- **npm** (v9 or higher)

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 4. Run Unit Tests
```bash
npm test
```
Executes all 26 unit tests covering the Selection Sort algorithm, weighted average calculations, validation, and storage service.

### 5. Build for Production
```bash
npm run build
```
Generates an optimized, code-split production build in `dist/`.

---

## 🧪 Testing Checklist Verified

- [x] Create user with unique User ID and name containing spaces (e.g. "Virat Kumar").
- [x] Duplicate User ID prevention with clear error feedback.
- [x] Add stock holding with quantity and price.
- [x] Add more shares of the same stock and verify **weighted-average price** recalculation.
- [x] Selection Sort descending ranking verification without `Array.prototype.sort()`.
- [x] User ID search replicating C++ `findUser()`.
- [x] Edit user name and holding parameters.
- [x] Delete holding and user with confirmation modal.
- [x] Browser reload persistence via `stockPortfolioApp_v1`.
- [x] JSON backup export and import with strict schema verification.
- [x] Responsive layout across desktop, tablet, and mobile.
