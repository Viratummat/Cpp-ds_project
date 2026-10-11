// ===============================================================================
// STOCK PORTFOLIO MANAGEMENT SYSTEM - NATIVE WIN32 DESKTOP GUI
// Pure C++ Native Windows Desktop Application (Zero external dependencies)
// Compatible with MinGW GCC 6.3.0 and all modern Windows versions
// ===============================================================================

#define _WIN32_WINNT 0x0600
#define _WIN32_IE 0x0600

#include <windows.h>
#include <commctrl.h>
#include <commdlg.h>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>
#include <cmath>
#include "Portfolio.h"

#ifndef LVS_EX_DOUBLEBUFFER
#define LVS_EX_DOUBLEBUFFER 0x00010000
#endif

// Window Dimensions & Constants
const int DEFAULT_WINDOW_WIDTH  = 1200;
const int DEFAULT_WINDOW_HEIGHT = 780;
const int SIDEBAR_WIDTH         = 220;

// Color Palette (Dark Obsidian Fintech Theme)
const COLORREF COLOR_BG_DARK        = RGB(11, 15, 25);    // Deep obsidian background
const COLORREF COLOR_SIDEBAR_BG     = RGB(15, 22, 38);    // Sidebar background
const COLORREF COLOR_CARD_BG        = RGB(22, 30, 49);    // Stat cards & dialog panels
const COLORREF COLOR_CARD_BORDER    = RGB(38, 50, 78);    // Subtle panel border
const COLORREF COLOR_ACCENT_PURPLE  = RGB(124, 58, 237);  // Primary purple accent
const COLORREF COLOR_ACCENT_HOVER   = RGB(139, 92, 246);  // Purple hover
const COLORREF COLOR_ACCENT_ACTIVE  = RGB(91, 33, 182);   // Active purple
const COLORREF COLOR_GREEN_GAIN     = RGB(16, 185, 129);  // Emerald green financial metric
const COLORREF COLOR_RED_LOSS       = RGB(239, 68, 68);   // Red indicator / delete
const COLORREF COLOR_TEXT_LIGHT     = RGB(241, 245, 249); // Primary text
const COLORREF COLOR_TEXT_MUTED     = RGB(148, 163, 184); // Secondary text
const COLORREF COLOR_INPUT_BG       = RGB(30, 41, 66);    // Text input background
const COLORREF COLOR_INPUT_BORDER   = RGB(55, 65, 81);    // Input border

// Navigation Pages
enum NavigationPage
{
    PAGE_DASHBOARD = 0,
    PAGE_USERS     = 1,
    PAGE_PORTFOLIO = 2,
    PAGE_RANKINGS  = 3,
    PAGE_SEARCH    = 4,
    PAGE_DATA      = 5,
    PAGE_COUNT     = 6
};

// Control Identifiers
enum ControlIDs
{
    ID_NAV_DASHBOARD = 1001,
    ID_NAV_USERS,
    ID_NAV_PORTFOLIO,
    ID_NAV_RANKINGS,
    ID_NAV_SEARCH,
    ID_NAV_DATA,

    // Dashboard Actions
    ID_BTN_DASH_ADD_USER = 1101,
    ID_BTN_DASH_ADD_INVESTMENT,
    ID_BTN_DASH_SAVE,

    // Users Page
    ID_BTN_USER_ADD = 1201,
    ID_BTN_USER_EDIT,
    ID_BTN_USER_DELETE,
    ID_EDIT_USER_FILTER,
    ID_LIST_USERS,

    // Portfolio Page
    ID_COMBO_PORTFOLIO_USER = 1301,
    ID_BTN_PORTFOLIO_ADD_STOCK,
    ID_BTN_PORTFOLIO_EDIT_STOCK,
    ID_BTN_PORTFOLIO_DEL_STOCK,
    ID_LIST_PORTFOLIO_HOLDINGS,

    // Rankings Page
    ID_COMBO_RANKINGS_TYPE = 1401,
    ID_BTN_RANKING_DIR_DESC,
    ID_BTN_RANKING_DIR_ASC,
    ID_COMBO_RANKINGS_USER,
    ID_LIST_RANKINGS,

    // Search Page
    ID_EDIT_SEARCH_QUERY = 1501,
    ID_BTN_SEARCH_EXECUTE,
    ID_LIST_SEARCH_RESULTS,

    // Data Page
    ID_BTN_DATA_SAVE = 1601,
    ID_BTN_DATA_RELOAD,
    ID_BTN_DATA_EXPORT,
    ID_BTN_DATA_RESTORE
};

// ===============================================================================
// GLOBAL APPLICATION STATE
// ===============================================================================
HINSTANCE   g_hInstance = NULL;
HWND        g_hWndMain = NULL;
HFONT       g_hFontTitle = NULL;
HFONT       g_hFontHeader = NULL;
HFONT       g_hFontBody = NULL;
HFONT       g_hFontBodyBold = NULL;
HFONT       g_hFontSmall = NULL;

HBRUSH      g_hBrushBgDark = NULL;
HBRUSH      g_hBrushSidebarBg = NULL;
HBRUSH      g_hBrushCardBg = NULL;
HBRUSH      g_hBrushInputBg = NULL;
HBRUSH      g_hBrushAccent = NULL;

NavigationPage g_currentPage = PAGE_DASHBOARD;
bool        g_rankingDescending = true;
bool        g_rankUsersMode = true; // true = rank users, false = rank single user's holdings
int         g_selectedPortfolioUserIndex = -1;
int         g_selectedRankingUserIndex = -1;
std::string g_userSearchFilter = "";

// Page Containers / Control Handles
HWND g_hBtnNav[PAGE_COUNT];

// Dashboard controls
HWND g_hListDashTopHoldings = NULL;
HWND g_hBtnDashAddUser = NULL;
HWND g_hBtnDashAddInvest = NULL;
HWND g_hBtnDashSave = NULL;

// Users controls
HWND g_hEditUserFilter = NULL;
HWND g_hBtnUserAdd = NULL;
HWND g_hBtnUserEdit = NULL;
HWND g_hBtnUserDelete = NULL;
HWND g_hListUsers = NULL;

// Portfolio controls
HWND g_hComboPortfolioUser = NULL;
HWND g_hBtnPortfolioAddStock = NULL;
HWND g_hBtnPortfolioEditStock = NULL;
HWND g_hBtnPortfolioDelStock = NULL;
HWND g_hListPortfolioHoldings = NULL;

// Rankings controls
HWND g_hComboRankType = NULL;
HWND g_hComboRankUser = NULL;
HWND g_hBtnRankDesc = NULL;
HWND g_hBtnRankAsc = NULL;
HWND g_hListRankings = NULL;

// Search controls
HWND g_hEditSearchQuery = NULL;
HWND g_hBtnSearchExec = NULL;
HWND g_hListSearchResults = NULL;

// Data controls
HWND g_hBtnDataSave = NULL;
HWND g_hBtnDataReload = NULL;
HWND g_hBtnDataExport = NULL;
HWND g_hBtnDataRestore = NULL;

// Status Text
std::string g_statusMessage = "Ready";

// Forward Declarations
LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);
LRESULT CALLBACK ModalDlgWndProc(HWND, UINT, WPARAM, LPARAM);
void InitFontsAndBrushes();
void CleanupFontsAndBrushes();
void CreateControls(HWND hWnd);
void LayoutControls(int width, int height);
void SwitchPage(NavigationPage page);
void RefreshAllViews();
void RefreshDashboardView();
void RefreshUsersView();
void RefreshPortfolioView();
void RefreshRankingsView();
void RefreshSearchResults(const std::string& query);
void RefreshDataView();
void PopulateUserDropdowns();
void CenterWindow(HWND hWnd, HWND hParent);

// Modal Dialogs
void ShowAddUserDialog(HWND hParent);
void ShowEditUserDialog(HWND hParent);
void ShowAddInvestmentDialog(HWND hParent);
void ShowEditInvestmentDialog(HWND hParent);

// Modal Dialog Context Structure
struct ModalDlgContext
{
    bool completed;
    bool submitted;
    HWND hDlg;
};

// Helper Utilities
std::string FormatRs(double amount)
{
    std::ostringstream ss;
    ss << "Rs. " << std::fixed << std::setprecision(2) << amount;
    return ss.str();
}

std::string GetInputText(HWND hEdit)
{
    char buf[512] = {0};
    GetWindowTextA(hEdit, buf, sizeof(buf) - 1);
    return std::string(buf);
}

void SetStatus(const std::string& msg)
{
    g_statusMessage = msg;
    if (g_hWndMain)
    {
        RECT rcStatus = { SIDEBAR_WIDTH + 25, 20, 850, 50 };
        InvalidateRect(g_hWndMain, &rcStatus, TRUE);
    }
}

void CenterWindow(HWND hWnd, HWND hParent)
{
    RECT rcParent;
    if (hParent && IsWindow(hParent))
        GetWindowRect(hParent, &rcParent);
    else
    {
        rcParent.left = 0;
        rcParent.top = 0;
        rcParent.right = GetSystemMetrics(SM_CXSCREEN);
        rcParent.bottom = GetSystemMetrics(SM_CYSCREEN);
    }

    RECT rcDlg;
    GetWindowRect(hWnd, &rcDlg);
    int dlgW = rcDlg.right - rcDlg.left;
    int dlgH = rcDlg.bottom - rcDlg.top;

    int x = rcParent.left + ((rcParent.right - rcParent.left) - dlgW) / 2;
    int y = rcParent.top + ((rcParent.bottom - rcParent.top) - dlgH) / 2;
    if (x < 10) x = 10;
    if (y < 10) y = 10;

    SetWindowPos(hWnd, NULL, x, y, 0, 0, SWP_NOZORDER | SWP_NOSIZE);
}

// ===============================================================================
// WINMAIN ENTRYPOINT
// ===============================================================================
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow)
{
    g_hInstance = hInstance;

    // Initialize Common Controls
    INITCOMMONCONTROLSEX icex;
    icex.dwSize = sizeof(INITCOMMONCONTROLSEX);
    icex.dwICC = ICC_LISTVIEW_CLASSES | ICC_STANDARD_CLASSES | ICC_USEREX_CLASSES;
    InitCommonControlsEx(&icex);

    // Initialize Fonts and Brushes
    InitFontsAndBrushes();

    // Auto-load saved portfolio data at startup
    loadFromFile(DEFAULT_DATA_FILE);

    // Register Main Window Class
    WNDCLASSEXA wc = {0};
    wc.cbSize        = sizeof(WNDCLASSEXA);
    wc.style         = CS_HREDRAW | CS_VREDRAW;
    wc.lpfnWndProc   = WndProc;
    wc.hInstance     = hInstance;
    wc.hCursor       = LoadCursor(NULL, IDC_ARROW);
    wc.hbrBackground = g_hBrushBgDark;
    wc.lpszClassName = "StockPortfolioMainWinClass";
    wc.hIcon         = LoadIcon(NULL, IDI_APPLICATION);
    wc.hIconSm       = LoadIcon(NULL, IDI_APPLICATION);

    if (!RegisterClassExA(&wc))
    {
        MessageBoxA(NULL, "Main Window Registration Failed!", "Fatal Error", MB_ICONEXCLAMATION | MB_OK);
        return 0;
    }

    // Register Dedicated Modal Dialog Window Class
    WNDCLASSEXA dlgWc = {0};
    dlgWc.cbSize        = sizeof(WNDCLASSEXA);
    dlgWc.style         = CS_HREDRAW | CS_VREDRAW;
    dlgWc.lpfnWndProc   = ModalDlgWndProc;
    dlgWc.hInstance     = hInstance;
    dlgWc.hCursor       = LoadCursor(NULL, IDC_ARROW);
    dlgWc.hbrBackground = g_hBrushCardBg;
    dlgWc.lpszClassName = "PortfolioModalDlgClass";
    dlgWc.hIcon         = LoadIcon(NULL, IDI_APPLICATION);
    dlgWc.hIconSm       = LoadIcon(NULL, IDI_APPLICATION);

    if (!RegisterClassExA(&dlgWc))
    {
        MessageBoxA(NULL, "Dialog Window Registration Failed!", "Fatal Error", MB_ICONEXCLAMATION | MB_OK);
        return 0;
    }

    // Center main window on screen
    int screenW = GetSystemMetrics(SM_CXSCREEN);
    int screenH = GetSystemMetrics(SM_CYSCREEN);
    int posX = (screenW - DEFAULT_WINDOW_WIDTH) / 2;
    int posY = (screenH - DEFAULT_WINDOW_HEIGHT) / 2;
    if (posX < 0) posX = 40;
    if (posY < 0) posY = 20;

    g_hWndMain = CreateWindowExA(
        WS_EX_CLIENTEDGE,
        "StockPortfolioMainWinClass",
        "Stock Portfolio Management System (Win32 Native)",
        WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN,
        posX, posY,
        DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT,
        NULL, NULL, hInstance, NULL
    );

    if (!g_hWndMain)
    {
        MessageBoxA(NULL, "Window Creation Failed!", "Fatal Error", MB_ICONEXCLAMATION | MB_OK);
        return 0;
    }

    ShowWindow(g_hWndMain, nCmdShow);
    UpdateWindow(g_hWndMain);

    // Initial View Population
    RefreshAllViews();

    // Main Message Loop
    MSG msg;
    while (GetMessageA(&msg, NULL, 0, 0))
    {
        TranslateMessage(&msg);
        DispatchMessageA(&msg);
    }

    // Save state before exit and clean up
    saveToFile(DEFAULT_DATA_FILE);
    cleanupAllMemory();
    CleanupFontsAndBrushes();

    return (int)msg.wParam;
}

