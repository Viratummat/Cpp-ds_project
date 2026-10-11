#include "MainWindow.h"
#include <QApplication>
#include <QFrame>
#include <QGroupBox>
#include <QFormLayout>
#include <QDialogButtonBox>
#include <QSplitter>

// Luxury dark fintech QSS stylesheet matching reference
static const char* DARK_THEME_QSS = R"(
    QMainWindow, QWidget {
        background-color: #05060A;
        color: #F8FAFC;
        font-family: 'Segoe UI', 'Inter', sans-serif;
    }
    QFrame#sidebarFrame {
        background-color: #080A12;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
    }
    QPushButton#navBtn {
        background-color: transparent;
        color: #94A3B8;
        border: 1px solid transparent;
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 13px;
        font-weight: 600;
        text-align: left;
    }
    QPushButton#navBtn:hover {
        background-color: rgba(255, 255, 255, 0.04);
        color: #FFFFFF;
    }
    QPushButton#navBtn:checked, QPushButton#navBtn[active="true"] {
        background-color: rgba(168, 85, 247, 0.12);
        color: #C084FC;
        border: 1px solid rgba(168, 85, 247, 0.35);
    }
    QPushButton#actionBtn {
        background-color: rgba(14, 11, 26, 0.9);
        color: #FFFFFF;
        border: 1px solid rgba(192, 132, 252, 0.7);
        border-radius: 20px;
        padding: 8px 18px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 1px;
    }
    QPushButton#actionBtn:hover {
        border-color: #E9D5FF;
        background-color: rgba(168, 85, 247, 0.25);
    }
    QPushButton#secondaryBtn {
        background-color: #121626;
        color: #CBD5E1;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        padding: 7px 14px;
        font-size: 12px;
        font-weight: 600;
    }
    QPushButton#secondaryBtn:hover {
        background-color: #1E2338;
        border-color: rgba(255, 255, 255, 0.25);
        color: #FFFFFF;
    }
    QPushButton#dangerBtn {
        background-color: rgba(225, 29, 72, 0.15);
        color: #FDA4AF;
        border: 1px solid rgba(225, 29, 72, 0.4);
        border-radius: 8px;
        padding: 7px 14px;
        font-size: 12px;
        font-weight: 600;
    }
    QPushButton#dangerBtn:hover {
        background-color: rgba(225, 29, 72, 0.3);
        color: #FFF1F2;
    }
    QFrame#cardFrame {
        background-color: #0A0D18;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
    }
    QTableWidget {
        background-color: #0A0D18;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        gridline-color: rgba(255, 255, 255, 0.04);
        selection-background-color: rgba(168, 85, 247, 0.25);
        selection-color: #FFFFFF;
        font-size: 12.5px;
    }
    QHeaderView::section {
        background-color: #080A12;
        color: #94A3B8;
        padding: 8px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        border: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    QLineEdit, QComboBox, QSpinBox, QDoubleSpinBox {
        background-color: #080A12;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        padding: 6px 10px;
        color: #F8FAFC;
        font-size: 12.5px;
    }
    QLineEdit:focus, QComboBox:focus, QSpinBox:focus, QDoubleSpinBox:focus {
        border-color: #A855F7;
    }
    QRadioButton {
        color: #CBD5E1;
        font-size: 13px;
        spacing: 8px;
    }
    QRadioButton::indicator {
        width: 16px;
        height: 16px;
    }
    QLabel#cardTitle {
        color: #94A3B8;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    QLabel#cardValue {
        color: #FFFFFF;
        font-size: 22px;
        font-weight: 800;
        font-family: 'JetBrains Mono', 'Consolas', monospace;
    }
    QLabel#pageTitle {
        color: #FFFFFF;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.5px;
    }
    QLabel#pageSubtitle {
        color: #94A3B8;
        font-size: 12px;
    }
)";

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
{
    // Auto-load persistent records
    loadFromFile(DEFAULT_DATA_FILE);

    setupUI();
    refreshAll();
}

MainWindow::~MainWindow()
{
    saveToFile(DEFAULT_DATA_FILE);
    cleanupAllMemory();
}

void MainWindow::setupUI()
{
    setWindowTitle("Stock Portfolio Management System (C++ / Qt)");
    resize(1180, 740);
    setStyleSheet(DARK_THEME_QSS);

    QWidget* centralWidget = new QWidget(this);
    setCentralWidget(centralWidget);

    QHBoxLayout* mainLayout = new QHBoxLayout(centralWidget);
    mainLayout->setContentsMargins(0, 0, 0, 0);
    mainLayout->setSpacing(0);

    setupSidebar(mainLayout);

    stackedWidget = new QStackedWidget(this);
    setupPages();
    mainLayout->addWidget(stackedWidget);

    onNavigate(0);
}

void MainWindow::setupSidebar(QHBoxLayout* mainLayout)
{
    QFrame* sidebar = new QFrame(this);
    sidebar->setObjectName("sidebarFrame");
    sidebar->setFixedWidth(220);

    QVBoxLayout* layout = new QVBoxLayout(sidebar);
    layout->setContentsMargins(16, 24, 16, 24);
    layout->setSpacing(8);

    // Brand header
    QLabel* lblLogo = new QLabel("PORTFOLIQ", sidebar);
    lblLogo->setStyleSheet("font-size: 15px; font-weight: 900; letter-spacing: 3px; color: #FFFFFF;");
    layout->addWidget(lblLogo);

    QLabel* lblSub = new QLabel("C++ Qt DSA Edition", sidebar);
    lblSub->setStyleSheet("font-size: 10px; color: #A855F7; font-weight: 600; margin-bottom: 20px;");
    layout->addWidget(lblSub);

    // Nav items
    QStringList navTitles = {
        "Dashboard",
        "Users",
        "Portfolio",
        "Selection Sort",
        "Search",
        "Backup & Data"
    };

    for (int i = 0; i < navTitles.size(); ++i) {
        QPushButton* btn = new QPushButton(navTitles[i], sidebar);
        btn->setObjectName("navBtn");
        btn->setCheckable(true);
        connect(btn, &QPushButton::clicked, [this, i]() {
            onNavigate(i);
        });
        navButtons.append(btn);
        layout->addWidget(btn);
    }

    layout->addStretch();

    // Quick Register Button
    QPushButton* btnQuickAdd = new QPushButton("+ Add User", sidebar);
    btnQuickAdd->setObjectName("actionBtn");
    connect(btnQuickAdd, &QPushButton::clicked, this, &MainWindow::onAddUser);
    layout->addWidget(btnQuickAdd);

    mainLayout->addWidget(sidebar);
}

