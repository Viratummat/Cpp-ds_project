# Stock Portfolio Management System (C++ Win32 Desktop GUI & CLI)

A high-performance, polished, native **C++ Stock Portfolio Management System** featuring a modern **Native Windows Desktop GUI (Win32 API)** and an interactive **Terminal / Console interface**, powered by classical Data Structures and Algorithms (**Array + Singly Linked List + Selection Sort**).

**Zero external dependencies:** Runs completely with the existing **MinGW GCC 6.3.0** compiler already installed on Windows. No Qt, no Python, no Node.js, and no external GUI frameworks are required.

---

## 📋 Architecture & Core Data Structures

The application maintains a strict separation of concerns between core DSA business logic (`Portfolio.h`, `Portfolio.cpp`), the native Windows GUI (`Win32App.cpp`), and the console interface (`main.cpp`).

### Core Data Structures
1. **User Array (`User users[MAX_USERS]`):**
   - Fixed-size array accommodating up to `100` registered investor profiles.
   - Linear search `findUser(string id)` for $O(n)$ unique ID lookup.
2. **Holdings Singly Linked List (`Investment* head`):**
   - Each `User` structure holds a head pointer to a dynamically allocated linked list of stock holdings (`Investment`).
   - Dynamic node allocation (`new Investment`) ensures optimal memory usage.
3. **Selection Sort Algorithm ($O(k^2)$):**
   - Custom implementations from scratch without library `std::sort()`:
     - `selectionSort(Investment* head, bool descending)`: Sorts a cloned copy of a user's stock holdings.
     - `selectionSortUsers(UserRankingItem items[], int count, bool descending)`: Sorts user accounts by total capital invested.
   - Supports both **Descending** (Highest to Lowest) and **Ascending** (Lowest to Highest) sorting directions.
   - **Non-mutating:** Deep copies the user's linked list before sorting, preserving the original portfolio sequence and preventing memory corruption.
4. **Weighted-Average Acquisition Price Merge:**
   - Repeated purchases of the same stock symbol are merged automatically:
     $$\text{New Quantity} = \text{Old Quantity} + \text{Additional Quantity}$$
     $$\text{New Total Invested} = \text{Old Total Invested} + (\text{Additional Quantity} \times \text{New Purchase Price})$$
     $$\text{New Average Price} = \frac{\text{New Total Invested}}{\text{New Quantity}}$$

---

## 🖥️ User Interfaces

### 1. Modern Native Windows Desktop Application (`portfolio_gui.exe`)
Built with standard **Win32 API** (`windows.h`, `commctrl.h`):
- **Obsidian Dark Fintech Theme:** Professional financial palette (`#0B0F19` background, `#161E31` card panels, `#7C3AED` purple accent, `#10B981` emerald green gains).
- **Sidebar Navigation:**
  - 📊 **Dashboard:** Stat cards (Total Capital Invested, Active Accounts, Stocks Monitored, Top Portfolio Holding) and dynamic Top Holdings table.
  - 👥 **Users:** User directory, Add User modal dialog, Edit User Name, Delete User (with linked-list deallocation and confirmation dialog), and live search filter.
  - 💼 **Portfolio:** Account dropdown selector, portfolio metrics, holdings table with Allocation (%), Add Investment dialog (with auto-uppercase tickers and weighted-average acquisition price merge), Edit, and Delete holding.
  - 🏆 **Selection Sort:** Dynamic ranking table with radio toggle for **Descending (Highest to Lowest)** and **Ascending (Lowest to Highest)**, view toggle between User Accounts and Individual Stock Holdings.
  - 🔍 **Search:** Instant User ID or Name lookup with dedicated card view and holdings summary.
  - 💾 **Data & Backup:** Persistence status, manual save/reload, file backup export, and restore with validation.
- **Fluid Resizing:** Adjusts layout automatically on window resize (`WM_SIZE`).
- **Clean Empty State:** Shows clean empty state if no saved data exists; never seeds fake or prefilled demo users.

### 2. Interactive Console Application (`portfolio.exe`)
- Complete ASCII-formatted interactive menu with tables, color indicators, and numeric option prompts.

---

## 🛠️ Build and Execution Guide

### 1. Build and Run via `build.bat` (Recommended)
Double-click or run `build.bat` in Command Prompt:
```cmd
build.bat
```
Select from the interactive menu:
- `[1]` Build Native Win32 GUI (`portfolio_gui.exe`) [DEFAULT]
- `[2]` Build Console Application (`portfolio.exe`)
- `[3]` Run Automated DSA Test Suite (`test_runner.exe`)
- `[4]` Build Everything (GUI + Console + Tests)
- `[5]` Build and Launch Win32 GUI Application

### 2. Build Directly via Command Line (MinGW GCC)
- **Compile Win32 GUI:**
  ```cmd
  g++ -std=c++11 -Wall -O2 Win32App.cpp Portfolio.cpp -mwindows -lcomctl32 -lcomdlg32 -lgdi32 -luser32 -o portfolio_gui.exe
  ```
- **Launch Win32 GUI:**
  ```cmd
  portfolio_gui.exe
  ```

- **Compile Console Version:**
  ```cmd
  g++ -std=c++11 -Wall -O2 main.cpp Portfolio.cpp -o portfolio.exe
  ```
- **Launch Console Version:**
  ```cmd
  portfolio.exe
  ```

- **Compile and Run Automated Tests:**
  ```cmd
  g++ -std=c++11 -Wall -O2 test_portfolio.cpp Portfolio.cpp -o test_runner.exe
  test_runner.exe
  ```

### 3. Build & Run in Visual Studio Code
- **Build GUI:** Press `Ctrl + Shift + B` and choose **"Build Win32 GUI Application"** (set as default).
- **Run GUI:** Press `Ctrl + F5` or run task **"Run Win32 GUI Application"**.
- **Debug:** Press `F5` using the configuration **"Debug Win32 GUI Application"**.
- **Console Version:** Run task **"Build Portfolio (Pure C++ CLI)"** and **"Run Portfolio (CLI)"**.

---

## 📁 Source File Breakdown

| File | Description |
| :--- | :--- |
| `Win32App.cpp` | Complete native Windows GUI implementation using Win32 API and Common Controls. |
| `Portfolio.h` | Header file defining `Investment`, `User`, constants (`MAX_USERS`), and core DSA API functions. |
| `Portfolio.cpp` | Pure C++ core implementation of linked lists, Selection Sort (Asc/Desc), calculations, validation, and file I/O. |
| `main.cpp` | Entrypoint for the interactive console menu application. |
| `test_portfolio.cpp`| Comprehensive test suite verifying all core DSA assertions. |
| `build.bat` | Universal Windows batch script checking compiler & environment. |
| `.vscode/tasks.json` | VS Code task definitions for Win32 GUI, Console, and Tests. |
| `.vscode/launch.json`| VS Code GDB debug configurations for Win32 GUI and Console CLI. |
| `portfolio_data.txt` | Persistent text file storing serialized user and portfolio records. |
| `MainWindow.h / .cpp`| (Preserved) Qt Widgets implementation for future reference if Qt is ever installed. |