// ===============================================================================
// RESOURCE INITIALIZATION & CLEANUP
// ===============================================================================
void InitFontsAndBrushes()
{
    g_hFontTitle     = CreateFontA(24, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE, ANSI_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, DEFAULT_QUALITY, DEFAULT_PITCH | FF_DONTCARE, "Segoe UI");
    g_hFontHeader    = CreateFontA(18, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE, ANSI_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, DEFAULT_QUALITY, DEFAULT_PITCH | FF_DONTCARE, "Segoe UI");
    g_hFontBody      = CreateFontA(15, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE, ANSI_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, DEFAULT_QUALITY, DEFAULT_PITCH | FF_DONTCARE, "Segoe UI");
    g_hFontBodyBold  = CreateFontA(15, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE, ANSI_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, DEFAULT_QUALITY, DEFAULT_PITCH | FF_DONTCARE, "Segoe UI");
    g_hFontSmall     = CreateFontA(13, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE, ANSI_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, DEFAULT_QUALITY, DEFAULT_PITCH | FF_DONTCARE, "Segoe UI");

    g_hBrushBgDark    = CreateSolidBrush(COLOR_BG_DARK);
    g_hBrushSidebarBg = CreateSolidBrush(COLOR_SIDEBAR_BG);
    g_hBrushCardBg    = CreateSolidBrush(COLOR_CARD_BG);
    g_hBrushInputBg   = CreateSolidBrush(COLOR_INPUT_BG);
    g_hBrushAccent    = CreateSolidBrush(COLOR_ACCENT_PURPLE);
}

void CleanupFontsAndBrushes()
{
    if (g_hFontTitle)     DeleteObject(g_hFontTitle);
    if (g_hFontHeader)    DeleteObject(g_hFontHeader);
    if (g_hFontBody)      DeleteObject(g_hFontBody);
    if (g_hFontBodyBold)  DeleteObject(g_hFontBodyBold);
    if (g_hFontSmall)     DeleteObject(g_hFontSmall);

    if (g_hBrushBgDark)    DeleteObject(g_hBrushBgDark);
    if (g_hBrushSidebarBg) DeleteObject(g_hBrushSidebarBg);
    if (g_hBrushCardBg)    DeleteObject(g_hBrushCardBg);
    if (g_hBrushInputBg)   DeleteObject(g_hBrushInputBg);
    if (g_hBrushAccent)    DeleteObject(g_hBrushAccent);
}

// ===============================================================================
// LISTVIEW HELPER FUNCTIONS
// ===============================================================================
HWND CreateModernListView(HWND hParent, int id, int x, int y, int w, int h)
{
    HWND hList = CreateWindowExA(
        0, WC_LISTVIEWA, "",
        WS_CHILD | WS_VISIBLE | WS_BORDER | WS_TABSTOP | LVS_REPORT | LVS_SINGLESEL | LVS_SHOWSELALWAYS,
        x, y, w, h,
        hParent, (HMENU)(INT_PTR)id, g_hInstance, NULL
    );

    ListView_SetExtendedListViewStyle(hList, LVS_EX_FULLROWSELECT | LVS_EX_GRIDLINES | LVS_EX_DOUBLEBUFFER);
    SendMessageA(hList, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);
    return hList;
}

void AddListViewColumn(HWND hList, int colIndex, const char* title, int width)
{
    LVCOLUMNA lvc = {0};
    lvc.mask = LVCF_TEXT | LVCF_WIDTH | LVCF_SUBITEM;
    lvc.pszText = (LPSTR)title;
    lvc.cx = width;
    lvc.iSubItem = colIndex;
    ListView_InsertColumn(hList, colIndex, &lvc);
}

void SetListViewItemText(HWND hList, int rowIndex, int colIndex, const std::string& text)
{
    if (colIndex == 0)
    {
        LVITEMA lvi = {0};
        lvi.mask = LVIF_TEXT;
        lvi.iItem = rowIndex;
        lvi.iSubItem = 0;
        lvi.pszText = (LPSTR)text.c_str();
        ListView_InsertItem(hList, &lvi);
    }
    else
    {
        ListView_SetItemText(hList, rowIndex, colIndex, (LPSTR)text.c_str());
    }
}