void MainWindow::setupPages()
{
    stackedWidget->addWidget(createDashboardPage()); // 0
    stackedWidget->addWidget(createUsersPage());     // 1
    stackedWidget->addWidget(createPortfolioPage()); // 2
    stackedWidget->addWidget(createRankingPage());   // 3
    stackedWidget->addWidget(createSearchPage());    // 4
    stackedWidget->addWidget(createDataPage());      // 5
}

void MainWindow::onNavigate(int pageIndex)
{
    stackedWidget->setCurrentIndex(pageIndex);
    for (int i = 0; i < navButtons.size(); ++i) {
        navButtons[i]->setChecked(i == pageIndex);
    }
    refreshAll();
}

// ============================================================
// PAGE CREATION
// ============================================================

QWidget* MainWindow::createDashboardPage()
{
    QWidget* page = new QWidget();
    QVBoxLayout* layout = new QVBoxLayout(page);
    layout->setContentsMargins(32, 28, 32, 28);
    layout->setSpacing(20);

    // Header
    QLabel* title = new QLabel("Dashboard Overview", page);
    title->setObjectName("pageTitle");
    QLabel* subtitle = new QLabel("Consolidated capital telemetry across registered investor portfolios", page);
    subtitle->setObjectName("pageSubtitle");
    layout->addWidget(title);
    layout->addWidget(subtitle);

    // Metric Cards Grid
    QHBoxLayout* cardsLayout = new QHBoxLayout();
    cardsLayout->setSpacing(14);

    auto createCard = [page](const QString& titleText, QLabel*& valLabel) -> QFrame* {
        QFrame* card = new QFrame(page);
        card->setObjectName("cardFrame");
        QVBoxLayout* cl = new QVBoxLayout(card);
        cl->setContentsMargins(18, 16, 18, 16);
        QLabel* t = new QLabel(titleText, card);
        t->setObjectName("cardTitle");
        valLabel = new QLabel("0", card);
        valLabel->setObjectName("cardValue");
        cl->addWidget(t);
        cl->addWidget(valLabel);
        return card;
    };

    cardsLayout->addWidget(createCard("Total Invested", lblTotalInvested));
    cardsLayout->addWidget(createCard("Registered Users", lblTotalUsers));
    cardsLayout->addWidget(createCard("Stock Holdings", lblTotalHoldings));
    cardsLayout->addWidget(createCard("Largest Position", lblTopHolding));

    layout->addLayout(cardsLayout);

    // Top Holdings Table Section
    QLabel* secTitle = new QLabel("Top Stock Holdings Across System", page);
    secTitle->setStyleSheet("font-size: 14px; font-weight: 700; color: #FFFFFF; margin-top: 10px;");
    layout->addWidget(secTitle);

    tableTopHoldings = new QTableWidget(page);
    tableTopHoldings->setColumnCount(5);
    tableTopHoldings->setHorizontalHeaderLabels({"Rank", "User", "Stock", "Quantity", "Total Invested"});
    tableTopHoldings->horizontalHeader()->setSectionResizeMode(QHeaderView::Stretch);
    tableTopHoldings->setEditTriggers(QAbstractItemView::NoEditTriggers);
    tableTopHoldings->setSelectionBehavior(QAbstractItemView::SelectRows);
    layout->addWidget(tableTopHoldings);

    return page;
}

QWidget* MainWindow::createUsersPage()
{
    QWidget* page = new QWidget();
    QVBoxLayout* layout = new QVBoxLayout(page);
    layout->setContentsMargins(32, 28, 32, 28);
    layout->setSpacing(16);

    // Header & Action Bar
    QHBoxLayout* topBar = new QHBoxLayout();
    QVBoxLayout* titleBox = new QVBoxLayout();
    QLabel* title = new QLabel("Investor Profiles", page);
    title->setObjectName("pageTitle");
    QLabel* subtitle = new QLabel("Manage user accounts and view individual portfolio allocations", page);
    subtitle->setObjectName("pageSubtitle");
    titleBox->addWidget(title);
    titleBox->addWidget(subtitle);
    topBar->addLayout(titleBox);

    QPushButton* btnAdd = new QPushButton("+ Register User", page);
    btnAdd->setObjectName("actionBtn");
    connect(btnAdd, &QPushButton::clicked, this, &MainWindow::onAddUser);
    topBar->addWidget(btnAdd);

    layout->addLayout(topBar);

    // Filter and actions
    QHBoxLayout* filterBar = new QHBoxLayout();
    txtSearchUserFilter = new QLineEdit(page);
    txtSearchUserFilter->setPlaceholderText("Filter users by ID or Name...");
    connect(txtSearchUserFilter, &QLineEdit::textChanged, this, &MainWindow::refreshUsersTable);
    filterBar->addWidget(txtSearchUserFilter);

    QPushButton* btnEdit = new QPushButton("Edit Name", page);
    btnEdit->setObjectName("secondaryBtn");
    connect(btnEdit, &QPushButton::clicked, this, &MainWindow::onEditUserName);
    filterBar->addWidget(btnEdit);

    QPushButton* btnDel = new QPushButton("Delete User", page);
    btnDel->setObjectName("dangerBtn");
    connect(btnDel, &QPushButton::clicked, this, &MainWindow::onDeleteUser);
    filterBar->addWidget(btnDel);

    layout->addLayout(filterBar);

    // Table
    tableUsers = new QTableWidget(page);
    tableUsers->setColumnCount(4);
    tableUsers->setHorizontalHeaderLabels({"User ID", "Full Name", "Different Stocks", "Total Invested"});
    tableUsers->horizontalHeader()->setSectionResizeMode(QHeaderView::Stretch);
    tableUsers->setEditTriggers(QAbstractItemView::NoEditTriggers);
    tableUsers->setSelectionBehavior(QAbstractItemView::SelectRows);
    connect(tableUsers, &QTableWidget::cellDoubleClicked, this, &MainWindow::onUserTableDoubleClicked);
    layout->addWidget(tableUsers);

    return page;
}

