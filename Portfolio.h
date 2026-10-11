#ifndef PORTFOLIO_H
#define PORTFOLIO_H

#include <iostream>
#include <iomanip>
#include <string>
#include <fstream>
#include <sstream>
#include <cmath>
#include <limits>

// Maximum capacity for registered users (DSA Array bound)
const int MAX_USERS = 100;

// Default persistence file path
const std::string DEFAULT_DATA_FILE = "portfolio_data.txt";
const std::string DEFAULT_BACKUP_FILE = "portfolio_backup.txt";

// ============================================================
// NODE STRUCTURE FOR SINGLY LINKED LIST
// Represents an individual stock investment holding
// ============================================================
struct Investment
{
    std::string stockName;
    int quantity;
    double price;          // Weighted-average purchase price
    double totalInvested;  // quantity * price

    Investment* next;

    Investment(const std::string& stock = "", int qty = 0, double p = 0.0)
    {
        stockName = stock;
        quantity = qty;
        price = p;
        totalInvested = qty * p;
        next = nullptr;
    }
};

// ============================================================
// USER STRUCTURE
// Contains user credentials and head pointer to their holdings linked list
// ============================================================
struct User
{
    std::string userID;
    std::string name;
    Investment* head;

    User()
    {
        userID = "";
        name = "";
        head = nullptr;
    }
};

// ============================================================
// CORE DATA STATE
// ============================================================
extern User users[MAX_USERS];
extern int userCount;

// ============================================================
// FUNCTION DECLARATIONS
// ============================================================

// Memory Management
void clearInvestments(User& user);
void clearInvestments(Investment*& head);
void cleanupAllMemory();
Investment* copyList(const Investment* head);

// Lookup & Calculations
int findUser(const std::string& id);
Investment* findInvestment(User& user, const std::string& stockName);
double calculateTotal(const User& user);
int countHoldings(const User& user);

// User Management
void addUser();
void viewAllUsers();
void searchUser();
void editUserName();
void deleteUser();

// Investment Management
void addInvestment();
void editInvestment();
void deleteInvestment();
void searchStockInPortfolio();
void viewPortfolio();

// Portfolio Analytics
void viewUserAnalytics();
void viewOverallSystemAnalytics();

// Selection Sort (Ascending and Descending)
void selectionSort(Investment* head, bool descending = true);
void showInvestmentRankingSubmenu();
void displaySortedHoldings(const User& user, bool descending);

// File Persistence & Backup / Restore
bool saveToFile(const std::string& filename = DEFAULT_DATA_FILE);
bool loadFromFile(const std::string& filename = DEFAULT_DATA_FILE);
void exportBackup();
void restoreBackup();

// Input Validation Helpers
int getValidInt(const std::string& prompt, int minVal = 0, int maxVal = 10000000);
double getValidDouble(const std::string& prompt, double minVal = 0.01, double maxVal = 100000000.0);
std::string getValidString(const std::string& prompt, bool allowSpaces = false);
char getConfirmation(const std::string& prompt);

// String Helpers
std::string toUpperCase(const std::string& str);
std::string formatCurrency(double amount);

#endif // PORTFOLIO_H