// ===============================================================================
// CREATE & POSITION MAIN WINDOW CONTROLS
// ===============================================================================
void CreateControls(HWND hWnd)
{
    // Sidebar Navigation Buttons
    const char* navTitles[PAGE_COUNT] = {
        "  Dashboard",
        "  Users",
        "  Portfolio",
        "  Selection Sort",
        "  Search",
        "  Data & Backup"
    };

    for (int i = 0; i < PAGE_COUNT; ++i)
    {
        g_hBtnNav[i] = CreateWindowExA(
            0, "BUTTON", navTitles[i],
            WS_CHILD | WS_VISIBLE | BS_OWNERDRAW,
            12, 95 + i * 48, SIDEBAR_WIDTH - 24, 40,
            hWnd, (HMENU)(INT_PTR)(ID_NAV_DASHBOARD + i), g_hInstance, NULL
        );
        SendMessageA(g_hBtnNav[i], WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);
    }

    int contentX = SIDEBAR_WIDTH + 30; // 250

    // -------------------------------------------------------------
    // Dashboard Controls
    // -------------------------------------------------------------
    g_hBtnDashAddUser = CreateWindowExA(
        0, "BUTTON", "+ Add User",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | BS_PUSHBUTTON,
        contentX, 175, 130, 36,
        hWnd, (HMENU)ID_BTN_DASH_ADD_USER, g_hInstance, NULL
    );
    SendMessageA(g_hBtnDashAddUser, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    g_hBtnDashAddInvest = CreateWindowExA(
        0, "BUTTON", "+ Add Holding",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | BS_PUSHBUTTON,
        contentX + 145, 175, 145, 36,
        hWnd, (HMENU)ID_BTN_DASH_ADD_INVESTMENT, g_hInstance, NULL
    );
    SendMessageA(g_hBtnDashAddInvest, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    g_hBtnDashSave = CreateWindowExA(
        0, "BUTTON", "Save Data",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | BS_PUSHBUTTON,
        contentX + 305, 175, 125, 36,
        hWnd, (HMENU)ID_BTN_DASH_SAVE, g_hInstance, NULL
    );
    SendMessageA(g_hBtnDashSave, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);

    g_hListDashTopHoldings = CreateModernListView(hWnd, 2001, contentX, 260, 880, 420);
    AddListViewColumn(g_hListDashTopHoldings, 0, "Rank", 60);
    AddListViewColumn(g_hListDashTopHoldings, 1, "User ID", 110);
    AddListViewColumn(g_hListDashTopHoldings, 2, "Investor Name", 190);
    AddListViewColumn(g_hListDashTopHoldings, 3, "Stock Symbol", 140);
    AddListViewColumn(g_hListDashTopHoldings, 4, "Quantity", 110);
    AddListViewColumn(g_hListDashTopHoldings, 5, "Avg Price", 130);
    AddListViewColumn(g_hListDashTopHoldings, 6, "Total Invested", 140);

    // -------------------------------------------------------------
    // Users Page Controls
    // -------------------------------------------------------------
    g_hEditUserFilter = CreateWindowExA(
        WS_EX_CLIENTEDGE, "EDIT", "",
        WS_CHILD | WS_TABSTOP | ES_AUTOHSCROLL,
        contentX, 80, 260, 36,
        hWnd, (HMENU)ID_EDIT_USER_FILTER, g_hInstance, NULL
    );
    SendMessageA(g_hEditUserFilter, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);
    SendMessageW(g_hEditUserFilter, 0x1501, FALSE, (LPARAM)L"Search by ID or Name...");

    g_hBtnUserAdd = CreateWindowExA(
        0, "BUTTON", "+ Add New User",
        WS_CHILD | WS_TABSTOP | BS_PUSHBUTTON,
        contentX + 275, 80, 150, 36,
        hWnd, (HMENU)ID_BTN_USER_ADD, g_hInstance, NULL
    );
    SendMessageA(g_hBtnUserAdd, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    g_hBtnUserEdit = CreateWindowExA(
        0, "BUTTON", "Edit Name",
        WS_CHILD | WS_TABSTOP | BS_PUSHBUTTON,
        contentX + 440, 80, 120, 36,
        hWnd, (HMENU)ID_BTN_USER_EDIT, g_hInstance, NULL
    );
    SendMessageA(g_hBtnUserEdit, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);

    g_hBtnUserDelete = CreateWindowExA(
        0, "BUTTON", "Delete User",
        WS_CHILD | WS_TABSTOP | BS_PUSHBUTTON,
        contentX + 575, 80, 120, 36,
        hWnd, (HMENU)ID_BTN_USER_DELETE, g_hInstance, NULL
    );
    SendMessageA(g_hBtnUserDelete, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);

    g_hListUsers = CreateModernListView(hWnd, ID_LIST_USERS, contentX, 135, 880, 550);
    AddListViewColumn(g_hListUsers, 0, "#", 50);
    AddListViewColumn(g_hListUsers, 1, "User ID", 150);
    AddListViewColumn(g_hListUsers, 2, "Full Name", 260);
    AddListViewColumn(g_hListUsers, 3, "Holdings Count", 150);
    AddListViewColumn(g_hListUsers, 4, "Total Invested", 200);

    // -------------------------------------------------------------
    // Portfolio Page Controls
    // -------------------------------------------------------------
    g_hComboPortfolioUser = CreateWindowExA(
        0, "COMBOBOX", "",
        WS_CHILD | WS_TABSTOP | CBS_DROPDOWNLIST | WS_VSCROLL,
        contentX, 65, 340, 260,
        hWnd, (HMENU)ID_COMBO_PORTFOLIO_USER, g_hInstance, NULL
    );
    SendMessageA(g_hComboPortfolioUser, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);

    g_hBtnPortfolioAddStock = CreateWindowExA(
        0, "BUTTON", "+ Add Holding",
        WS_CHILD | WS_TABSTOP | BS_PUSHBUTTON,
        contentX + 355, 65, 140, 36,
        hWnd, (HMENU)ID_BTN_PORTFOLIO_ADD_STOCK, g_hInstance, NULL
    );
    SendMessageA(g_hBtnPortfolioAddStock, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    g_hBtnPortfolioEditStock = CreateWindowExA(
        0, "BUTTON", "Edit Holding",
        WS_CHILD | WS_TABSTOP | BS_PUSHBUTTON,
        contentX + 510, 65, 130, 36,
        hWnd, (HMENU)ID_BTN_PORTFOLIO_EDIT_STOCK, g_hInstance, NULL
    );
    SendMessageA(g_hBtnPortfolioEditStock, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);

    g_hBtnPortfolioDelStock = CreateWindowExA(
        0, "BUTTON", "Delete Holding",
        WS_CHILD | WS_TABSTOP | BS_PUSHBUTTON,
        contentX + 655, 65, 130, 36,
        hWnd, (HMENU)ID_BTN_PORTFOLIO_DEL_STOCK, g_hInstance, NULL
    );
    SendMessageA(g_hBtnPortfolioDelStock, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);

    g_hListPortfolioHoldings = CreateModernListView(hWnd, ID_LIST_PORTFOLIO_HOLDINGS, contentX, 210, 880, 480);
    AddListViewColumn(g_hListPortfolioHoldings, 0, "Stock Symbol", 160);
    AddListViewColumn(g_hListPortfolioHoldings, 1, "Shares Held", 130);
    AddListViewColumn(g_hListPortfolioHoldings, 2, "Avg Purchase Price", 180);
    AddListViewColumn(g_hListPortfolioHoldings, 3, "Total Invested", 190);
    AddListViewColumn(g_hListPortfolioHoldings, 4, "Portfolio Allocation", 160);

    // -------------------------------------------------------------
    // Rankings Page Controls
    // -------------------------------------------------------------
    g_hComboRankType = CreateWindowExA(
        0, "COMBOBOX", "",
        WS_CHILD | WS_TABSTOP | CBS_DROPDOWNLIST,
        contentX, 75, 240, 180,
        hWnd, (HMENU)ID_COMBO_RANKINGS_TYPE, g_hInstance, NULL
    );
    SendMessageA(g_hComboRankType, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);
    SendMessageA(g_hComboRankType, CB_ADDSTRING, 0, (LPARAM)"Rank Users by Total Invested");
    SendMessageA(g_hComboRankType, CB_ADDSTRING, 0, (LPARAM)"Rank Holdings of Selected User");
    SendMessageA(g_hComboRankType, CB_SETCURSEL, 0, 0);

    g_hComboRankUser = CreateWindowExA(
        0, "COMBOBOX", "",
        WS_CHILD | WS_TABSTOP | CBS_DROPDOWNLIST | WS_VSCROLL,
        contentX + 250, 75, 230, 200,
        hWnd, (HMENU)ID_COMBO_RANKINGS_USER, g_hInstance, NULL
    );
    SendMessageA(g_hComboRankUser, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);

    g_hBtnRankDesc = CreateWindowExA(
        0, "BUTTON", "Descending (Highest to Lowest)",
        WS_CHILD | WS_TABSTOP | BS_AUTORADIOBUTTON,
        contentX + 495, 78, 220, 28,
        hWnd, (HMENU)ID_BTN_RANKING_DIR_DESC, g_hInstance, NULL
    );
    SendMessageA(g_hBtnRankDesc, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);
    SendMessageA(g_hBtnRankDesc, BM_SETCHECK, BST_CHECKED, 0);

    g_hBtnRankAsc = CreateWindowExA(
        0, "BUTTON", "Ascending (Lowest to Highest)",
        WS_CHILD | WS_TABSTOP | BS_AUTORADIOBUTTON,
        contentX + 725, 78, 220, 28,
        hWnd, (HMENU)ID_BTN_RANKING_DIR_ASC, g_hInstance, NULL
    );
    SendMessageA(g_hBtnRankAsc, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    g_hListRankings = CreateModernListView(hWnd, ID_LIST_RANKINGS, contentX, 205, 880, 480);

    // -------------------------------------------------------------
    // Search Page Controls
    // -------------------------------------------------------------
    g_hEditSearchQuery = CreateWindowExA(
        WS_EX_CLIENTEDGE, "EDIT", "",
        WS_CHILD | WS_TABSTOP | ES_AUTOHSCROLL,
        contentX, 78, 340, 36,
        hWnd, (HMENU)ID_EDIT_SEARCH_QUERY, g_hInstance, NULL
    );
    SendMessageA(g_hEditSearchQuery, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);
    SendMessageW(g_hEditSearchQuery, 0x1501, FALSE, (LPARAM)L"Enter User ID or Name...");

    g_hBtnSearchExec = CreateWindowExA(
        0, "BUTTON", "Search User",
        WS_CHILD | WS_TABSTOP | BS_PUSHBUTTON,
        contentX + 355, 78, 130, 36,
        hWnd, (HMENU)ID_BTN_SEARCH_EXECUTE, g_hInstance, NULL
    );
    SendMessageA(g_hBtnSearchExec, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    g_hListSearchResults = CreateModernListView(hWnd, ID_LIST_SEARCH_RESULTS, contentX, 210, 880, 475);
    AddListViewColumn(g_hListSearchResults, 0, "Stock Symbol", 160);
    AddListViewColumn(g_hListSearchResults, 1, "Shares Held", 130);
    AddListViewColumn(g_hListSearchResults, 2, "Avg Purchase Price", 180);
    AddListViewColumn(g_hListSearchResults, 3, "Total Invested", 190);
    AddListViewColumn(g_hListSearchResults, 4, "Allocation (%)", 160);

    // -------------------------------------------------------------
    // Data & Backup Page Controls (Positioned cleanly INSIDE their panels)
    // -------------------------------------------------------------
    g_hBtnDataSave = CreateWindowExA(
        0, "BUTTON", "Save Current Data",
        WS_CHILD | WS_TABSTOP | BS_PUSHBUTTON,
        contentX + 25, 195, 180, 38,
        hWnd, (HMENU)ID_BTN_DATA_SAVE, g_hInstance, NULL
    );
    SendMessageA(g_hBtnDataSave, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    g_hBtnDataReload = CreateWindowExA(
        0, "BUTTON", "Reload from Disk",
        WS_CHILD | WS_TABSTOP | BS_PUSHBUTTON,
        contentX + 220, 195, 180, 38,
        hWnd, (HMENU)ID_BTN_DATA_RELOAD, g_hInstance, NULL
    );
    SendMessageA(g_hBtnDataReload, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);

    g_hBtnDataExport = CreateWindowExA(
        0, "BUTTON", "Export Backup File...",
        WS_CHILD | WS_TABSTOP | BS_PUSHBUTTON,
        contentX + 25, 395, 200, 38,
        hWnd, (HMENU)ID_BTN_DATA_EXPORT, g_hInstance, NULL
    );
    SendMessageA(g_hBtnDataExport, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    g_hBtnDataRestore = CreateWindowExA(
        0, "BUTTON", "Restore from Backup...",
        WS_CHILD | WS_TABSTOP | BS_PUSHBUTTON,
        contentX + 240, 395, 200, 38,
        hWnd, (HMENU)ID_BTN_DATA_RESTORE, g_hInstance, NULL
    );
    SendMessageA(g_hBtnDataRestore, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);

    // Initial page activation
    SwitchPage(PAGE_DASHBOARD);
}

// ===============================================================================
// RESPONSIVE LAYOUT ENGINE (WM_SIZE)
// ===============================================================================
void LayoutControls(int width, int height)
{
    int contentX = SIDEBAR_WIDTH + 30; // 250
    int contentW = width - contentX - 25;
    if (contentW < 500) contentW = 500;

    // Fluid resize for tables
    if (g_hListDashTopHoldings)
    {
        SetWindowPos(g_hListDashTopHoldings, NULL, contentX, 260, contentW, height - 285, SWP_NOZORDER);
    }
    if (g_hListUsers)
    {
        SetWindowPos(g_hListUsers, NULL, contentX, 135, contentW, height - 165, SWP_NOZORDER);
    }
    if (g_hListPortfolioHoldings)
    {
        SetWindowPos(g_hListPortfolioHoldings, NULL, contentX, 210, contentW, height - 240, SWP_NOZORDER);
    }
    if (g_hListRankings)
    {
        SetWindowPos(g_hListRankings, NULL, contentX, 205, contentW, height - 235, SWP_NOZORDER);
    }
    if (g_hListSearchResults)
    {
        SetWindowPos(g_hListSearchResults, NULL, contentX, 210, contentW, height - 240, SWP_NOZORDER);
    }
}

// ===============================================================================
// PAGE SWITCHING & VISIBILITY MANAGEMENT
// ===============================================================================
void SwitchPage(NavigationPage page)
{
    g_currentPage = page;

    auto ShowCtrl = [](HWND hCtrl, bool show) {
        if (hCtrl) ShowWindow(hCtrl, show ? SW_SHOW : SW_HIDE);
    };

    // Dashboard controls
    ShowCtrl(g_hBtnDashAddUser,      page == PAGE_DASHBOARD);
    ShowCtrl(g_hBtnDashAddInvest,    page == PAGE_DASHBOARD);
    ShowCtrl(g_hBtnDashSave,         page == PAGE_DASHBOARD);
    ShowCtrl(g_hListDashTopHoldings, page == PAGE_DASHBOARD);

    // Users controls
    ShowCtrl(g_hEditUserFilter, page == PAGE_USERS);
    ShowCtrl(g_hBtnUserAdd,     page == PAGE_USERS);
    ShowCtrl(g_hBtnUserEdit,    page == PAGE_USERS);
    ShowCtrl(g_hBtnUserDelete,  page == PAGE_USERS);
    ShowCtrl(g_hListUsers,      page == PAGE_USERS);

    // Portfolio controls
    ShowCtrl(g_hComboPortfolioUser,    page == PAGE_PORTFOLIO);
    ShowCtrl(g_hBtnPortfolioAddStock,  page == PAGE_PORTFOLIO);
    ShowCtrl(g_hBtnPortfolioEditStock, page == PAGE_PORTFOLIO);
    ShowCtrl(g_hBtnPortfolioDelStock,  page == PAGE_PORTFOLIO);
    ShowCtrl(g_hListPortfolioHoldings, page == PAGE_PORTFOLIO);

    // Rankings controls
    ShowCtrl(g_hComboRankType, page == PAGE_RANKINGS);
    ShowCtrl(g_hComboRankUser, page == PAGE_RANKINGS && !g_rankUsersMode);
    ShowCtrl(g_hBtnRankDesc,   page == PAGE_RANKINGS);
    ShowCtrl(g_hBtnRankAsc,    page == PAGE_RANKINGS);
    ShowCtrl(g_hListRankings,  page == PAGE_RANKINGS);

    // Search controls
    ShowCtrl(g_hEditSearchQuery,   page == PAGE_SEARCH);
    ShowCtrl(g_hBtnSearchExec,     page == PAGE_SEARCH);
    ShowCtrl(g_hListSearchResults, page == PAGE_SEARCH);

    // Data controls
    ShowCtrl(g_hBtnDataSave,    page == PAGE_DATA);
    ShowCtrl(g_hBtnDataReload,  page == PAGE_DATA);
    ShowCtrl(g_hBtnDataExport,  page == PAGE_DATA);
    ShowCtrl(g_hBtnDataRestore, page == PAGE_DATA);

    // Redraw entire window
    InvalidateRect(g_hWndMain, NULL, TRUE);
    UpdateWindow(g_hWndMain);

    // Populate data for active page
    switch (page)
    {
    case PAGE_DASHBOARD: RefreshDashboardView(); break;
    case PAGE_USERS:     RefreshUsersView(); break;
    case PAGE_PORTFOLIO: RefreshPortfolioView(); break;
    case PAGE_RANKINGS:  RefreshRankingsView(); break;
    case PAGE_SEARCH:    break;
    case PAGE_DATA:      RefreshDataView(); break;
    default: break;
    }
}

// ===============================================================================
// DATA SYNCHRONIZATION & VIEW REFRESH
// ===============================================================================
void PopulateUserDropdowns()
{
    SendMessageA(g_hComboPortfolioUser, CB_RESETCONTENT, 0, 0);
    SendMessageA(g_hComboRankUser, CB_RESETCONTENT, 0, 0);

    for (int i = 0; i < userCount; ++i)
    {
        double uTotal = calculateTotal(users[i]);
        std::string label = "[" + users[i].userID + "] " + users[i].name + " (" + FormatRs(uTotal) + ")";
        SendMessageA(g_hComboPortfolioUser, CB_ADDSTRING, 0, (LPARAM)label.c_str());
        SendMessageA(g_hComboRankUser, CB_ADDSTRING, 0, (LPARAM)label.c_str());
    }

    if (userCount > 0)
    {
        if (g_selectedPortfolioUserIndex < 0 || g_selectedPortfolioUserIndex >= userCount)
            g_selectedPortfolioUserIndex = 0;
        if (g_selectedRankingUserIndex < 0 || g_selectedRankingUserIndex >= userCount)
            g_selectedRankingUserIndex = 0;

        SendMessageA(g_hComboPortfolioUser, CB_SETCURSEL, g_selectedPortfolioUserIndex, 0);
        SendMessageA(g_hComboRankUser, CB_SETCURSEL, g_selectedRankingUserIndex, 0);
    }
    else
    {
        g_selectedPortfolioUserIndex = -1;
        g_selectedRankingUserIndex = -1;
    }
}

void RefreshAllViews()
{
    PopulateUserDropdowns();
    RefreshDashboardView();
    RefreshUsersView();
    RefreshPortfolioView();
    RefreshRankingsView();
    InvalidateRect(g_hWndMain, NULL, TRUE);
}

void RefreshDashboardView()
{
    ListView_DeleteAllItems(g_hListDashTopHoldings);

    if (userCount == 0) return;

    struct DashHolding
    {
        std::string userId;
        std::string userName;
        std::string stock;
        int qty;
        double price;
        double total;
    };

    std::vector<DashHolding> allHoldings;
    for (int i = 0; i < userCount; ++i)
    {
        Investment* curr = users[i].head;
        while (curr != nullptr)
        {
            allHoldings.push_back({ users[i].userID, users[i].name, curr->stockName, curr->quantity, curr->price, curr->totalInvested });
            curr = curr->next;
        }
    }

    // Sort descending by total investment using Selection Sort
    for (size_t i = 0; i + 1 < allHoldings.size(); ++i)
    {
        size_t maxIdx = i;
        for (size_t j = i + 1; j < allHoldings.size(); ++j)
        {
            if (allHoldings[j].total > allHoldings[maxIdx].total)
            {
                maxIdx = j;
            }
        }
        if (maxIdx != i)
        {
            std::swap(allHoldings[i], allHoldings[maxIdx]);
        }
    }

    // Populate top holdings
    int row = 0;
    for (size_t i = 0; i < allHoldings.size() && i < 15; ++i)
    {
        SetListViewItemText(g_hListDashTopHoldings, row, 0, std::to_string(row + 1));
        SetListViewItemText(g_hListDashTopHoldings, row, 1, allHoldings[i].userId);
        SetListViewItemText(g_hListDashTopHoldings, row, 2, allHoldings[i].userName);
        SetListViewItemText(g_hListDashTopHoldings, row, 3, allHoldings[i].stock);
        SetListViewItemText(g_hListDashTopHoldings, row, 4, std::to_string(allHoldings[i].qty));
        SetListViewItemText(g_hListDashTopHoldings, row, 5, FormatRs(allHoldings[i].price));
        SetListViewItemText(g_hListDashTopHoldings, row, 6, FormatRs(allHoldings[i].total));
        row++;
    }
}

void RefreshUsersView()
{
    ListView_DeleteAllItems(g_hListUsers);

    std::string filter = toUpperCase(g_userSearchFilter);
    int row = 0;

    for (int i = 0; i < userCount; ++i)
    {
        std::string uId = users[i].userID;
        std::string uName = users[i].name;

        if (!filter.empty())
        {
            if (toUpperCase(uId).find(filter) == std::string::npos &&
                toUpperCase(uName).find(filter) == std::string::npos)
            {
                continue;
            }
        }

        double uTotal = calculateTotal(users[i]);
        int uHoldings = countHoldings(users[i]);

        SetListViewItemText(g_hListUsers, row, 0, std::to_string(i + 1));
        SetListViewItemText(g_hListUsers, row, 1, uId);
        SetListViewItemText(g_hListUsers, row, 2, uName);
        SetListViewItemText(g_hListUsers, row, 3, std::to_string(uHoldings) + " stocks");
        SetListViewItemText(g_hListUsers, row, 4, FormatRs(uTotal));
        row++;
    }
}

void RefreshPortfolioView()
{
    ListView_DeleteAllItems(g_hListPortfolioHoldings);

    if (g_selectedPortfolioUserIndex < 0 || g_selectedPortfolioUserIndex >= userCount)
        return;

    User& user = users[g_selectedPortfolioUserIndex];
    double totalPortfolio = calculateTotal(user);

    int row = 0;
    Investment* curr = user.head;
    while (curr != nullptr)
    {
        double allocation = (totalPortfolio > 0.0) ? (curr->totalInvested / totalPortfolio) * 100.0 : 0.0;
        std::ostringstream allocSs;
        allocSs << std::fixed << std::setprecision(2) << allocation << "%";

        SetListViewItemText(g_hListPortfolioHoldings, row, 0, curr->stockName);
        SetListViewItemText(g_hListPortfolioHoldings, row, 1, std::to_string(curr->quantity));
        SetListViewItemText(g_hListPortfolioHoldings, row, 2, FormatRs(curr->price));
        SetListViewItemText(g_hListPortfolioHoldings, row, 3, FormatRs(curr->totalInvested));
        SetListViewItemText(g_hListPortfolioHoldings, row, 4, allocSs.str());

        row++;
        curr = curr->next;
    }
}

void RefreshRankingsView()
{
    ListView_DeleteAllItems(g_hListRankings);

    while (ListView_DeleteColumn(g_hListRankings, 0));

    if (g_rankUsersMode)
    {
        AddListViewColumn(g_hListRankings, 0, "Rank", 70);
        AddListViewColumn(g_hListRankings, 1, "User ID", 150);
        AddListViewColumn(g_hListRankings, 2, "Investor Name", 260);
        AddListViewColumn(g_hListRankings, 3, "Holdings Count", 150);
        AddListViewColumn(g_hListRankings, 4, "Total Capital Invested", 220);

        if (userCount == 0) return;

        UserRankingItem rankArr[MAX_USERS];
        for (int i = 0; i < userCount; ++i)
        {
            rankArr[i].userID = users[i].userID;
            rankArr[i].name = users[i].name;
            rankArr[i].totalInvested = calculateTotal(users[i]);
            rankArr[i].holdingsCount = countHoldings(users[i]);
        }

        selectionSortUsers(rankArr, userCount, g_rankingDescending);

        for (int i = 0; i < userCount; ++i)
        {
            SetListViewItemText(g_hListRankings, i, 0, std::to_string(i + 1));
            SetListViewItemText(g_hListRankings, i, 1, rankArr[i].userID);
            SetListViewItemText(g_hListRankings, i, 2, rankArr[i].name);
            SetListViewItemText(g_hListRankings, i, 3, std::to_string(rankArr[i].holdingsCount) + " stocks");
            SetListViewItemText(g_hListRankings, i, 4, FormatRs(rankArr[i].totalInvested));
        }
    }
    else
    {
        AddListViewColumn(g_hListRankings, 0, "Rank", 70);
        AddListViewColumn(g_hListRankings, 1, "Stock Symbol", 180);
        AddListViewColumn(g_hListRankings, 2, "Quantity", 130);
        AddListViewColumn(g_hListRankings, 3, "Avg Purchase Price", 180);
        AddListViewColumn(g_hListRankings, 4, "Total Invested", 190);
        AddListViewColumn(g_hListRankings, 5, "Allocation (%)", 140);

        if (g_selectedRankingUserIndex < 0 || g_selectedRankingUserIndex >= userCount)
            return;

        User& user = users[g_selectedRankingUserIndex];
        if (user.head == nullptr) return;

        Investment* copyHead = copyList(user.head);
        selectionSort(copyHead, g_rankingDescending);

        double totalPortfolio = calculateTotal(user);
        Investment* curr = copyHead;
        int row = 0;

        while (curr != nullptr)
        {
            double alloc = (totalPortfolio > 0.0) ? (curr->totalInvested / totalPortfolio) * 100.0 : 0.0;
            std::ostringstream allocSs;
            allocSs << std::fixed << std::setprecision(2) << alloc << "%";

            SetListViewItemText(g_hListRankings, row, 0, std::to_string(row + 1));
            SetListViewItemText(g_hListRankings, row, 1, curr->stockName);
            SetListViewItemText(g_hListRankings, row, 2, std::to_string(curr->quantity));
            SetListViewItemText(g_hListRankings, row, 3, FormatRs(curr->price));
            SetListViewItemText(g_hListRankings, row, 4, FormatRs(curr->totalInvested));
            SetListViewItemText(g_hListRankings, row, 5, allocSs.str());

            row++;
            curr = curr->next;
        }

        clearInvestments(copyHead);
    }
}

void RefreshSearchResults(const std::string& query)
{
    ListView_DeleteAllItems(g_hListSearchResults);

    if (query.empty())
    {
        SetStatus("Please enter a User ID or Name to search.");
        return;
    }

    int foundIdx = findUser(query);
    if (foundIdx == -1)
    {
        std::string searchUpper = toUpperCase(query);
        for (int i = 0; i < userCount; ++i)
        {
            if (toUpperCase(users[i].name).find(searchUpper) != std::string::npos)
            {
                foundIdx = i;
                break;
            }
        }
    }

    if (foundIdx == -1)
    {
        SetStatus("No user matching '" + query + "' found.");
        InvalidateRect(g_hWndMain, NULL, TRUE);
        return;
    }

    User& user = users[foundIdx];
    double totalPortfolio = calculateTotal(user);
    SetStatus("Found User: " + user.name + " (" + user.userID + ") | Total Portfolio: " + FormatRs(totalPortfolio));

    int row = 0;
    Investment* curr = user.head;
    while (curr != nullptr)
    {
        double alloc = (totalPortfolio > 0.0) ? (curr->totalInvested / totalPortfolio) * 100.0 : 0.0;
        std::ostringstream allocSs;
        allocSs << std::fixed << std::setprecision(2) << alloc << "%";

        SetListViewItemText(g_hListSearchResults, row, 0, curr->stockName);
        SetListViewItemText(g_hListSearchResults, row, 1, std::to_string(curr->quantity));
        SetListViewItemText(g_hListSearchResults, row, 2, FormatRs(curr->price));
        SetListViewItemText(g_hListSearchResults, row, 3, FormatRs(curr->totalInvested));
        SetListViewItemText(g_hListSearchResults, row, 4, allocSs.str());

        row++;
        curr = curr->next;
    }

    InvalidateRect(g_hWndMain, NULL, TRUE);
}

void RefreshDataView()
{
    InvalidateRect(g_hWndMain, NULL, TRUE);
}

// ===============================================================================
// DEDICATED MODAL DIALOG PROCEDURE
// Isolates dialogs completely from main window layout and paint logic
// ===============================================================================
LRESULT CALLBACK ModalDlgWndProc(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam)
{
    ModalDlgContext* pCtx = (ModalDlgContext*)GetWindowLongPtrA(hWnd, GWLP_USERDATA);

    switch (msg)
    {
    case WM_NCCREATE:
    {
        CREATESTRUCTA* pCs = (CREATESTRUCTA*)lParam;
        SetWindowLongPtrA(hWnd, GWLP_USERDATA, (LONG_PTR)pCs->lpCreateParams);
        return DefWindowProcA(hWnd, msg, wParam, lParam);
    }

    case WM_CTLCOLORSTATIC:
    {
        HDC hdc = (HDC)wParam;
        SetTextColor(hdc, COLOR_TEXT_LIGHT);
        SetBkColor(hdc, COLOR_CARD_BG);
        return (LRESULT)g_hBrushCardBg;
    }

    case WM_CTLCOLOREDIT:
    {
        HDC hdc = (HDC)wParam;
        SetTextColor(hdc, COLOR_TEXT_LIGHT);
        SetBkColor(hdc, COLOR_INPUT_BG);
        return (LRESULT)g_hBrushInputBg;
    }

    case WM_COMMAND:
    {
        int cmdId = LOWORD(wParam);
        if (cmdId == IDOK || cmdId == IDCANCEL)
        {
            if (pCtx)
            {
                pCtx->submitted = (cmdId == IDOK);
                pCtx->completed = true;
            }
            return 0;
        }
        break;
    }

    case WM_CLOSE:
        if (pCtx)
        {
            pCtx->submitted = false;
            pCtx->completed = true;
        }
        return 0;
    }

    return DefWindowProcA(hWnd, msg, wParam, lParam);
}

// ===============================================================================
// REDESIGNED NATIVE MODAL DIALOGS
// ===============================================================================

// 1. ADD NEW USER ACCOUNT DIALOG
void ShowAddUserDialog(HWND hParent)
{
    int dlgW = 480;
    int dlgH = 280;

    RECT rcDlg = { 0, 0, dlgW, dlgH };
    AdjustWindowRectEx(&rcDlg, WS_POPUP | WS_CAPTION | WS_SYSMENU, FALSE, WS_EX_DLGMODALFRAME);
    int realW = rcDlg.right - rcDlg.left;
    int realH = rcDlg.bottom - rcDlg.top;

    ModalDlgContext ctx = { false, false, NULL };

    HWND hDlg = CreateWindowExA(
        WS_EX_DLGMODALFRAME,
        "PortfolioModalDlgClass",
        "Add New User Account",
        WS_POPUP | WS_CAPTION | WS_SYSMENU | WS_CLIPCHILDREN,
        0, 0, realW, realH,
        hParent, NULL, g_hInstance, &ctx
    );
    ctx.hDlg = hDlg;
    CenterWindow(hDlg, hParent);

    int marginX = 28;
    int contentW = dlgW - (2 * marginX); // 424px

    // Field 1: User ID
    HWND lbl1 = CreateWindowExA(0, "STATIC", "User ID", WS_CHILD | WS_VISIBLE,
        marginX, 20, contentW, 20, hDlg, NULL, g_hInstance, NULL);
    SendMessageA(lbl1, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    HWND edit1 = CreateWindowExA(WS_EX_CLIENTEDGE, "EDIT", "",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | ES_AUTOHSCROLL,
        marginX, 44, contentW, 34, hDlg, (HMENU)101, g_hInstance, NULL);
    SendMessageA(edit1, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);
    SendMessageW(edit1, 0x1501, FALSE, (LPARAM)L"Enter your unique ID (e.g., USR101)");

    // Field 2: Full Name
    HWND lbl2 = CreateWindowExA(0, "STATIC", "Full Name", WS_CHILD | WS_VISIBLE,
        marginX, 96, contentW, 20, hDlg, NULL, g_hInstance, NULL);
    SendMessageA(lbl2, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    HWND edit2 = CreateWindowExA(WS_EX_CLIENTEDGE, "EDIT", "",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | ES_AUTOHSCROLL,
        marginX, 120, contentW, 34, hDlg, (HMENU)102, g_hInstance, NULL);
    SendMessageA(edit2, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);
    SendMessageW(edit2, 0x1501, FALSE, (LPARAM)L"Enter your name");

    // Action Buttons (Bottom-Right aligned)
    int btnW = 125;
    int btnH = 38;
    int btnY = 190;
    int btnCancelX = dlgW - marginX - (2 * btnW) - 12; // 190
    int btnOkX = dlgW - marginX - btnW;                // 327

    HWND btnCancel = CreateWindowExA(0, "BUTTON", "Cancel",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | BS_PUSHBUTTON,
        btnCancelX, btnY, btnW, btnH, hDlg, (HMENU)IDCANCEL, g_hInstance, NULL);
    SendMessageA(btnCancel, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);

    HWND btnOk = CreateWindowExA(0, "BUTTON", "Create User",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | BS_DEFPUSHBUTTON,
        btnOkX, btnY, btnW, btnH, hDlg, (HMENU)IDOK, g_hInstance, NULL);
    SendMessageA(btnOk, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    EnableWindow(hParent, FALSE);
    ShowWindow(hDlg, SW_SHOW);
    UpdateWindow(hDlg);
    SetFocus(edit1);

    MSG msg;
    while (!ctx.completed && GetMessageA(&msg, NULL, 0, 0))
    {
        if (msg.message == WM_KEYDOWN)
        {
            if (msg.wParam == VK_ESCAPE)
            {
                ctx.submitted = false;
                ctx.completed = true;
                break;
            }
            else if (msg.wParam == VK_RETURN)
            {
                ctx.submitted = true;
                ctx.completed = true;
                break;
            }
        }

        if (!IsDialogMessageA(hDlg, &msg))
        {
            TranslateMessage(&msg);
            DispatchMessageA(&msg);
        }
    }

    std::string userId = GetInputText(edit1);
    std::string userName = GetInputText(edit2);

    EnableWindow(hParent, TRUE);
    DestroyWindow(hDlg);
    SetForegroundWindow(hParent);

    if (ctx.submitted)
    {
        std::string err;
        if (!registerUserCore(userId, userName, err))
        {
            MessageBoxA(hParent, err.c_str(), "Validation Error", MB_ICONWARNING | MB_OK);
        }
        else
        {
            saveToFile(DEFAULT_DATA_FILE);
            RefreshAllViews();
            SetStatus("User '" + userName + "' registered successfully.");
        }
    }
}

// 2. EDIT USER PROFILE NAME DIALOG
void ShowEditUserDialog(HWND hParent)
{
    int sel = ListView_GetNextItem(g_hListUsers, -1, LVNI_SELECTED);
    if (sel == -1)
    {
        MessageBoxA(hParent, "Please select a user from the table to edit.", "Selection Required", MB_ICONINFORMATION | MB_OK);
        return;
    }

    char uId[128] = {0};
    char uName[256] = {0};
    ListView_GetItemText(g_hListUsers, sel, 1, uId, sizeof(uId));
    ListView_GetItemText(g_hListUsers, sel, 2, uName, sizeof(uName));

    int dlgW = 480;
    int dlgH = 240;

    RECT rcDlg = { 0, 0, dlgW, dlgH };
    AdjustWindowRectEx(&rcDlg, WS_POPUP | WS_CAPTION | WS_SYSMENU, FALSE, WS_EX_DLGMODALFRAME);
    int realW = rcDlg.right - rcDlg.left;
    int realH = rcDlg.bottom - rcDlg.top;

    ModalDlgContext ctx = { false, false, NULL };

    HWND hDlg = CreateWindowExA(
        WS_EX_DLGMODALFRAME,
        "PortfolioModalDlgClass",
        "Edit User Profile Name",
        WS_POPUP | WS_CAPTION | WS_SYSMENU | WS_CLIPCHILDREN,
        0, 0, realW, realH,
        hParent, NULL, g_hInstance, &ctx
    );
    ctx.hDlg = hDlg;
    CenterWindow(hDlg, hParent);

    int marginX = 28;
    int contentW = dlgW - (2 * marginX);

    std::string prompt = "User ID: " + std::string(uId);
    HWND lblId = CreateWindowExA(0, "STATIC", prompt.c_str(), WS_CHILD | WS_VISIBLE,
        marginX, 20, contentW, 20, hDlg, NULL, g_hInstance, NULL);
    SendMessageA(lblId, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    HWND lblName = CreateWindowExA(0, "STATIC", "Updated Full Name", WS_CHILD | WS_VISIBLE,
        marginX, 55, contentW, 20, hDlg, NULL, g_hInstance, NULL);
    SendMessageA(lblName, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    HWND editName = CreateWindowExA(WS_EX_CLIENTEDGE, "EDIT", uName,
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | ES_AUTOHSCROLL,
        marginX, 79, contentW, 34, hDlg, (HMENU)101, g_hInstance, NULL);
    SendMessageA(editName, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);

    int btnW = 125;
    int btnH = 38;
    int btnY = 145;
    int btnCancelX = dlgW - marginX - (2 * btnW) - 12;
    int btnOkX = dlgW - marginX - btnW;

    HWND btnCancel = CreateWindowExA(0, "BUTTON", "Cancel",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | BS_PUSHBUTTON,
        btnCancelX, btnY, btnW, btnH, hDlg, (HMENU)IDCANCEL, g_hInstance, NULL);
    SendMessageA(btnCancel, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);

    HWND btnOk = CreateWindowExA(0, "BUTTON", "Save Name",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | BS_DEFPUSHBUTTON,
        btnOkX, btnY, btnW, btnH, hDlg, (HMENU)IDOK, g_hInstance, NULL);
    SendMessageA(btnOk, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    EnableWindow(hParent, FALSE);
    ShowWindow(hDlg, SW_SHOW);
    UpdateWindow(hDlg);
    SetFocus(editName);
    SendMessageA(editName, EM_SETSEL, 0, -1);

    MSG msg;
    while (!ctx.completed && GetMessageA(&msg, NULL, 0, 0))
    {
        if (msg.message == WM_KEYDOWN)
        {
            if (msg.wParam == VK_ESCAPE) { ctx.submitted = false; ctx.completed = true; break; }
            else if (msg.wParam == VK_RETURN) { ctx.submitted = true; ctx.completed = true; break; }
        }
        if (!IsDialogMessageA(hDlg, &msg))
        {
            TranslateMessage(&msg);
            DispatchMessageA(&msg);
        }
    }

    std::string newName = GetInputText(editName);

    EnableWindow(hParent, TRUE);
    DestroyWindow(hDlg);
    SetForegroundWindow(hParent);

    if (ctx.submitted)
    {
        std::string err;
        if (!editUserNameCore(uId, newName, err))
        {
            MessageBoxA(hParent, err.c_str(), "Update Failed", MB_ICONWARNING | MB_OK);
        }
        else
        {
            saveToFile(DEFAULT_DATA_FILE);
            RefreshAllViews();
            SetStatus("Updated name for user [" + std::string(uId) + "].");
        }
    }
}

// 3. ADD STOCK INVESTMENT HOLDING DIALOG
void ShowAddInvestmentDialog(HWND hParent)
{
    if (userCount == 0)
    {
        MessageBoxA(hParent, "Please add a user before creating investments.", "No Users Registered", MB_ICONINFORMATION | MB_OK);
        return;
    }

    int userIdx = g_selectedPortfolioUserIndex;
    if (userIdx < 0 || userIdx >= userCount) userIdx = 0;

    int dlgW = 500;
    int dlgH = 370;

    RECT rcDlg = { 0, 0, dlgW, dlgH };
    AdjustWindowRectEx(&rcDlg, WS_POPUP | WS_CAPTION | WS_SYSMENU, FALSE, WS_EX_DLGMODALFRAME);
    int realW = rcDlg.right - rcDlg.left;
    int realH = rcDlg.bottom - rcDlg.top;

    ModalDlgContext ctx = { false, false, NULL };

    HWND hDlg = CreateWindowExA(
        WS_EX_DLGMODALFRAME,
        "PortfolioModalDlgClass",
        "Add Stock Investment Holding",
        WS_POPUP | WS_CAPTION | WS_SYSMENU | WS_CLIPCHILDREN,
        0, 0, realW, realH,
        hParent, NULL, g_hInstance, &ctx
    );
    ctx.hDlg = hDlg;
    CenterWindow(hDlg, hParent);

    int marginX = 28;
    int contentW = dlgW - (2 * marginX); // 444px

    std::string targetText = "Target Investor: " + users[userIdx].name + " (" + users[userIdx].userID + ")";
    HWND lblTarget = CreateWindowExA(0, "STATIC", targetText.c_str(), WS_CHILD | WS_VISIBLE,
        marginX, 18, contentW, 20, hDlg, NULL, g_hInstance, NULL);
    SendMessageA(lblTarget, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    // Field 1: Symbol
    HWND lbl1 = CreateWindowExA(0, "STATIC", "Stock Symbol / Ticker (e.g., TCS, INFY)", WS_CHILD | WS_VISIBLE,
        marginX, 48, contentW, 20, hDlg, NULL, g_hInstance, NULL);
    SendMessageA(lbl1, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    HWND edit1 = CreateWindowExA(WS_EX_CLIENTEDGE, "EDIT", "",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | ES_AUTOHSCROLL,
        marginX, 72, contentW, 34, hDlg, (HMENU)101, g_hInstance, NULL);
    SendMessageA(edit1, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);
    SendMessageW(edit1, 0x1501, FALSE, (LPARAM)L"e.g. TCS, RELIANCE, INFY");

    // Field 2: Quantity
    HWND lbl2 = CreateWindowExA(0, "STATIC", "Quantity of Shares (Positive Integer)", WS_CHILD | WS_VISIBLE,
        marginX, 120, contentW, 20, hDlg, NULL, g_hInstance, NULL);
    SendMessageA(lbl2, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    HWND edit2 = CreateWindowExA(WS_EX_CLIENTEDGE, "EDIT", "",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | ES_AUTOHSCROLL,
        marginX, 144, contentW, 34, hDlg, (HMENU)102, g_hInstance, NULL);
    SendMessageA(edit2, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);
    SendMessageW(edit2, 0x1501, FALSE, (LPARAM)L"e.g. 50");

    // Field 3: Price
    HWND lbl3 = CreateWindowExA(0, "STATIC", "Purchase Price per Share (in Rs.)", WS_CHILD | WS_VISIBLE,
        marginX, 192, contentW, 20, hDlg, NULL, g_hInstance, NULL);
    SendMessageA(lbl3, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    HWND edit3 = CreateWindowExA(WS_EX_CLIENTEDGE, "EDIT", "",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | ES_AUTOHSCROLL,
        marginX, 216, contentW, 34, hDlg, (HMENU)103, g_hInstance, NULL);
    SendMessageA(edit3, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);
    SendMessageW(edit3, 0x1501, FALSE, (LPARAM)L"e.g. 1550.00");

    // Bottom Action Buttons
    int btnW = 145;
    int btnH = 38;
    int btnY = 275;
    int btnCancelX = dlgW - marginX - (2 * btnW) - 12;
    int btnOkX = dlgW - marginX - btnW;

    HWND btnCancel = CreateWindowExA(0, "BUTTON", "Cancel",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | BS_PUSHBUTTON,
        btnCancelX, btnY, btnW, btnH, hDlg, (HMENU)IDCANCEL, g_hInstance, NULL);
    SendMessageA(btnCancel, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);

    HWND btnOk = CreateWindowExA(0, "BUTTON", "Add / Merge Stock",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | BS_DEFPUSHBUTTON,
        btnOkX, btnY, btnW, btnH, hDlg, (HMENU)IDOK, g_hInstance, NULL);
    SendMessageA(btnOk, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    EnableWindow(hParent, FALSE);
    ShowWindow(hDlg, SW_SHOW);
    UpdateWindow(hDlg);
    SetFocus(edit1);

    MSG msg;
    while (!ctx.completed && GetMessageA(&msg, NULL, 0, 0))
    {
        if (msg.message == WM_KEYDOWN)
        {
            if (msg.wParam == VK_ESCAPE) { ctx.submitted = false; ctx.completed = true; break; }
            else if (msg.wParam == VK_RETURN) { ctx.submitted = true; ctx.completed = true; break; }
        }
        if (!IsDialogMessageA(hDlg, &msg))
        {
            TranslateMessage(&msg);
            DispatchMessageA(&msg);
        }
    }

    std::string symbol = GetInputText(edit1);
    std::string qtyStr = GetInputText(edit2);
    std::string priceStr = GetInputText(edit3);

    EnableWindow(hParent, TRUE);
    DestroyWindow(hDlg);
    SetForegroundWindow(hParent);

    if (ctx.submitted)
    {
        int qty = 0;
        double price = 0.0;
        try {
            qty = std::stoi(qtyStr);
            price = std::stod(priceStr);
        } catch (...) {
            MessageBoxA(hParent, "Please enter valid numeric values for Quantity and Price.", "Input Error", MB_ICONWARNING | MB_OK);
            return;
        }

        std::string outMsg, outErr;
        if (!addInvestmentCore(users[userIdx].userID, symbol, qty, price, outMsg, outErr))
        {
            MessageBoxA(hParent, outErr.c_str(), "Investment Error", MB_ICONWARNING | MB_OK);
        }
        else
        {
            saveToFile(DEFAULT_DATA_FILE);
            RefreshAllViews();
            SetStatus(outMsg);
            MessageBoxA(hParent, outMsg.c_str(), "Portfolio Updated", MB_ICONINFORMATION | MB_OK);
        }
    }
}

// 4. EDIT INVESTMENT HOLDING DIALOG
void ShowEditInvestmentDialog(HWND hParent)
{
    if (g_selectedPortfolioUserIndex < 0 || g_selectedPortfolioUserIndex >= userCount)
        return;

    int sel = ListView_GetNextItem(g_hListPortfolioHoldings, -1, LVNI_SELECTED);
    if (sel == -1)
    {
        MessageBoxA(hParent, "Please select an investment from the table to edit.", "Selection Required", MB_ICONINFORMATION | MB_OK);
        return;
    }

    char stock[128] = {0};
    ListView_GetItemText(g_hListPortfolioHoldings, sel, 0, stock, sizeof(stock));

    Investment* inv = findInvestment(users[g_selectedPortfolioUserIndex], stock);
    if (!inv) return;

    int dlgW = 480;
    int dlgH = 300;

    RECT rcDlg = { 0, 0, dlgW, dlgH };
    AdjustWindowRectEx(&rcDlg, WS_POPUP | WS_CAPTION | WS_SYSMENU, FALSE, WS_EX_DLGMODALFRAME);
    int realW = rcDlg.right - rcDlg.left;
    int realH = rcDlg.bottom - rcDlg.top;

    ModalDlgContext ctx = { false, false, NULL };

    HWND hDlg = CreateWindowExA(
        WS_EX_DLGMODALFRAME,
        "PortfolioModalDlgClass",
        "Edit Investment Holding",
        WS_POPUP | WS_CAPTION | WS_SYSMENU | WS_CLIPCHILDREN,
        0, 0, realW, realH,
        hParent, NULL, g_hInstance, &ctx
    );
    ctx.hDlg = hDlg;
    CenterWindow(hDlg, hParent);

    int marginX = 28;
    int contentW = dlgW - (2 * marginX);

    std::string prompt = "Editing Stock: " + std::string(stock);
    HWND lblStock = CreateWindowExA(0, "STATIC", prompt.c_str(), WS_CHILD | WS_VISIBLE,
        marginX, 20, contentW, 20, hDlg, NULL, g_hInstance, NULL);
    SendMessageA(lblStock, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    // Field 1: Quantity
    HWND lbl1 = CreateWindowExA(0, "STATIC", "Updated Quantity of Shares", WS_CHILD | WS_VISIBLE,
        marginX, 55, contentW, 20, hDlg, NULL, g_hInstance, NULL);
    SendMessageA(lbl1, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    HWND edit1 = CreateWindowExA(WS_EX_CLIENTEDGE, "EDIT", std::to_string(inv->quantity).c_str(),
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | ES_AUTOHSCROLL,
        marginX, 79, contentW, 34, hDlg, (HMENU)101, g_hInstance, NULL);
    SendMessageA(edit1, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);

    // Field 2: Price
    HWND lbl2 = CreateWindowExA(0, "STATIC", "Updated Purchase Price per Share (in Rs.)", WS_CHILD | WS_VISIBLE,
        marginX, 127, contentW, 20, hDlg, NULL, g_hInstance, NULL);
    SendMessageA(lbl2, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    std::ostringstream prSs;
    prSs << std::fixed << std::setprecision(2) << inv->price;
    HWND edit2 = CreateWindowExA(WS_EX_CLIENTEDGE, "EDIT", prSs.str().c_str(),
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | ES_AUTOHSCROLL,
        marginX, 151, contentW, 34, hDlg, (HMENU)102, g_hInstance, NULL);
    SendMessageA(edit2, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);

    // Bottom Action Buttons
    int btnW = 135;
    int btnH = 38;
    int btnY = 210;
    int btnCancelX = dlgW - marginX - (2 * btnW) - 12;
    int btnOkX = dlgW - marginX - btnW;

    HWND btnCancel = CreateWindowExA(0, "BUTTON", "Cancel",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | BS_PUSHBUTTON,
        btnCancelX, btnY, btnW, btnH, hDlg, (HMENU)IDCANCEL, g_hInstance, NULL);
    SendMessageA(btnCancel, WM_SETFONT, (WPARAM)g_hFontBody, TRUE);

    HWND btnOk = CreateWindowExA(0, "BUTTON", "Save Changes",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP | BS_DEFPUSHBUTTON,
        btnOkX, btnY, btnW, btnH, hDlg, (HMENU)IDOK, g_hInstance, NULL);
    SendMessageA(btnOk, WM_SETFONT, (WPARAM)g_hFontBodyBold, TRUE);

    EnableWindow(hParent, FALSE);
    ShowWindow(hDlg, SW_SHOW);
    UpdateWindow(hDlg);
    SetFocus(edit1);

    MSG msg;
    while (!ctx.completed && GetMessageA(&msg, NULL, 0, 0))
    {
        if (msg.message == WM_KEYDOWN)
        {
            if (msg.wParam == VK_ESCAPE) { ctx.submitted = false; ctx.completed = true; break; }
            else if (msg.wParam == VK_RETURN) { ctx.submitted = true; ctx.completed = true; break; }
        }
        if (!IsDialogMessageA(hDlg, &msg))
        {
            TranslateMessage(&msg);
            DispatchMessageA(&msg);
        }
    }

    std::string newQtyStr = GetInputText(edit1);
    std::string newPriceStr = GetInputText(edit2);

    EnableWindow(hParent, TRUE);
    DestroyWindow(hDlg);
    SetForegroundWindow(hParent);

    if (ctx.submitted)
    {
        int newQty = 0;
        double newPrice = 0.0;
        try {
            newQty = std::stoi(newQtyStr);
            newPrice = std::stod(newPriceStr);
        } catch (...) {
            MessageBoxA(hParent, "Please enter valid numeric numbers.", "Validation Error", MB_ICONWARNING | MB_OK);
            return;
        }

        std::string err;
        if (!editInvestmentCore(users[g_selectedPortfolioUserIndex].userID, stock, newQty, newPrice, err))
        {
            MessageBoxA(hParent, err.c_str(), "Update Error", MB_ICONWARNING | MB_OK);
        }
        else
        {
            saveToFile(DEFAULT_DATA_FILE);
            RefreshAllViews();
            SetStatus("Updated holding for " + std::string(stock) + ".");
        }
    }
}

// ===============================================================================
// MAIN WINDOW PROCEDURE (WNDPROC)
// ===============================================================================
LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam)
{
    switch (message)
    {
    case WM_CREATE:
        CreateControls(hWnd);
        return 0;

    case WM_GETMINMAXINFO:
    {
        LPMINMAXINFO lpMMI = (LPMINMAXINFO)lParam;
        lpMMI->ptMinTrackSize.x = 980;
        lpMMI->ptMinTrackSize.y = 650;
        return 0;
    }

    case WM_SIZE:
        LayoutControls(LOWORD(lParam), HIWORD(lParam));
        InvalidateRect(hWnd, NULL, TRUE);
        return 0;

    case WM_DRAWITEM:
    {
        LPDRAWITEMSTRUCT pDis = (LPDRAWITEMSTRUCT)lParam;
        if (pDis->CtlType == ODT_BUTTON)
        {
            int btnIndex = pDis->CtlID - ID_NAV_DASHBOARD;
            if (btnIndex >= 0 && btnIndex < PAGE_COUNT)
            {
                bool isActive = (g_currentPage == btnIndex);
                COLORREF bgCol = isActive ? COLOR_ACCENT_PURPLE : COLOR_CARD_BG;
                HBRUSH hBr = CreateSolidBrush(bgCol);
                FillRect(pDis->hDC, &pDis->rcItem, hBr);
                DeleteObject(hBr);

                if (isActive)
                {
                    RECT rcBar = { pDis->rcItem.left, pDis->rcItem.top, pDis->rcItem.left + 5, pDis->rcItem.bottom };
                    HBRUSH hBarBr = CreateSolidBrush(RGB(255, 255, 255));
                    FillRect(pDis->hDC, &rcBar, hBarBr);
                    DeleteObject(hBarBr);
                }

                FrameRect(pDis->hDC, &pDis->rcItem, g_hBrushCardBg);

                SetBkMode(pDis->hDC, TRANSPARENT);
                SetTextColor(pDis->hDC, isActive ? RGB(255, 255, 255) : COLOR_TEXT_LIGHT);
                SelectObject(pDis->hDC, isActive ? g_hFontBodyBold : g_hFontBody);

                char btnText[64] = {0};
                GetWindowTextA(pDis->hwndItem, btnText, sizeof(btnText));
                RECT rcText = pDis->rcItem;
                rcText.left += 15;
                DrawTextA(pDis->hDC, btnText, -1, &rcText, DT_SINGLELINE | DT_VCENTER | DT_LEFT);
                return TRUE;
            }
        }
        break;
    }

    case WM_CTLCOLORSTATIC:
    {
        HDC hdcStatic = (HDC)wParam;
        SetTextColor(hdcStatic, COLOR_TEXT_LIGHT);
        SetBkColor(hdcStatic, COLOR_BG_DARK);
        return (LRESULT)g_hBrushBgDark;
    }

    case WM_CTLCOLOREDIT:
    {
        HDC hdcEdit = (HDC)wParam;
        SetTextColor(hdcEdit, COLOR_TEXT_LIGHT);
        SetBkColor(hdcEdit, COLOR_INPUT_BG);
        return (LRESULT)g_hBrushInputBg;
    }

    case WM_PAINT:
    {
        PAINTSTRUCT ps;
        HDC hdc = BeginPaint(hWnd, &ps);

        RECT clientRc;
        GetClientRect(hWnd, &clientRc);

        // 1. Sidebar Background
        RECT sidebarRc = { 0, 0, SIDEBAR_WIDTH, clientRc.bottom };
        FillRect(hdc, &sidebarRc, g_hBrushSidebarBg);

        // Sidebar Header
        SetBkMode(hdc, TRANSPARENT);
        SetTextColor(hdc, RGB(255, 255, 255));
        SelectObject(hdc, g_hFontTitle);
        RECT rcLogo = { 20, 22, SIDEBAR_WIDTH - 20, 52 };
        DrawTextA(hdc, "Portfolio OS", -1, &rcLogo, DT_SINGLELINE | DT_LEFT);

        SetTextColor(hdc, COLOR_ACCENT_HOVER);
        SelectObject(hdc, g_hFontSmall);
        RECT rcSub = { 22, 52, SIDEBAR_WIDTH - 20, 72 };
        DrawTextA(hdc, "Native Win32 C++ DSA", -1, &rcSub, DT_SINGLELINE | DT_LEFT);

        // 2. Main Content Area
        int contentX = SIDEBAR_WIDTH + 30; // 250
        int contentW = clientRc.right - contentX - 25;
        if (contentW < 500) contentW = 500;

        SetTextColor(hdc, RGB(255, 255, 255));
        SelectObject(hdc, g_hFontTitle);

        switch (g_currentPage)
        {
        case PAGE_DASHBOARD:
        {
            RECT rcHdr = { contentX, 20, contentX + 600, 55 };
            DrawTextA(hdc, "Portfolio Overview", -1, &rcHdr, DT_SINGLELINE | DT_LEFT);

            double grandTotal = 0.0;
            int totalHoldings = 0;
            std::string topHoldingName = "None";
            double topHoldingVal = 0.0;

            for (int i = 0; i < userCount; ++i)
            {
                grandTotal += calculateTotal(users[i]);
                totalHoldings += countHoldings(users[i]);
                Investment* curr = users[i].head;
                while (curr != nullptr)
                {
                    if (curr->totalInvested > topHoldingVal)
                    {
                        topHoldingVal = curr->totalInvested;
                        topHoldingName = curr->stockName + " (" + FormatRs(topHoldingVal) + ")";
                    }
                    curr = curr->next;
                }
            }

            // Stat Cards (Fluid 4-column layout)
            int gap = 14;
            int cardW = (contentW - 3 * gap) / 4;
            int cardH = 90;
            int cardY = 65;

            auto DrawStatCard = [&](int index, const char* title, const std::string& val, COLORREF valColor) {
                int left = contentX + index * (cardW + gap);
                RECT rcCard = { left, cardY, left + cardW, cardY + cardH };
                FillRect(hdc, &rcCard, g_hBrushCardBg);

                SetTextColor(hdc, COLOR_TEXT_MUTED);
                SelectObject(hdc, g_hFontSmall);
                RECT rcTitle = { rcCard.left + 15, rcCard.top + 14, rcCard.right - 10, rcCard.top + 32 };
                DrawTextA(hdc, title, -1, &rcTitle, DT_SINGLELINE | DT_LEFT);

                SetTextColor(hdc, valColor);
                SelectObject(hdc, g_hFontHeader);
                RECT rcVal = { rcCard.left + 15, rcCard.top + 38, rcCard.right - 10, rcCard.bottom - 10 };
                DrawTextA(hdc, val.c_str(), -1, &rcVal, DT_SINGLELINE | DT_LEFT | DT_VCENTER);
            };

            DrawStatCard(0, "TOTAL CAPITAL INVESTED", FormatRs(grandTotal), COLOR_GREEN_GAIN);
            DrawStatCard(1, "ACTIVE PROFILES", std::to_string(userCount) + " / " + std::to_string(MAX_USERS), COLOR_TEXT_LIGHT);
            DrawStatCard(2, "STOCKS MONITORED", std::to_string(totalHoldings) + " positions", COLOR_ACCENT_HOVER);
            DrawStatCard(3, "TOP PORTFOLIO HOLDING", topHoldingName, COLOR_TEXT_LIGHT);

            // Table Label
            SetTextColor(hdc, COLOR_TEXT_LIGHT);
            SelectObject(hdc, g_hFontHeader);
            RECT rcSec = { contentX, 226, contentX + 450, 254 };
            DrawTextA(hdc, "Top System Investments (Ranked by Value)", -1, &rcSec, DT_SINGLELINE | DT_LEFT);

            if (userCount == 0)
            {
                SetTextColor(hdc, COLOR_TEXT_MUTED);
                SelectObject(hdc, g_hFontBody);
                RECT rcEmpty = { contentX + 20, 360, contentX + 650, 420 };
                DrawTextA(hdc, "No investment data recorded yet. Click '+ Add User' to register your first profile.", -1, &rcEmpty, DT_LEFT);
            }
            break;
        }

        case PAGE_USERS:
        {
            RECT rcHdr = { contentX, 20, contentX + 600, 52 };
            DrawTextA(hdc, "User Directory & Profiles", -1, &rcHdr, DT_SINGLELINE | DT_LEFT);

            SetTextColor(hdc, COLOR_TEXT_MUTED);
            SelectObject(hdc, g_hFontSmall);
            RECT rcSub = { contentX, 52, contentX + 600, 74 };
            DrawTextA(hdc, "Manage investor accounts. Each profile maintains its own isolated linked list of investments.", -1, &rcSub, DT_SINGLELINE | DT_LEFT);
            break;
        }

        case PAGE_PORTFOLIO:
        {
            RECT rcHdr = { contentX, 20, contentX + 600, 52 };
            DrawTextA(hdc, "Individual User Portfolio", -1, &rcHdr, DT_SINGLELINE | DT_LEFT);

            if (g_selectedPortfolioUserIndex >= 0 && g_selectedPortfolioUserIndex < userCount)
            {
                User& u = users[g_selectedPortfolioUserIndex];
                double uTotal = calculateTotal(u);
                int uCount = countHoldings(u);

                RECT rcCard = { contentX, 115, contentX + contentW, 190 };
                FillRect(hdc, &rcCard, g_hBrushCardBg);

                SetTextColor(hdc, COLOR_TEXT_MUTED);
                SelectObject(hdc, g_hFontSmall);
                RECT rcL1 = { contentX + 20, 125, contentX + 350, 145 };
                DrawTextA(hdc, "ACTIVE INVESTOR ACCOUNT", -1, &rcL1, DT_SINGLELINE | DT_LEFT);

                SetTextColor(hdc, RGB(255, 255, 255));
                SelectObject(hdc, g_hFontHeader);
                std::string nameLine = u.name + " (" + u.userID + ") - " + std::to_string(uCount) + " stocks";
                RECT rcL2 = { contentX + 20, 148, contentX + 420, 178 };
                DrawTextA(hdc, nameLine.c_str(), -1, &rcL2, DT_SINGLELINE | DT_LEFT);

                SetTextColor(hdc, COLOR_TEXT_MUTED);
                SelectObject(hdc, g_hFontSmall);
                RECT rcL3 = { contentX + 460, 125, contentX + 750, 145 };
                DrawTextA(hdc, "TOTAL PORTFOLIO ACQUISITION COST", -1, &rcL3, DT_SINGLELINE | DT_LEFT);

                SetTextColor(hdc, COLOR_GREEN_GAIN);
                SelectObject(hdc, g_hFontHeader);
                RECT rcL4 = { contentX + 460, 148, contentX + 750, 178 };
                DrawTextA(hdc, FormatRs(uTotal).c_str(), -1, &rcL4, DT_SINGLELINE | DT_LEFT);
            }
            else
            {
                SetTextColor(hdc, COLOR_TEXT_MUTED);
                SelectObject(hdc, g_hFontBody);
                RECT rcEmpty = { contentX, 140, contentX + 600, 170 };
                DrawTextA(hdc, "No user selected. Create or select a user from the dropdown above.", -1, &rcEmpty, DT_LEFT);
            }
            break;
        }

        case PAGE_RANKINGS:
        {
            RECT rcHdr = { contentX, 20, contentX + 600, 52 };
            DrawTextA(hdc, "Rankings (Custom Selection Sort)", -1, &rcHdr, DT_SINGLELINE | DT_LEFT);

            SetTextColor(hdc, COLOR_TEXT_MUTED);
            SelectObject(hdc, g_hFontSmall);
            RECT rcSub = { contentX, 50, contentX + 700, 70 };
            std::string subTxt = g_rankingDescending ? "Ordering: Highest to Lowest (Rank 1 = Largest total amount)"
                                                     : "Ordering: Lowest to Highest (Rank 1 = Smallest total amount)";
            DrawTextA(hdc, subTxt.c_str(), -1, &rcSub, DT_SINGLELINE | DT_LEFT);

            RECT rcStatBar = { contentX, 125, contentX + contentW, 188 };
            FillRect(hdc, &rcStatBar, g_hBrushCardBg);

            SetTextColor(hdc, COLOR_TEXT_MUTED);
            SelectObject(hdc, g_hFontSmall);
            RECT rcb1 = { contentX + 20, 134, contentX + 250, 154 };
            DrawTextA(hdc, "ACTIVE ALGORITHM", -1, &rcb1, DT_SINGLELINE | DT_LEFT);

            SetTextColor(hdc, COLOR_ACCENT_HOVER);
            SelectObject(hdc, g_hFontBodyBold);
            RECT rcb2 = { contentX + 20, 156, contentX + 250, 178 };
            DrawTextA(hdc, "Selection Sort O(n^2)", -1, &rcb2, DT_SINGLELINE | DT_LEFT);

            SetTextColor(hdc, COLOR_TEXT_MUTED);
            SelectObject(hdc, g_hFontSmall);
            RECT rcb3 = { contentX + 260, 134, contentX + 480, 154 };
            DrawTextA(hdc, "SORT TARGET", -1, &rcb3, DT_SINGLELINE | DT_LEFT);

            SetTextColor(hdc, RGB(255, 255, 255));
            SelectObject(hdc, g_hFontBodyBold);
            RECT rcb4 = { contentX + 260, 156, contentX + 480, 178 };
            DrawTextA(hdc, g_rankUsersMode ? "User Accounts" : "Individual Stock Holdings", -1, &rcb4, DT_SINGLELINE | DT_LEFT);

            SetTextColor(hdc, COLOR_TEXT_MUTED);
            SelectObject(hdc, g_hFontSmall);
            RECT rcb5 = { contentX + 500, 134, contentX + 780, 154 };
            DrawTextA(hdc, "SORT DIRECTION", -1, &rcb5, DT_SINGLELINE | DT_LEFT);

            SetTextColor(hdc, COLOR_GREEN_GAIN);
            SelectObject(hdc, g_hFontBodyBold);
            RECT rcb6 = { contentX + 500, 156, contentX + 780, 178 };
            DrawTextA(hdc, g_rankingDescending ? "Descending (High to Low)" : "Ascending (Low to High)", -1, &rcb6, DT_SINGLELINE | DT_LEFT);
            break;
        }

        case PAGE_SEARCH:
        {
            RECT rcHdr = { contentX, 20, contentX + 600, 52 };
            DrawTextA(hdc, "Search & Quick Lookup", -1, &rcHdr, DT_SINGLELINE | DT_LEFT);

            SetTextColor(hdc, COLOR_TEXT_MUTED);
            SelectObject(hdc, g_hFontSmall);
            RECT rcSub = { contentX, 50, contentX + 600, 70 };
            DrawTextA(hdc, "Instant linear search across registered accounts by unique User ID or full investor name.", -1, &rcSub, DT_SINGLELINE | DT_LEFT);

            RECT rcCard = { contentX, 128, contentX + contentW, 192 };
            FillRect(hdc, &rcCard, g_hBrushCardBg);

            SetTextColor(hdc, COLOR_TEXT_MUTED);
            SelectObject(hdc, g_hFontSmall);
            RECT rcStatusLbl = { contentX + 20, 138, contentX + contentW - 20, 158 };
            DrawTextA(hdc, "SEARCH STATUS / RESULT", -1, &rcStatusLbl, DT_SINGLELINE | DT_LEFT);

            SetTextColor(hdc, COLOR_TEXT_LIGHT);
            SelectObject(hdc, g_hFontBodyBold);
            RECT rcStatusVal = { contentX + 20, 160, contentX + contentW - 20, 184 };
            DrawTextA(hdc, g_statusMessage.c_str(), -1, &rcStatusVal, DT_SINGLELINE | DT_LEFT);
            break;
        }

        case PAGE_DATA:
        {
            RECT rcHdr = { contentX, 20, contentX + 600, 52 };
            DrawTextA(hdc, "Storage & Data Persistence", -1, &rcHdr, DT_SINGLELINE | DT_LEFT);

            // Primary File Card
            RECT rcFileCard = { contentX, 75, contentX + contentW, 255 };
            FillRect(hdc, &rcFileCard, g_hBrushCardBg);

            SetTextColor(hdc, COLOR_TEXT_MUTED);
            SelectObject(hdc, g_hFontSmall);
            RECT rcf1 = { contentX + 25, 90, contentX + 400, 110 };
            DrawTextA(hdc, "PRIMARY LOCAL PERSISTENCE FILE", -1, &rcf1, DT_SINGLELINE | DT_LEFT);

            SetTextColor(hdc, RGB(255, 255, 255));
            SelectObject(hdc, g_hFontHeader);
            RECT rcf2 = { contentX + 25, 115, contentX + 400, 140 };
            DrawTextA(hdc, DEFAULT_DATA_FILE.c_str(), -1, &rcf2, DT_SINGLELINE | DT_LEFT);

            SetTextColor(hdc, COLOR_GREEN_GAIN);
            SelectObject(hdc, g_hFontBody);
            std::string statusText = "Active: " + std::to_string(userCount) + " Users | Auto-save on mutation and shutdown enabled.";
            RECT rcf3 = { contentX + 25, 148, contentX + contentW - 20, 172 };
            DrawTextA(hdc, statusText.c_str(), -1, &rcf3, DT_SINGLELINE | DT_LEFT);

            // Backup & Restore Card
            RECT rcBackupCard = { contentX, 275, contentX + contentW, 455 };
            FillRect(hdc, &rcBackupCard, g_hBrushCardBg);

            SetTextColor(hdc, COLOR_TEXT_MUTED);
            SelectObject(hdc, g_hFontSmall);
            RECT rcb1 = { contentX + 25, 290, contentX + 400, 310 };
            DrawTextA(hdc, "DATA BACKUP & SAFE RESTORATION", -1, &rcb1, DT_SINGLELINE | DT_LEFT);

            SetTextColor(hdc, RGB(255, 255, 255));
            SelectObject(hdc, g_hFontHeader);
            RECT rcb2 = { contentX + 25, 315, contentX + 600, 340 };
            DrawTextA(hdc, "Export Snapshot / Restore Records", -1, &rcb2, DT_SINGLELINE | DT_LEFT);

            SetTextColor(hdc, COLOR_TEXT_MUTED);
            SelectObject(hdc, g_hFontSmall);
            RECT rcb3 = { contentX + 25, 348, contentX + contentW - 20, 372 };
            DrawTextA(hdc, "Export a timestamped backup or safely restore previous portfolio archives.", -1, &rcb3, DT_SINGLELINE | DT_LEFT);
            break;
        }
        default: break;
        }

        EndPaint(hWnd, &ps);
        return 0;
    }

    case WM_COMMAND:
    {
        int wmId = LOWORD(wParam);
        int wmEvent = HIWORD(wParam);

        if (wmId >= ID_NAV_DASHBOARD && wmId < ID_NAV_DASHBOARD + PAGE_COUNT)
        {
            SwitchPage((NavigationPage)(wmId - ID_NAV_DASHBOARD));
            return 0;
        }

        switch (wmId)
        {
        case ID_BTN_DASH_ADD_USER:
            ShowAddUserDialog(hWnd);
            break;

        case ID_BTN_DASH_ADD_INVESTMENT:
            ShowAddInvestmentDialog(hWnd);
            break;

        case ID_BTN_DASH_SAVE:
            if (saveToFile(DEFAULT_DATA_FILE))
            {
                MessageBoxA(hWnd, "Portfolio data saved successfully to disk.", "Success", MB_ICONINFORMATION | MB_OK);
                SetStatus("Data successfully saved to " + DEFAULT_DATA_FILE);
            }
            break;

        case ID_BTN_USER_ADD:
            ShowAddUserDialog(hWnd);
            break;

        case ID_BTN_USER_EDIT:
            ShowEditUserDialog(hWnd);
            break;

        case ID_BTN_USER_DELETE:
        {
            int sel = ListView_GetNextItem(g_hListUsers, -1, LVNI_SELECTED);
            if (sel == -1)
            {
                MessageBoxA(hWnd, "Please select a user to delete.", "Selection Required", MB_ICONINFORMATION | MB_OK);
                break;
            }

            char uId[128] = {0};
            char uName[256] = {0};
            ListView_GetItemText(g_hListUsers, sel, 1, uId, sizeof(uId));
            ListView_GetItemText(g_hListUsers, sel, 2, uName, sizeof(uName));

            std::string confirmMsg = "Are you sure you want to delete user [" + std::string(uId) + "] " +
                                     std::string(uName) + " and all associated stock holdings?\n\nThis action cannot be undone.";

            int resp = MessageBoxA(hWnd, confirmMsg.c_str(), "Confirm Account Deletion", MB_ICONWARNING | MB_YESNO | MB_DEFBUTTON2);
            if (resp == IDYES)
            {
                std::string err;
                if (!deleteUserCore(uId, err))
                {
                    MessageBoxA(hWnd, err.c_str(), "Delete Failed", MB_ICONERROR | MB_OK);
                }
                else
                {
                    saveToFile(DEFAULT_DATA_FILE);
                    RefreshAllViews();
                    SetStatus("Deleted user [" + std::string(uId) + "].");
                }
            }
            break;
        }

        case ID_EDIT_USER_FILTER:
            if (wmEvent == EN_CHANGE)
            {
                g_userSearchFilter = GetInputText(g_hEditUserFilter);
                RefreshUsersView();
            }
            break;

        case ID_COMBO_PORTFOLIO_USER:
            if (wmEvent == CBN_SELCHANGE)
            {
                g_selectedPortfolioUserIndex = (int)SendMessageA(g_hComboPortfolioUser, CB_GETCURSEL, 0, 0);
                RefreshPortfolioView();
                InvalidateRect(hWnd, NULL, TRUE);
            }
            break;

        case ID_BTN_PORTFOLIO_ADD_STOCK:
            ShowAddInvestmentDialog(hWnd);
            break;

        case ID_BTN_PORTFOLIO_EDIT_STOCK:
            ShowEditInvestmentDialog(hWnd);
            break;

        case ID_BTN_PORTFOLIO_DEL_STOCK:
        {
            if (g_selectedPortfolioUserIndex < 0 || g_selectedPortfolioUserIndex >= userCount)
                break;

            int sel = ListView_GetNextItem(g_hListPortfolioHoldings, -1, LVNI_SELECTED);
            if (sel == -1)
            {
                MessageBoxA(hWnd, "Please select a holding to delete from the portfolio table.", "Selection Required", MB_ICONINFORMATION | MB_OK);
                break;
            }

            char stock[128] = {0};
            ListView_GetItemText(g_hListPortfolioHoldings, sel, 0, stock, sizeof(stock));

            std::string confirmMsg = "Are you sure you want to remove " + std::string(stock) + " from this portfolio?";
            if (MessageBoxA(hWnd, confirmMsg.c_str(), "Confirm Delete Holding", MB_ICONWARNING | MB_YESNO) == IDYES)
            {
                std::string err;
                if (!deleteInvestmentCore(users[g_selectedPortfolioUserIndex].userID, stock, err))
                {
                    MessageBoxA(hWnd, err.c_str(), "Error", MB_ICONERROR | MB_OK);
                }
                else
                {
                    saveToFile(DEFAULT_DATA_FILE);
                    RefreshAllViews();
                    SetStatus("Removed holding for " + std::string(stock) + ".");
                }
            }
            break;
        }

        case ID_COMBO_RANKINGS_TYPE:
            if (wmEvent == CBN_SELCHANGE)
            {
                int sel = (int)SendMessageA(g_hComboRankType, CB_GETCURSEL, 0, 0);
                g_rankUsersMode = (sel == 0);
                ShowWindow(g_hComboRankUser, g_rankUsersMode ? SW_HIDE : SW_SHOW);
                RefreshRankingsView();
                InvalidateRect(hWnd, NULL, TRUE);
            }
            break;

        case ID_COMBO_RANKINGS_USER:
            if (wmEvent == CBN_SELCHANGE)
            {
                g_selectedRankingUserIndex = (int)SendMessageA(g_hComboRankUser, CB_GETCURSEL, 0, 0);
                RefreshRankingsView();
            }
            break;

        case ID_BTN_RANKING_DIR_DESC:
            g_rankingDescending = true;
            SendMessageA(g_hBtnRankDesc, BM_SETCHECK, BST_CHECKED, 0);
            SendMessageA(g_hBtnRankAsc, BM_SETCHECK, BST_UNCHECKED, 0);
            RefreshRankingsView();
            InvalidateRect(hWnd, NULL, TRUE);
            break;

        case ID_BTN_RANKING_DIR_ASC:
            g_rankingDescending = false;
            SendMessageA(g_hBtnRankDesc, BM_SETCHECK, BST_UNCHECKED, 0);
            SendMessageA(g_hBtnRankAsc, BM_SETCHECK, BST_CHECKED, 0);
            RefreshRankingsView();
            InvalidateRect(hWnd, NULL, TRUE);
            break;

        case ID_BTN_SEARCH_EXECUTE:
        {
            std::string query = GetInputText(g_hEditSearchQuery);
            RefreshSearchResults(query);
            break;
        }

        case ID_BTN_DATA_SAVE:
            if (saveToFile(DEFAULT_DATA_FILE))
            {
                MessageBoxA(hWnd, "All portfolio data saved to disk.", "Saved", MB_ICONINFORMATION | MB_OK);
                RefreshDataView();
            }
            break;

        case ID_BTN_DATA_RELOAD:
            if (MessageBoxA(hWnd, "Reloading from disk will discard any unsaved changes. Proceed?", "Confirm Reload", MB_ICONQUESTION | MB_YESNO) == IDYES)
            {
                loadFromFile(DEFAULT_DATA_FILE);
                RefreshAllViews();
                MessageBoxA(hWnd, "Data reloaded successfully.", "Reload Complete", MB_ICONINFORMATION | MB_OK);
            }
            break;

        case ID_BTN_DATA_EXPORT:
        {
            char szFile[MAX_PATH] = "portfolio_backup.txt";
            OPENFILENAMEA ofn = {0};
            ofn.lStructSize = sizeof(OPENFILENAMEA);
            ofn.hwndOwner = hWnd;
            ofn.lpstrFilter = "Text Files (*.txt)\0*.txt\0All Files (*.*)\0*.*\0";
            ofn.lpstrFile = szFile;
            ofn.nMaxFile = sizeof(szFile);
            ofn.Flags = OFN_PATHMUSTEXIST | OFN_OVERWRITEPROMPT;
            ofn.lpstrDefExt = "txt";

            if (GetSaveFileNameA(&ofn))
            {
                if (saveToFile(szFile))
                {
                    std::string msg = "Data snapshot successfully exported to:\n" + std::string(szFile);
                    MessageBoxA(hWnd, msg.c_str(), "Export Successful", MB_ICONINFORMATION | MB_OK);
                }
                else
                {
                    MessageBoxA(hWnd, "Failed to write backup file.", "Export Error", MB_ICONERROR | MB_OK);
                }
            }
            break;
        }

        case ID_BTN_DATA_RESTORE:
        {
            char szFile[MAX_PATH] = "";
            OPENFILENAMEA ofn = {0};
            ofn.lStructSize = sizeof(OPENFILENAMEA);
            ofn.hwndOwner = hWnd;
            ofn.lpstrFilter = "Text Files (*.txt)\0*.txt\0All Files (*.*)\0*.*\0";
            ofn.lpstrFile = szFile;
            ofn.nMaxFile = sizeof(szFile);
            ofn.Flags = OFN_FILEMUSTEXIST | OFN_PATHMUSTEXIST;

            if (GetOpenFileNameA(&ofn))
            {
                std::string confirm = "Restoring from this file will replace current memory records.\nProceed with restoring:\n" + std::string(szFile) + "?";
                if (MessageBoxA(hWnd, confirm.c_str(), "Confirm Restoration", MB_ICONWARNING | MB_YESNO) == IDYES)
                {
                    if (loadFromFile(szFile))
                    {
                        saveToFile(DEFAULT_DATA_FILE);
                        RefreshAllViews();
                        MessageBoxA(hWnd, "Portfolio data restored successfully!", "Restoration Complete", MB_ICONINFORMATION | MB_OK);
                    }
                    else
                    {
                        MessageBoxA(hWnd, "Invalid or corrupted backup file format.", "Restore Failed", MB_ICONERROR | MB_OK);
                    }
                }
            }
            break;
        }

        default: break;
        }
        return 0;
    }

    case WM_DESTROY:
        PostQuitMessage(0);
        return 0;
    }

    return DefWindowProcA(hWnd, message, wParam, lParam);
}