QWidget* MainWindow::createPortfolioPage()
{
    QWidget* page = new QWidget();
    QVBoxLayout* layout = new QVBoxLayout(page);
    layout->setContentsMargins(32, 28, 32, 28);
    layout->setSpacing(16);

    // Header & User Selector
    QHBoxLayout* topBar = new QHBoxLayout();
    QVBoxLayout* titleBox = new QVBoxLayout();
    QLabel* title = new QLabel("Portfolio Tracker", page);
    title->setObjectName("pageTitle");
    QLabel* subtitle = new QLabel("Holdings ledger with automatic weighted-average price merging", page);
    subtitle->setObjectName("pageSubtitle");
    titleBox->addWidget(title);
    titleBox->addWidget(subtitle);
    topBar->addLayout(titleBox);

    comboPortfolioUsers = new QComboBox(page);
    comboPortfolioUsers->setMinimumWidth(220);
    connect(comboPortfolioUsers, QOverload<int>::of(&QComboBox::currentIndexChanged), this, &MainWindow::onPortfolioUserChanged);
    topBar->addWidget(comboPortfolioUsers);

    QPushButton* btnAddStock = new QPushButton("+ Add Stock", page);
    btnAddStock->setObjectName("actionBtn");
    connect(btnAddStock, &QPushButton::clicked, this, &MainWindow::onAddInvestment);
    topBar->addWidget(btnAddStock);

    layout->addLayout(topBar);

    // User Summary Bar
    QFrame* summaryCard = new QFrame(page);
    summaryCard->setObjectName("cardFrame");
    QHBoxLayout* sl = new QHBoxLayout(summaryCard);
    sl->setContentsMargins(18, 12, 18, 12);

    lblPortfolioUserName = new QLabel("Investor: None", summaryCard);
    lblPortfolioUserName->setStyleSheet("font-weight: 700; color: #FFFFFF; font-size: 14px;");
    lblPortfolioTotal = new QLabel("Total: Rs. 0.00", summaryCard);
    lblPortfolioTotal->setStyleSheet("font-weight: 800; color: #A855F7; font-size: 15px;");
    lblPortfolioCount = new QLabel("Holdings: 0", summaryCard);
    lblPortfolioCount->setStyleSheet("font-weight: 600; color: #94A3B8;");

    sl->addWidget(lblPortfolioUserName);
    sl->addStretch();
    sl->addWidget(lblPortfolioCount);
    sl->addWidget(lblPortfolioTotal);
    layout->addWidget(summaryCard);

    // Filter & Holding Action Buttons
    QHBoxLayout* holdingActions = new QHBoxLayout();
    txtPortfolioFilter = new QLineEdit(page);
    txtPortfolioFilter->setPlaceholderText("Filter stocks in portfolio...");
    connect(txtPortfolioFilter, &QLineEdit::textChanged, this, &MainWindow::refreshPortfolioView);
    holdingActions->addWidget(txtPortfolioFilter);

    QPushButton* btnEditStock = new QPushButton("Edit Holding", page);
    btnEditStock->setObjectName("secondaryBtn");
    connect(btnEditStock, &QPushButton::clicked, this, &MainWindow::onEditInvestment);
    holdingActions->addWidget(btnEditStock);

    QPushButton* btnDelStock = new QPushButton("Delete Holding", page);
    btnDelStock->setObjectName("dangerBtn");
    connect(btnDelStock, &QPushButton::clicked, this, &MainWindow::onDeleteInvestment);
    holdingActions->addWidget(btnDelStock);

    layout->addLayout(holdingActions);

    // Table
    tablePortfolioHoldings = new QTableWidget(page);
    tablePortfolioHoldings->setColumnCount(5);
    tablePortfolioHoldings->setHorizontalHeaderLabels({"Stock", "Quantity", "Avg Purchase Price", "Total Invested", "Allocation (%)"});
    tablePortfolioHoldings->horizontalHeader()->setSectionResizeMode(QHeaderView::Stretch);
    tablePortfolioHoldings->setEditTriggers(QAbstractItemView::NoEditTriggers);
    tablePortfolioHoldings->setSelectionBehavior(QAbstractItemView::SelectRows);
    layout->addWidget(tablePortfolioHoldings);

    return page;
}

