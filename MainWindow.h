#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QStackedWidget>
#include <QTableWidget>
#include <QPushButton>
#include <QLabel>
#include <QLineEdit>
#include <QComboBox>
#include <QRadioButton>
#include <QButtonGroup>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QHeaderView>
#include <QMessageBox>
#include <QDialog>
#include <QFileDialog>
#include <QDoubleSpinBox>
#include <QSpinBox>
#include "Portfolio.h"

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    // Navigation
    void onNavigate(int pageIndex);

    // User Operations
    void onAddUser();
    void onEditUserName();
    void onDeleteUser();
    void onSearchUser();
    void onUserTableDoubleClicked(int row, int col);

    // Investment Operations
    void onAddInvestment();
    void onEditInvestment();
    void onDeleteInvestment();
    void onPortfolioUserChanged(int index);

    // Ranking Operations
    void onRankingUserChanged(int index);
    void onRankingDirectionChanged();

    // Data Management
    void onSaveData();
    void onReloadData();
    void onExportBackup();
    void onRestoreBackup();

private:
    // UI Setup Helpers
    void setupUI();
    void setupSidebar(QHBoxLayout* mainLayout);
    void setupPages();
    QWidget* createDashboardPage();
    QWidget* createUsersPage();
    QWidget* createPortfolioPage();
    QWidget* createRankingPage();
    QWidget* createSearchPage();
    QWidget* createDataPage();

    // Data Refresh Helpers
    void refreshAll();
    void refreshDashboard();
    void refreshUsersTable();
    void refreshPortfolioView();
    void refreshRankingView();
    void refreshUserDropdowns();

    // Main widgets
    QStackedWidget* stackedWidget;
    QList<QPushButton*> navButtons;

    // Dashboard widgets
    QLabel* lblTotalInvested;
    QLabel* lblTotalUsers;
    QLabel* lblTotalHoldings;
    QLabel* lblTopHolding;
    QTableWidget* tableTopHoldings;

    // Users page widgets
    QTableWidget* tableUsers;
    QLineEdit* txtSearchUserFilter;

    // Portfolio page widgets
    QComboBox* comboPortfolioUsers;
    QLabel* lblPortfolioUserName;
    QLabel* lblPortfolioTotal;
    QLabel* lblPortfolioCount;
    QTableWidget* tablePortfolioHoldings;
    QLineEdit* txtPortfolioFilter;

    // Ranking page widgets
    QComboBox* comboRankingUsers;
    QRadioButton* radioDescending;
    QRadioButton* radioAscending;
    QLabel* lblRankingTotal;
    QLabel* lblHighestInvestment;
    QLabel* lblLowestInvestment;
    QTableWidget* tableRanking;

    // Search page widgets
    QLineEdit* txtSearchUserId;
    QLabel* lblSearchResultId;
    QLabel* lblSearchResultName;
    QLabel* lblSearchResultStocks;
    QLabel* lblSearchResultTotal;
    QWidget* widgetSearchResult;

    // Data page widgets
    QLabel* lblStorageStatus;
    QLabel* lblFileUsersCount;
    QLabel* lblFileHoldingsCount;
};

#endif // MAINWINDOW_H
