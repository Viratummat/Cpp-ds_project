#include "Portfolio.h"
#include <iostream>

using namespace std;

void showUserManagementMenu()
{
    int choice = 0;
    do
    {
        cout << "\n============================================================\n";
        cout << "                      USER MANAGEMENT\n";
        cout << "============================================================\n";
        cout << "1. Add New User\n";
        cout << "2. View All Registered Users\n";
        cout << "3. Edit User Name\n";
        cout << "4. Delete User & Portfolio\n";
        cout << "0. Return to Main Menu\n";
        cout << "============================================================\n";

        choice = getValidInt("Enter your choice (0-4): ", 0, 4);

        switch (choice)
        {
            case 1:
                addUser();
                break;
            case 2:
                viewAllUsers();
                break;
            case 3:
                editUserName();
                break;
            case 4:
                deleteUser();
                break;
            case 0:
                break;
        }
    } while (choice != 0);
}

void showInvestmentManagementMenu()
{
    int choice = 0;
    do
    {
        cout << "\n============================================================\n";
        cout << "                   INVESTMENT MANAGEMENT\n";
        cout << "============================================================\n";
        cout << "1. Add / Merge Stock Investment (Weighted-Average Price)\n";
        cout << "2. Edit Stock Holding (Quantity / Price)\n";
        cout << "3. Delete Stock Holding\n";
        cout << "4. View User Portfolio\n";
        cout << "5. Search Stock in User's Portfolio\n";
        cout << "0. Return to Main Menu\n";
        cout << "============================================================\n";

        choice = getValidInt("Enter your choice (0-5): ", 0, 5);

        switch (choice)
        {
            case 1:
                addInvestment();
                break;
            case 2:
                editInvestment();
                break;
            case 3:
                deleteInvestment();
                break;
            case 4:
                viewPortfolio();
                break;
            case 5:
                searchStockInPortfolio();
                break;
            case 0:
                break;
        }
    } while (choice != 0);
}

void showAnalyticsMenu()
{
    int choice = 0;
    do
    {
        cout << "\n============================================================\n";
        cout << "                   PORTFOLIO ANALYTICS\n";
        cout << "============================================================\n";
        cout << "1. Individual User Analytics (Min/Max, Allocation, Average)\n";
        cout << "2. Overall System Analytics (Total Invested, Top Investor)\n";
        cout << "3. View Formatted User Portfolio\n";
        cout << "0. Return to Main Menu\n";
        cout << "============================================================\n";

        choice = getValidInt("Enter your choice (0-3): ", 0, 3);

        switch (choice)
        {
            case 1:
                viewUserAnalytics();
                break;
            case 2:
                viewOverallSystemAnalytics();
                break;
            case 3:
                viewPortfolio();
                break;
            case 0:
                break;
        }
    } while (choice != 0);
}

void showDataManagementMenu()
{
    int choice = 0;
    do
    {
        cout << "\n============================================================\n";
        cout << "                DATA PERSISTENCE & BACKUP\n";
        cout << "============================================================\n";
        cout << "1. Save Current Data to Disk (portfolio_data.txt)\n";
        cout << "2. Reload Data from Disk\n";
        cout << "3. Export Data Backup (Custom File)\n";
        cout << "4. Restore from Backup File\n";
        cout << "0. Return to Main Menu\n";
        cout << "============================================================\n";

        choice = getValidInt("Enter your choice (0-4): ", 0, 4);

        switch (choice)
        {
            case 1:
                if (saveToFile())
                {
                    cout << "[Success] Data committed to " << DEFAULT_DATA_FILE << ".\n";
                }
                break;
            case 2:
                if (loadFromFile())
                {
                    cout << "[Success] Data reloaded from " << DEFAULT_DATA_FILE << ". Users: " << userCount << "\n";
                }
                else
                {
                    cout << "[Info] No saved data found. Currently empty state.\n";
                }
                break;
            case 3:
                exportBackup();
                break;
            case 4:
                restoreBackup();
                break;
            case 0:
                break;
        }
    } while (choice != 0);
}

void showMainMenu()
{
    cout << "\n";
    cout << "============================================================\n";
    cout << "           STOCK PORTFOLIO MANAGEMENT SYSTEM (C++)\n";
    cout << "============================================================\n";
    cout << "1. User Management\n";
    cout << "2. Investment Management (Add / Merge / Edit / Delete)\n";
    cout << "3. View Portfolio & Analytics\n";
    cout << "4. Investment Ranking (Selection Sort: Asc / Desc)\n";
    cout << "5. Search User by ID (C++ Linear Search)\n";
    cout << "6. Data Persistence & Backup / Restore\n";
    cout << "0. Exit Application\n";
    cout << "============================================================\n";
}

int main()
{
    cout << "Starting Stock Portfolio Management System...\n";

    // Attempt to auto-load saved state from file
    if (loadFromFile(DEFAULT_DATA_FILE))
    {
        cout << "[Storage] Restored " << userCount << " user account(s) from " << DEFAULT_DATA_FILE << ".\n";
    }
    else
    {
        cout << "[Storage] No previous data file found. Started with clean empty state (0 users).\n";
    }

    int choice = -1;

    do
    {
        showMainMenu();
        choice = getValidInt("Enter your choice (0-6): ", 0, 6);

        switch (choice)
        {
            case 1:
                showUserManagementMenu();
                break;

            case 2:
                showInvestmentManagementMenu();
                break;

            case 3:
                showAnalyticsMenu();
                break;

            case 4:
                showInvestmentRankingSubmenu();
                break;

            case 5:
                searchUser();
                break;

            case 6:
                showDataManagementMenu();
                break;

            case 0:
                cout << "\nSaving data and shutting down...\n";
                saveToFile(DEFAULT_DATA_FILE);
                cleanupAllMemory();
                cout << "All dynamically allocated memory safely released.\n";
                cout << "Thank you for using the Stock Portfolio Management System.\n";
                break;

            default:
                cout << "\n[Error] Invalid choice. Please select from the menu.\n";
                break;
        }

    } while (choice != 0);

    return 0;
}