QWidget* MainWindow::createRankingPage()
{
    QWidget* page = new QWidget();
    QVBoxLayout* layout = new QVBoxLayout(page);
    layout->setContentsMargins(32, 28, 32, 28);
    layout->setSpacing(16);

    // Header
    QHBoxLayout* topBar = new QHBoxLayout();
    QVBoxLayout* titleBox = new QVBoxLayout();
    QLabel* title = new QLabel("Investment Ranking", page);
    title->setObjectName("pageTitle");
    QLabel* subtitle = new QLabel("Dual-direction sorting powered by custom Selection Sort algorithm", page);
    subtitle->setObjectName("pageSubtitle");
    titleBox->addWidget(title);
    titleBox->addWidget(subtitle);
    topBar->addLayout(titleBox);

    comboRankingUsers = new QComboBox(page);
    comboRankingUsers->setMinimumWidth(220);
    connect(comboRankingUsers, QOverload<int>::of(&QComboBox::currentIndexChanged), this, &MainWindow::onRankingUserChanged);
    topBar->addWidget(comboRankingUsers);

    layout->addLayout(topBar);

    // Sorting Direction Controls
    QFrame* controlCard = new QFrame(page);
    controlCard->setObjectName("cardFrame");
    QHBoxLayout* cl = new QHBoxLayout(controlCard);
    cl->setContentsMargins(18, 12, 18, 12);

    QLabel* sortLabel = new QLabel("Sort Direction:", controlCard);
    sortLabel->setStyleSheet("font-weight: 700; color: #FFFFFF;");
    cl->addWidget(sortLabel);

    radioDescending = new QRadioButton("Descending (Highest to Lowest)", controlCard);
    radioAscending = new QRadioButton("Ascending (Lowest to Highest)", controlCard);
    radioDescending->setChecked(true);

    connect(radioDescending, &QRadioButton::toggled, this, &MainWindow::onRankingDirectionChanged);
    connect(radioAscending, &QRadioButton::toggled, this, &MainWindow::onRankingDirectionChanged);

    cl->addWidget(radioDescending);
    cl->addWidget(radioAscending);
    cl->addStretch();

    lblRankingTotal = new QLabel("Portfolio: Rs. 0.00", controlCard);
    lblRankingTotal->setStyleSheet("font-weight: 800; color: #C084FC; font-size: 14px;");
    cl->addWidget(lblRankingTotal);

    layout->addWidget(controlCard);

    // Highest / Lowest Highlights
    QHBoxLayout* hl = new QHBoxLayout();
    lblHighestInvestment = new QLabel("Highest Investment: None", page);
    lblHighestInvestment->setStyleSheet("font-weight: 700; color: #34D399; font-size: 12px;");
    lblLowestInvestment = new QLabel("Lowest Investment: None", page);
    lblLowestInvestment->setStyleSheet("font-weight: 700; color: #F59E0B; font-size: 12px;");
    hl->addWidget(lblHighestInvestment);
    hl->addStretch();
    hl->addWidget(lblLowestInvestment);
    layout->addLayout(hl);

    // Table
    tableRanking = new QTableWidget(page);
    tableRanking->setColumnCount(6);
    tableRanking->setHorizontalHeaderLabels({"Rank", "Stock", "Quantity", "Avg Price", "Total Invested", "Allocation (%)"});
    tableRanking->horizontalHeader()->setSectionResizeMode(QHeaderView::Stretch);
    tableRanking->setEditTriggers(QAbstractItemView::NoEditTriggers);
    tableRanking->setSelectionBehavior(QAbstractItemView::SelectRows);
    layout->addWidget(tableRanking);

    return page;
}

QWidget* MainWindow::createSearchPage()
{
    QWidget* page = new QWidget();
    QVBoxLayout* layout = new QVBoxLayout(page);
    layout->setContentsMargins(32, 28, 32, 28);
    layout->setSpacing(20);

    QLabel* title = new QLabel("Search Operations", page);
    title->setObjectName("pageTitle");
    QLabel* subtitle = new QLabel("Locate user accounts by unique User ID using linear search algorithm", page);
    subtitle->setObjectName("pageSubtitle");
    layout->addWidget(title);
    layout->addWidget(subtitle);

    // Search Input Bar
    QHBoxLayout* bar = new QHBoxLayout();
    txtSearchUserId = new QLineEdit(page);
    txtSearchUserId->setPlaceholderText("Enter User ID to search (e.g. USR01)...");
    bar->addWidget(txtSearchUserId);

    QPushButton* btnFind = new QPushButton("Search User", page);
    btnFind->setObjectName("actionBtn");
    connect(btnFind, &QPushButton::clicked, this, &MainWindow::onSearchUser);
    bar->addWidget(btnFind);
    layout->addLayout(bar);

    // Result Card
    widgetSearchResult = new QFrame(page);
    widgetSearchResult->setObjectName("cardFrame");
    QVBoxLayout* rl = new QVBoxLayout(widgetSearchResult);
    rl->setContentsMargins(24, 20, 24, 20);
    rl->setSpacing(10);

    QLabel* rHeader = new QLabel("USER SEARCH RESULT", widgetSearchResult);
    rHeader->setStyleSheet("font-size: 12px; font-weight: 800; color: #A855F7; letter-spacing: 1px;");
    rl->addWidget(rHeader);

    lblSearchResultId = new QLabel("User ID: -", widgetSearchResult);
    lblSearchResultName = new QLabel("Name: -", widgetSearchResult);
    lblSearchResultStocks = new QLabel("Stock Count: 0", widgetSearchResult);
    lblSearchResultTotal = new QLabel("Total Investment: Rs. 0.00", widgetSearchResult);

    lblSearchResultId->setStyleSheet("font-size: 14px; font-weight: 700; color: #FFFFFF;");
    lblSearchResultName->setStyleSheet("font-size: 14px; color: #E2E8F0;");
    lblSearchResultStocks->setStyleSheet("font-size: 14px; color: #94A3B8;");
    lblSearchResultTotal->setStyleSheet("font-size: 16px; font-weight: 800; color: #34D399;");

    rl->addWidget(lblSearchResultId);
    rl->addWidget(lblSearchResultName);
    rl->addWidget(lblSearchResultStocks);
    rl->addWidget(lblSearchResultTotal);

    widgetSearchResult->setVisible(false);
    layout->addWidget(widgetSearchResult);

    layout->addStretch();
    return page;
}

QWidget* MainWindow::createDataPage()
{
    QWidget* page = new QWidget();
    QVBoxLayout* layout = new QVBoxLayout(page);
    layout->setContentsMargins(32, 28, 32, 28);
    layout->setSpacing(20);

    QLabel* title = new QLabel("Data Persistence & Backup", page);
    title->setObjectName("pageTitle");
    QLabel* subtitle = new QLabel("Local disk serialization and backup recovery management", page);
    subtitle->setObjectName("pageSubtitle");
    layout->addWidget(title);
    layout->addWidget(subtitle);

    // Telemetry Card
    QFrame* statusCard = new QFrame(page);
    statusCard->setObjectName("cardFrame");
    QVBoxLayout* sl = new QVBoxLayout(statusCard);
    sl->setContentsMargins(20, 16, 20, 16);
    sl->setSpacing(8);

    lblStorageStatus = new QLabel("Storage Status: Active (portfolio_data.txt)", statusCard);
    lblStorageStatus->setStyleSheet("font-size: 13px; font-weight: 700; color: #34D399;");
    lblFileUsersCount = new QLabel("Active User Accounts: 0", statusCard);
    lblFileHoldingsCount = new QLabel("Total Stock Holdings: 0", statusCard);

    sl->addWidget(lblStorageStatus);
    sl->addWidget(lblFileUsersCount);
    sl->addWidget(lblFileHoldingsCount);
    layout->addWidget(statusCard);

    // Actions Grid
    QHBoxLayout* btns = new QHBoxLayout();
    QPushButton* btnSave = new QPushButton("Save Now", page);
    btnSave->setObjectName("secondaryBtn");
    connect(btnSave, &QPushButton::clicked, this, &MainWindow::onSaveData);

    QPushButton* btnReload = new QPushButton("Reload from Disk", page);
    btnReload->setObjectName("secondaryBtn");
    connect(btnReload, &QPushButton::clicked, this, &MainWindow::onReloadData);

    QPushButton* btnExport = new QPushButton("Export Backup File", page);
    btnExport->setObjectName("actionBtn");
    connect(btnExport, &QPushButton::clicked, this, &MainWindow::onExportBackup);

    QPushButton* btnRestore = new QPushButton("Restore Backup File", page);
    btnRestore->setObjectName("dangerBtn");
    connect(btnRestore, &QPushButton::clicked, this, &MainWindow::onRestoreBackup);

    btns->addWidget(btnSave);
    btns->addWidget(btnReload);
    btns->addWidget(btnExport);
    btns->addWidget(btnRestore);
    layout->addLayout(btns);

    layout->addStretch();
    return page;
}

// ============================================================
// DATA REFRESH LOGIC
// ============================================================

void MainWindow::refreshAll()
{
    refreshDashboard();
    refreshUsersTable();
    refreshUserDropdowns();
    refreshPortfolioView();
    refreshRankingView();
}

void MainWindow::refreshDashboard()
{
    double grandTotal = 0.0;
    int totalHoldings = 0;
    string largestStock = "None";
    double largestAmount = 0.0;
    string largestUser = "";

    struct FlattenedHolding {
        string userName;
        string stockName;
        int qty;
        double total;
    };
    QList<FlattenedHolding> allHoldings;

    for (int i = 0; i < userCount; ++i) {
        double uTotal = calculateTotal(users[i]);
        grandTotal += uTotal;
        totalHoldings += countHoldings(users[i]);

        Investment* curr = users[i].head;
        while (curr != nullptr) {
            allHoldings.append({users[i].name, curr->stockName, curr->quantity, curr->totalInvested});
            if (curr->totalInvested > largestAmount) {
                largestAmount = curr->totalInvested;
                largestStock = curr->stockName;
                largestUser = users[i].name;
            }
            curr = curr->next;
        }
    }

    lblTotalInvested->setText(QString::fromStdString(formatCurrency(grandTotal)));
    lblTotalUsers->setText(QString::number(userCount));
    lblTotalHoldings->setText(QString::number(totalHoldings));

    if (largestAmount > 0.0) {
        lblTopHolding->setText(QString::fromStdString(largestStock + " (" + formatCurrency(largestAmount) + ")"));
    } else {
        lblTopHolding->setText("None");
    }

    // Top holdings table (Selection sort top 5)
    int n = allHoldings.size();
    for (int i = 0; i < qMin(5, n); ++i) {
        int maxIdx = i;
        for (int j = i + 1; j < n; ++j) {
            if (allHoldings[j].total > allHoldings[maxIdx].total) {
                maxIdx = j;
            }
        }
        if (maxIdx != i) {
            auto temp = allHoldings[i];
            allHoldings[i] = allHoldings[maxIdx];
            allHoldings[maxIdx] = temp;
        }
    }

    int rowsToShow = qMin(5, n);
    tableTopHoldings->setRowCount(rowsToShow);
    for (int r = 0; r < rowsToShow; ++r) {
        tableTopHoldings->setItem(r, 0, new QTableWidgetItem(QString("#%1").arg(r + 1)));
        tableTopHoldings->setItem(r, 1, new QTableWidgetItem(QString::fromStdString(allHoldings[r].userName)));
        tableTopHoldings->setItem(r, 2, new QTableWidgetItem(QString::fromStdString(allHoldings[r].stockName)));
        tableTopHoldings->setItem(r, 3, new QTableWidgetItem(QString::number(allHoldings[r].qty)));
        tableTopHoldings->setItem(r, 4, new QTableWidgetItem(QString::fromStdString(formatCurrency(allHoldings[r].total))));
    }

    // Data page telemetry
    lblFileUsersCount->setText(QString("Active User Accounts: %1").arg(userCount));
    lblFileHoldingsCount->setText(QString("Total Stock Holdings: %1").arg(totalHoldings));
}

void MainWindow::refreshUsersTable()
{
    QString filter = txtSearchUserFilter->text().trimmed().toLower();
    QList<int> matchedIndices;

    for (int i = 0; i < userCount; ++i) {
        QString uid = QString::fromStdString(users[i].userID).toLower();
        QString uname = QString::fromStdString(users[i].name).toLower();
        if (filter.isEmpty() || uid.contains(filter) || uname.contains(filter)) {
            matchedIndices.append(i);
        }
    }

    tableUsers->setRowCount(matchedIndices.size());
    for (int r = 0; r < matchedIndices.size(); ++r) {
        int idx = matchedIndices[r];
        int count = countHoldings(users[idx]);
        double total = calculateTotal(users[idx]);

        tableUsers->setItem(r, 0, new QTableWidgetItem(QString::fromStdString(users[idx].userID)));
        tableUsers->setItem(r, 1, new QTableWidgetItem(QString::fromStdString(users[idx].name)));
        tableUsers->setItem(r, 2, new QTableWidgetItem(QString::number(count)));
        tableUsers->setItem(r, 3, new QTableWidgetItem(QString::fromStdString(formatCurrency(total))));
    }
}

void MainWindow::refreshUserDropdowns()
{
    QString prevPortfolio = comboPortfolioUsers->currentData().toString();
    QString prevRanking = comboRankingUsers->currentData().toString();

    comboPortfolioUsers->blockSignals(true);
    comboRankingUsers->blockSignals(true);

    comboPortfolioUsers->clear();
    comboRankingUsers->clear();

    for (int i = 0; i < userCount; ++i) {
        QString itemText = QString("%1 (%2)").arg(QString::fromStdString(users[i].name), QString::fromStdString(users[i].userID));
        QString uid = QString::fromStdString(users[i].userID);
        comboPortfolioUsers->addItem(itemText, uid);
        comboRankingUsers->addItem(itemText, uid);
    }

    int pIdx = comboPortfolioUsers->findData(prevPortfolio);
    if (pIdx != -1) comboPortfolioUsers->setCurrentIndex(pIdx);

    int rIdx = comboRankingUsers->findData(prevRanking);
    if (rIdx != -1) comboRankingUsers->setCurrentIndex(rIdx);

    comboPortfolioUsers->blockSignals(false);
    comboRankingUsers->blockSignals(false);
}

void MainWindow::refreshPortfolioView()
{
    int curr = comboPortfolioUsers->currentIndex();
    if (curr < 0 || curr >= userCount) {
        lblPortfolioUserName->setText("Investor: None");
        lblPortfolioTotal->setText("Total: Rs. 0.00");
        lblPortfolioCount->setText("Holdings: 0");
        tablePortfolioHoldings->setRowCount(0);
        return;
    }

    User& user = users[curr];
    double totalPortfolio = calculateTotal(user);
    int holdingsCount = countHoldings(user);

    lblPortfolioUserName->setText(QString("Investor: %1 (%2)").arg(QString::fromStdString(user.name), QString::fromStdString(user.userID)));
    lblPortfolioTotal->setText(QString::fromStdString(formatCurrency(totalPortfolio)));
    lblPortfolioCount->setText(QString("Holdings: %1").arg(holdingsCount));

    QString filter = txtPortfolioFilter->text().trimmed().toUpper();

    QList<Investment*> matched;
    Investment* c = user.head;
    while (c != nullptr) {
        if (filter.isEmpty() || QString::fromStdString(c->stockName).contains(filter)) {
            matched.append(c);
        }
        c = c->next;
    }

    tablePortfolioHoldings->setRowCount(matched.size());
    for (int r = 0; r < matched.size(); ++r) {
        double alloc = (totalPortfolio > 0.0) ? (matched[r]->totalInvested / totalPortfolio) * 100.0 : 0.0;
        tablePortfolioHoldings->setItem(r, 0, new QTableWidgetItem(QString::fromStdString(matched[r]->stockName)));
        tablePortfolioHoldings->setItem(r, 1, new QTableWidgetItem(QString::number(matched[r]->quantity)));
        tablePortfolioHoldings->setItem(r, 2, new QTableWidgetItem(QString::fromStdString(formatCurrency(matched[r]->price))));
        tablePortfolioHoldings->setItem(r, 3, new QTableWidgetItem(QString::fromStdString(formatCurrency(matched[r]->totalInvested))));
        tablePortfolioHoldings->setItem(r, 4, new QTableWidgetItem(QString::number(alloc, 'f', 2) + "%"));
    }
}

void MainWindow::refreshRankingView()
{
    int curr = comboRankingUsers->currentIndex();
    if (curr < 0 || curr >= userCount || users[curr].head == nullptr) {
        lblRankingTotal->setText("Portfolio: Rs. 0.00");
        lblHighestInvestment->setText("Highest Investment: None");
        lblLowestInvestment->setText("Lowest Investment: None");
        tableRanking->setRowCount(0);
        return;
    }

    User& user = users[curr];
    double totalPortfolio = calculateTotal(user);
    lblRankingTotal->setText(QString::fromStdString(formatCurrency(totalPortfolio)));

    bool desc = radioDescending->isChecked();

    // Deep copy linked list to preserve user's portfolio order
    Investment* copyHead = copyList(user.head);
    selectionSort(copyHead, desc);

    QList<Investment*> sortedList;
    Investment* node = copyHead;
    Investment* maxNode = nullptr;
    Investment* minNode = nullptr;

    while (node != nullptr) {
        sortedList.append(node);
        if (!maxNode || node->totalInvested > maxNode->totalInvested) maxNode = node;
        if (!minNode || node->totalInvested < minNode->totalInvested) minNode = node;
        node = node->next;
    }

    if (maxNode) {
        lblHighestInvestment->setText(QString("Highest Investment: %1 (%2)").arg(
            QString::fromStdString(maxNode->stockName), QString::fromStdString(formatCurrency(maxNode->totalInvested))));
    }
    if (minNode) {
        lblLowestInvestment->setText(QString("Lowest Investment: %1 (%2)").arg(
            QString::fromStdString(minNode->stockName), QString::fromStdString(formatCurrency(minNode->totalInvested))));
    }

    tableRanking->setRowCount(sortedList.size());
    for (int r = 0; r < sortedList.size(); ++r) {
        double alloc = (totalPortfolio > 0.0) ? (sortedList[r]->totalInvested / totalPortfolio) * 100.0 : 0.0;
        tableRanking->setItem(r, 0, new QTableWidgetItem(QString("#%1").arg(r + 1)));
        tableRanking->setItem(r, 1, new QTableWidgetItem(QString::fromStdString(sortedList[r]->stockName)));
        tableRanking->setItem(r, 2, new QTableWidgetItem(QString::number(sortedList[r]->quantity)));
        tableRanking->setItem(r, 3, new QTableWidgetItem(QString::fromStdString(formatCurrency(sortedList[r]->price))));
        tableRanking->setItem(r, 4, new QTableWidgetItem(QString::fromStdString(formatCurrency(sortedList[r]->totalInvested))));
        tableRanking->setItem(r, 5, new QTableWidgetItem(QString::number(alloc, 'f', 2) + "%"));
    }

    clearInvestments(copyHead);
}

// ============================================================
// USER SLOTS
// ============================================================

void MainWindow::onAddUser()
{
    QDialog dlg(this);
    dlg.setWindowTitle("Register New User");
    dlg.setStyleSheet(DARK_THEME_QSS);
    dlg.setFixedWidth(360);

    QFormLayout form(&dlg);
    QLineEdit txtId(&dlg);
    txtId.setPlaceholderText("Enter unique User ID");
    QLineEdit txtName(&dlg);
    txtName.setPlaceholderText("Enter full name");

    form.addRow("User ID:", &txtId);
    form.addRow("Full Name:", &txtName);

    QDialogButtonBox btns(QDialogButtonBox::Ok | QDialogButtonBox::Cancel, Qt::Horizontal, &dlg);
    form.addRow(&btns);
    connect(&btns, &QDialogButtonBox::accepted, &dlg, &QDialog::accept);
    connect(&btns, &QDialogButtonBox::rejected, &dlg, &QDialog::reject);

    if (dlg.exec() == QDialog::Accepted) {
        string id = txtId.text().trimmed().toStdString();
        string name = txtName.text().trimmed().toStdString();
        string err;

        if (registerUserCore(id, name, err)) {
            QMessageBox::information(this, "Success", QString("User \"%1\" registered successfully.").arg(QString::fromStdString(name)));
            refreshAll();
        } else {
            QMessageBox::warning(this, "Error", QString::fromStdString(err));
        }
    }
}

void MainWindow::onEditUserName()
{
    int row = tableUsers->currentRow();
    if (row < 0) {
        QMessageBox::information(this, "Notice", "Please select a user from the table to edit.");
        return;
    }

    string id = tableUsers->item(row, 0)->text().toStdString();
    string currName = tableUsers->item(row, 1)->text().toStdString();

    QDialog dlg(this);
    dlg.setWindowTitle("Edit User Name");
    dlg.setStyleSheet(DARK_THEME_QSS);
    dlg.setFixedWidth(360);

    QFormLayout form(&dlg);
    QLabel lblId(QString::fromStdString("User ID: " + id), &dlg);
    QLineEdit txtName(QString::fromStdString(currName), &dlg);

    form.addRow(&lblId);
    form.addRow("New Full Name:", &txtName);

    QDialogButtonBox btns(QDialogButtonBox::Ok | QDialogButtonBox::Cancel, Qt::Horizontal, &dlg);
    form.addRow(&btns);
    connect(&btns, &QDialogButtonBox::accepted, &dlg, &QDialog::accept);
    connect(&btns, &QDialogButtonBox::rejected, &dlg, &QDialog::reject);

    if (dlg.exec() == QDialog::Accepted) {
        string newName = txtName.text().trimmed().toStdString();
        string err;
        if (editUserNameCore(id, newName, err)) {
            QMessageBox::information(this, "Success", "User name updated successfully.");
            refreshAll();
        } else {
            QMessageBox::warning(this, "Error", QString::fromStdString(err));
        }
    }
}

void MainWindow::onDeleteUser()
{
    int row = tableUsers->currentRow();
    if (row < 0) {
        QMessageBox::information(this, "Notice", "Please select a user from the table to delete.");
        return;
    }

    string id = tableUsers->item(row, 0)->text().toStdString();
    string name = tableUsers->item(row, 1)->text().toStdString();

    auto reply = QMessageBox::question(this, "Confirm Deletion",
        QString("Are you sure you want to permanently delete user \"%1\" (ID: %2) and all their stock holdings?").arg(QString::fromStdString(name), QString::fromStdString(id)),
        QMessageBox::Yes | QMessageBox::No);

    if (reply == QMessageBox::Yes) {
        string err;
        if (deleteUserCore(id, err)) {
            QMessageBox::information(this, "Success", "User deleted successfully.");
            refreshAll();
        } else {
            QMessageBox::warning(this, "Error", QString::fromStdString(err));
        }
    }
}

void MainWindow::onUserTableDoubleClicked(int row, int /*col*/)
{
    if (row >= 0) {
        string uid = tableUsers->item(row, 0)->text().toStdString();
        int pIdx = comboPortfolioUsers->findData(QString::fromStdString(uid));
        if (pIdx != -1) comboPortfolioUsers->setCurrentIndex(pIdx);
        onNavigate(2); // Jump to Portfolio tab
    }
}

void MainWindow::onSearchUser()
{
    string id = txtSearchUserId->text().trimmed().toStdString();
    if (id.empty()) {
        QMessageBox::information(this, "Notice", "Please enter a User ID to search.");
        return;
    }

    int idx = findUser(id);
    if (idx == -1) {
        widgetSearchResult->setVisible(false);
        QMessageBox::information(this, "Not Found", "User not found.");
        return;
    }

    User& u = users[idx];
    lblSearchResultId->setText(QString::fromStdString("User ID: " + u.userID));
    lblSearchResultName->setText(QString::fromStdString("Full Name: " + u.name));
    lblSearchResultStocks->setText(QString("Different Stocks: %1").arg(countHoldings(u)));
    lblSearchResultTotal->setText(QString::fromStdString("Total Investment: " + formatCurrency(calculateTotal(u))));
    widgetSearchResult->setVisible(true);
}

// ============================================================
// INVESTMENT SLOTS
// ============================================================

void MainWindow::onAddInvestment()
{
    int uIdx = comboPortfolioUsers->currentIndex();
    if (uIdx < 0 || uIdx >= userCount) {
        QMessageBox::warning(this, "Notice", "Please register and select a user first.");
        return;
    }

    string uid = users[uIdx].userID;

    QDialog dlg(this);
    dlg.setWindowTitle("Add Stock Investment");
    dlg.setStyleSheet(DARK_THEME_QSS);
    dlg.setFixedWidth(380);

    QFormLayout form(&dlg);
    QLineEdit txtStock(&dlg);
    txtStock.setPlaceholderText("e.g. TCS, RELIANCE");
    QSpinBox spinQty(&dlg);
    spinQty.setRange(1, 10000000);
    spinQty.setValue(10);
    QDoubleSpinBox spinPrice(&dlg);
    spinPrice.setRange(0.01, 100000000.0);
    spinPrice.setDecimals(2);
    spinPrice.setValue(1000.00);

    form.addRow("Stock Symbol:", &txtStock);
    form.addRow("Quantity:", &spinQty);
    form.addRow("Price per Share (Rs):", &spinPrice);

    QDialogButtonBox btns(QDialogButtonBox::Ok | QDialogButtonBox::Cancel, Qt::Horizontal, &dlg);
    form.addRow(&btns);
    connect(&btns, &QDialogButtonBox::accepted, &dlg, &QDialog::accept);
    connect(&btns, &QDialogButtonBox::rejected, &dlg, &QDialog::reject);

    if (dlg.exec() == QDialog::Accepted) {
        string stock = txtStock.text().trimmed().toUpper().toStdString();
        int qty = spinQty.value();
        double prc = spinPrice.value();
        string msg, err;

        if (addInvestmentCore(uid, stock, qty, prc, msg, err)) {
            QMessageBox::information(this, "Success", QString::fromStdString(msg));
            refreshAll();
        } else {
            QMessageBox::warning(this, "Error", QString::fromStdString(err));
        }
    }
}

void MainWindow::onEditInvestment()
{
    int uIdx = comboPortfolioUsers->currentIndex();
    int row = tablePortfolioHoldings->currentRow();
    if (uIdx < 0 || row < 0) {
        QMessageBox::information(this, "Notice", "Please select a holding row from the table to edit.");
        return;
    }

    string uid = users[uIdx].userID;
    string stock = tablePortfolioHoldings->item(row, 0)->text().toStdString();
    int currQty = tablePortfolioHoldings->item(row, 1)->text().toInt();

    QDialog dlg(this);
    dlg.setWindowTitle("Edit Holding: " + QString::fromStdString(stock));
    dlg.setStyleSheet(DARK_THEME_QSS);
    dlg.setFixedWidth(360);

    QFormLayout form(&dlg);
    QSpinBox spinQty(&dlg);
    spinQty.setRange(1, 10000000);
    spinQty.setValue(currQty);
    QDoubleSpinBox spinPrice(&dlg);
    spinPrice.setRange(0.01, 100000000.0);
    spinPrice.setDecimals(2);
    spinPrice.setValue(100.0);

    form.addRow("New Quantity:", &spinQty);
    form.addRow("New Average Price:", &spinPrice);

    QDialogButtonBox btns(QDialogButtonBox::Ok | QDialogButtonBox::Cancel, Qt::Horizontal, &dlg);
    form.addRow(&btns);
    connect(&btns, &QDialogButtonBox::accepted, &dlg, &QDialog::accept);
    connect(&btns, &QDialogButtonBox::rejected, &dlg, &QDialog::reject);

    if (dlg.exec() == QDialog::Accepted) {
        string err;
        if (editInvestmentCore(uid, stock, spinQty.value(), spinPrice.value(), err)) {
            QMessageBox::information(this, "Success", "Stock holding updated successfully.");
            refreshAll();
        } else {
            QMessageBox::warning(this, "Error", QString::fromStdString(err));
        }
    }
}

void MainWindow::onDeleteInvestment()
{
    int uIdx = comboPortfolioUsers->currentIndex();
    int row = tablePortfolioHoldings->currentRow();
    if (uIdx < 0 || row < 0) {
        QMessageBox::information(this, "Notice", "Please select a holding row from the table to delete.");
        return;
    }

    string uid = users[uIdx].userID;
    string stock = tablePortfolioHoldings->item(row, 0)->text().toStdString();

    auto reply = QMessageBox::question(this, "Confirm Removal",
        QString("Are you sure you want to remove stock \"%1\" from the portfolio?").arg(QString::fromStdString(stock)),
        QMessageBox::Yes | QMessageBox::No);

    if (reply == QMessageBox::Yes) {
        string err;
        if (deleteInvestmentCore(uid, stock, err)) {
            QMessageBox::information(this, "Success", "Holding removed from portfolio.");
            refreshAll();
        } else {
            QMessageBox::warning(this, "Error", QString::fromStdString(err));
        }
    }
}

void MainWindow::onPortfolioUserChanged(int /*index*/)
{
    refreshPortfolioView();
}

void MainWindow::onRankingUserChanged(int /*index*/)
{
    refreshRankingView();
}

void MainWindow::onRankingDirectionChanged()
{
    refreshRankingView();
}

// ============================================================
// DATA PERSISTENCE SLOTS
// ============================================================

void MainWindow::onSaveData()
{
    if (saveToFile(DEFAULT_DATA_FILE)) {
        QMessageBox::information(this, "Success", "Portfolio data saved successfully to " + QString::fromStdString(DEFAULT_DATA_FILE));
    } else {
        QMessageBox::warning(this, "Error", "Failed to save data.");
    }
}

void MainWindow::onReloadData()
{
    if (loadFromFile(DEFAULT_DATA_FILE)) {
        QMessageBox::information(this, "Success", QString("Data reloaded from disk. Loaded %1 users.").arg(userCount));
        refreshAll();
    } else {
        QMessageBox::warning(this, "Info", "No saved data found or unable to load.");
    }
}

void MainWindow::onExportBackup()
{
    QString fileName = QFileDialog::getSaveFileName(this, "Export Portfolio Backup", "portfolio_backup.txt", "Text Files (*.txt);;All Files (*)");
    if (!fileName.isEmpty()) {
        if (saveToFile(fileName.toStdString())) {
            QMessageBox::information(this, "Success", "Backup exported successfully to: " + fileName);
        } else {
            QMessageBox::warning(this, "Error", "Failed to write backup file.");
        }
    }
}

void MainWindow::onRestoreBackup()
{
    QString fileName = QFileDialog::getOpenFileName(this, "Restore Portfolio Backup", "", "Text Files (*.txt);;All Files (*)");
    if (!fileName.isEmpty()) {
        auto reply = QMessageBox::question(this, "Confirm Restore",
            "Restoring will overwrite current data. Are you sure you want to proceed?",
            QMessageBox::Yes | QMessageBox::No);

        if (reply == QMessageBox::Yes) {
            if (loadFromFile(fileName.toStdString())) {
                saveToFile(DEFAULT_DATA_FILE);
                QMessageBox::information(this, "Success", QString("Backup restored successfully. Loaded %1 users.").arg(userCount));
                refreshAll();
            } else {
                QMessageBox::warning(this, "Error", "Failed to restore backup file. Format may be invalid.");
            }
        }
    }
}
