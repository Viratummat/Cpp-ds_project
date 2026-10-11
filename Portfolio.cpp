#include "Portfolio.h"
#include <algorithm>
#include <cctype>

using namespace std;

// Global State
User users[MAX_USERS];
int userCount = 0;

// ============================================================
// STRING & FORMATTING HELPERS
// ============================================================

string toUpperCase(const string& str)
{
    string result = str;
    for (size_t i = 0; i < result.length(); ++i)
    {
        result[i] = toupper(result[i]);
    }
    return result;
}

string formatCurrency(double amount)
{
    stringstream ss;
    ss << "Rs. " << fixed << setprecision(2) << amount;
    return ss.str();
}

// ============================================================
// INPUT VALIDATION HELPERS
// ============================================================

int getValidInt(const string& prompt, int minVal, int maxVal)
{
    int value;
    while (true)
    {
        cout << prompt;
        if (cin >> value)
        {
            if (value >= minVal && value <= maxVal)
            {
                cin.ignore(numeric_limits<streamsize>::max(), '\n');
                return value;
            }
            cout << "[Error] Value must be between " << minVal << " and " << maxVal << ". Please re-enter.\n";
        }
        else
        {
            cout << "[Error] Invalid input. Please enter a valid whole number.\n";
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
        }
    }
}

double getValidDouble(const string& prompt, double minVal, double maxVal)
{
    double value;
    while (true)
    {
        cout << prompt;
        if (cin >> value)
        {
            if (value >= minVal && value <= maxVal)
            {
                cin.ignore(numeric_limits<streamsize>::max(), '\n');
                return value;
            }
            cout << "[Error] Value must be between " << fixed << setprecision(2) << minVal 
                 << " and " << maxVal << ". Please re-enter.\n";
        }
        else
        {
            cout << "[Error] Invalid input. Please enter a valid numeric value.\n";
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
        }
    }
}

string getValidString(const string& prompt, bool allowSpaces)
{
    string input;
    while (true)
    {
        cout << prompt;
        if (allowSpaces)
        {
            getline(cin, input);
        }
        else
        {
            cin >> input;
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
        }

        size_t start = input.find_first_not_of(" \t\r\n");
        size_t end = input.find_last_not_of(" \t\r\n");

        if (start != string::npos && end != string::npos)
        {
            return input.substr(start, end - start + 1);
        }

        cout << "[Error] Input cannot be empty. Please enter a non-empty value.\n";
    }
}

char getConfirmation(const string& prompt)
{
    string input;
    cout << prompt << " (y/N): ";
    getline(cin, input);
    if (!input.empty() && (input[0] == 'y' || input[0] == 'Y'))
    {
        return 'y';
    }
    return 'n';
}

// ============================================================
// MEMORY MANAGEMENT (LINKED LIST)
// ============================================================

void clearInvestments(User& user)
{
    clearInvestments(user.head);
}

void clearInvestments(Investment*& head)
{
    Investment* current = head;
    while (current != nullptr)
    {
        Investment* nextNode = current->next;
        delete current;
        current = nextNode;
    }
    head = nullptr;
}

void cleanupAllMemory()
{
    for (int i = 0; i < userCount; ++i)
    {
        clearInvestments(users[i]);
    }
    userCount = 0;
}

Investment* copyList(const Investment* head)
{
    if (head == nullptr)
    {
        return nullptr;
    }

    Investment* newHead = new Investment(head->stockName, head->quantity, head->price);
    newHead->totalInvested = head->totalInvested;

    Investment* tail = newHead;
    const Investment* current = head->next;

    while (current != nullptr)
    {
        Investment* newNode = new Investment(current->stockName, current->quantity, current->price);
        newNode->totalInvested = current->totalInvested;
        tail->next = newNode;
        tail = newNode;
        current = current->next;
    }

    return newHead;
}

// ============================================================
// CORE LOOKUP & CALCULATIONS
// ============================================================

int findUser(const string& id)
{
    string searchId = toUpperCase(id);
    for (int i = 0; i < userCount; ++i)
    {
        if (toUpperCase(users[i].userID) == searchId)
        {
            return i;
        }
    }
    return -1;
}

Investment* findInvestment(User& user, const string& stockName)
{
    string targetStock = toUpperCase(stockName);
    Investment* current = user.head;

    while (current != nullptr)
    {
        if (toUpperCase(current->stockName) == targetStock)
        {
            return current;
        }
        current = current->next;
    }

    return nullptr;
}

double calculateTotal(const User& user)
{
    double total = 0.0;
    Investment* current = user.head;

    while (current != nullptr)
    {
        total += current->totalInvested;
        current = current->next;
    }

    return total;
}

int countHoldings(const User& user)
{
    int count = 0;
    Investment* current = user.head;

    while (current != nullptr)
    {
        count++;
        current = current->next;
    }

    return count;
}

// ============================================================
// CORE PROGRAMMATIC API (UI INDEPENDENT)
// ============================================================

bool registerUserCore(const string& id, const string& name, string& outError)
{
    if (userCount >= MAX_USERS)
    {
        outError = "Maximum user capacity of 100 has been reached.";
        return false;
    }

    string cleanId = id;
    size_t s = cleanId.find_first_not_of(" \t\r\n");
    size_t e = cleanId.find_last_not_of(" \t\r\n");
    if (s == string::npos || e == string::npos)
    {
        outError = "User ID cannot be empty.";
        return false;
    }
    cleanId = cleanId.substr(s, e - s + 1);

    if (findUser(cleanId) != -1)
    {
        outError = "User ID \"" + cleanId + "\" already exists. Please choose a unique ID.";
        return false;
    }

    string cleanName = name;
    s = cleanName.find_first_not_of(" \t\r\n");
    e = cleanName.find_last_not_of(" \t\r\n");
    if (s == string::npos || e == string::npos)
    {
        outError = "User name cannot be empty.";
        return false;
    }
    cleanName = cleanName.substr(s, e - s + 1);

    users[userCount].userID = cleanId;
    users[userCount].name = cleanName;
    users[userCount].head = nullptr;
    userCount++;

    saveToFile();
    return true;
}

bool editUserNameCore(const string& id, const string& newName, string& outError)
{
    int idx = findUser(id);
    if (idx == -1)
    {
        outError = "User ID not found.";
        return false;
    }

    string cleanName = newName;
    size_t s = cleanName.find_first_not_of(" \t\r\n");
    size_t e = cleanName.find_last_not_of(" \t\r\n");
    if (s == string::npos || e == string::npos)
    {
        outError = "User name cannot be empty.";
        return false;
    }
    cleanName = cleanName.substr(s, e - s + 1);

    users[idx].name = cleanName;
    saveToFile();
    return true;
}

bool deleteUserCore(const string& id, string& outError)
{
    int index = findUser(id);
    if (index == -1)
    {
        outError = "User ID not found.";
        return false;
    }

    clearInvestments(users[index]);

    for (int i = index; i < userCount - 1; ++i)
    {
        users[i] = users[i + 1];
    }

    users[userCount - 1].userID = "";
    users[userCount - 1].name = "";
    users[userCount - 1].head = nullptr;

    userCount--;
    saveToFile();
    return true;
}

bool addInvestmentCore(const string& userId, const string& stock, int qty, double price, string& outMsg, string& outError)
{
    int idx = findUser(userId);
    if (idx == -1)
    {
        outError = "User not found.";
        return false;
    }

    string cleanStock = toUpperCase(stock);
    size_t s = cleanStock.find_first_not_of(" \t\r\n");
    size_t e = cleanStock.find_last_not_of(" \t\r\n");
    if (s == string::npos || e == string::npos)
    {
        outError = "Stock symbol cannot be empty.";
        return false;
    }
    cleanStock = cleanStock.substr(s, e - s + 1);

    if (qty <= 0)
    {
        outError = "Quantity must be a positive integer greater than 0.";
        return false;
    }
    if (price <= 0.0)
    {
        outError = "Purchase price must be greater than 0.";
        return false;
    }

    User& user = users[idx];
    Investment* existing = findInvestment(user, cleanStock);

    if (existing != nullptr)
    {
        // Weighted average formula
        existing->totalInvested += (qty * price);
        existing->quantity += qty;
        existing->price = existing->totalInvested / existing->quantity;

        stringstream ss;
        ss << "Merged with existing " << cleanStock << " holding. New total: " 
           << existing->quantity << " shares @ " << formatCurrency(existing->price) 
           << " (" << formatCurrency(existing->totalInvested) << ")";
        outMsg = ss.str();
    }
    else
    {
        Investment* node = new Investment(cleanStock, qty, price);
        if (user.head == nullptr)
        {
            user.head = node;
        }
        else
        {
            Investment* curr = user.head;
            while (curr->next != nullptr)
            {
                curr = curr->next;
            }
            curr->next = node;
        }

        stringstream ss;
        ss << "Added " << cleanStock << " (" << qty << " shares @ " << formatCurrency(price) 
           << ") = " << formatCurrency(node->totalInvested);
        outMsg = ss.str();
    }

    saveToFile();
    return true;
}

bool editInvestmentCore(const string& userId, const string& stock, int newQty, double newPrice, string& outError)
{
    int idx = findUser(userId);
    if (idx == -1)
    {
        outError = "User not found.";
        return false;
    }
    if (newQty <= 0)
    {
        outError = "Quantity must be greater than 0.";
        return false;
    }
    if (newPrice <= 0.0)
    {
        outError = "Price must be greater than 0.";
        return false;
    }

    User& user = users[idx];
    Investment* holding = findInvestment(user, stock);
    if (holding == nullptr)
    {
        outError = "Holding not found.";
        return false;
    }

    holding->quantity = newQty;
    holding->price = newPrice;
    holding->totalInvested = newQty * newPrice;

    saveToFile();
    return true;
}

bool deleteInvestmentCore(const string& userId, const string& stock, string& outError)
{
    int idx = findUser(userId);
    if (idx == -1)
    {
        outError = "User not found.";
        return false;
    }

    User& user = users[idx];
    string cleanStock = toUpperCase(stock);

    Investment* curr = user.head;
    Investment* prev = nullptr;

    while (curr != nullptr && toUpperCase(curr->stockName) != cleanStock)
    {
        prev = curr;
        curr = curr->next;
    }

    if (curr == nullptr)
    {
        outError = "Stock holding not found.";
        return false;
    }

    if (prev == nullptr)
    {
        user.head = curr->next;
    }
    else
    {
        prev->next = curr->next;
    }

    delete curr;
    saveToFile();
    return true;
}

// ============================================================
// CONSOLE INTERACTIVE OPERATIONS
// ============================================================

void addUser()
{
    cout << "\n------------------------------------------------------------\n";
    cout << "                     ADD NEW USER\n";
    cout << "------------------------------------------------------------\n";

    string id = getValidString("Enter Unique User ID: ");
    string name = getValidString("Enter Full Name (spaces supported): ", true);

    string err;
    if (registerUserCore(id, name, err))
    {
        cout << "[Success] User \"" << name << "\" (ID: " << id << ") registered successfully.\n";
    }
    else
    {
        cout << "[Error] " << err << "\n";
    }
}

void viewAllUsers()
{
    cout << "\n============================================================\n";
    cout << "                  REGISTERED USERS DIRECTORY\n";
    cout << "============================================================\n";

    if (userCount == 0)
    {
        cout << "No users registered yet. Please add a user first.\n";
        return;
    }

    cout << left
         << setw(14) << "User ID"
         << setw(26) << "User Name"
         << setw(16) << "Holdings Count"
         << setw(20) << "Total Invested"
         << "\n";
    cout << string(76, '-') << "\n";

    for (int i = 0; i < userCount; ++i)
    {
        int holdings = countHoldings(users[i]);
        double total = calculateTotal(users[i]);

        cout << left
             << setw(14) << users[i].userID
             << setw(26) << users[i].name
             << setw(16) << holdings
             << setw(20) << formatCurrency(total)
             << "\n";
    }

    cout << string(76, '-') << "\n";
    cout << "Total Registered Users: " << userCount << " / " << MAX_USERS << "\n";
}

void searchUser()
{
    cout << "\n------------------------------------------------------------\n";
    cout << "                     SEARCH USER BY ID\n";
    cout << "------------------------------------------------------------\n";

    if (userCount == 0)
    {
        cout << "No users registered yet.\n";
        return;
    }

    string id = getValidString("Enter User ID to search: ");
    int index = findUser(id);

    if (index == -1)
    {
        cout << "[Result] User not found.\n";
        return;
    }

    User& user = users[index];
    int holdings = countHoldings(user);
    double total = calculateTotal(user);

    cout << "\n============================================\n";
    cout << "                 USER FOUND\n";
    cout << "============================================\n";
    cout << "User ID          : " << user.userID << "\n";
    cout << "User Name        : " << user.name << "\n";
    cout << "Different Stocks : " << holdings << "\n";
    cout << "Total Investment : " << formatCurrency(total) << "\n";
    cout << "============================================\n";
}

void editUserName()
{
    cout << "\n------------------------------------------------------------\n";
    cout << "                     EDIT USER NAME\n";
    cout << "------------------------------------------------------------\n";

    if (userCount == 0)
    {
        cout << "No users registered yet.\n";
        return;
    }

    string id = getValidString("Enter User ID to edit: ");
    int index = findUser(id);
    if (index == -1)
    {
        cout << "[Error] User not found.\n";
        return;
    }

    cout << "Current Name: " << users[index].name << "\n";
    string newName = getValidString("Enter New Full Name: ", true);

    string err;
    if (editUserNameCore(id, newName, err))
    {
        cout << "[Success] User ID \"" << id << "\" name updated to \"" << newName << "\".\n";
    }
    else
    {
        cout << "[Error] " << err << "\n";
    }
}

void deleteUser()
{
    cout << "\n------------------------------------------------------------\n";
    cout << "                      DELETE USER\n";
    cout << "------------------------------------------------------------\n";

    if (userCount == 0)
    {
        cout << "No users registered yet.\n";
        return;
    }

    string id = getValidString("Enter User ID to delete: ");
    int index = findUser(id);
    if (index == -1)
    {
        cout << "[Error] User not found.\n";
        return;
    }

    User& user = users[index];
    int holdings = countHoldings(user);
    cout << "Selected User: " << user.name << " (ID: " << user.userID << ") with " << holdings << " holdings.\n";
    char confirm = getConfirmation("Are you sure you want to permanently delete this user and portfolio?");

    if (confirm != 'y')
    {
        cout << "[Cancelled] Deletion cancelled.\n";
        return;
    }

    string err;
    if (deleteUserCore(id, err))
    {
        cout << "[Success] User and their portfolio were successfully deleted.\n";
    }
    else
    {
        cout << "[Error] " << err << "\n";
    }
}

void addInvestment()
{
    cout << "\n------------------------------------------------------------\n";
    cout << "                   ADD STOCK INVESTMENT\n";
    cout << "------------------------------------------------------------\n";

    if (userCount == 0)
    {
        cout << "No users registered yet. Please add a user first.\n";
        return;
    }

    string id = getValidString("Enter User ID: ");
    string stock = getValidString("Enter Stock Symbol/Name (e.g. TCS): ");
    int quantity = getValidInt("Enter Quantity of Shares (> 0): ", 1, 10000000);
    double price = getValidDouble("Enter Purchase Price per Share (> 0): ", 0.01, 100000000.0);

    string msg, err;
    if (addInvestmentCore(id, stock, quantity, price, msg, err))
    {
        cout << "[Success] " << msg << "\n";
    }
    else
    {
        cout << "[Error] " << err << "\n";
    }
}

void editInvestment()
{
    cout << "\n------------------------------------------------------------\n";
    cout << "                    EDIT STOCK HOLDING\n";
    cout << "------------------------------------------------------------\n";

    if (userCount == 0)
    {
        cout << "No users registered yet.\n";
        return;
    }

    string id = getValidString("Enter User ID: ");
    string stock = getValidString("Enter Stock Symbol to edit: ");
    int newQty = getValidInt("Enter New Quantity: ", 1, 10000000);
    double newPrice = getValidDouble("Enter New Average Price per Share: ", 0.01, 100000000.0);

    string err;
    if (editInvestmentCore(id, stock, newQty, newPrice, err))
    {
        cout << "[Success] Holding updated successfully.\n";
    }
    else
    {
        cout << "[Error] " << err << "\n";
    }
}

void deleteInvestment()
{
    cout << "\n------------------------------------------------------------\n";
    cout << "                   DELETE STOCK HOLDING\n";
    cout << "------------------------------------------------------------\n";

    if (userCount == 0)
    {
        cout << "No users registered yet.\n";
        return;
    }

    string id = getValidString("Enter User ID: ");
    string stock = getValidString("Enter Stock Symbol to delete: ");

    char confirm = getConfirmation("Are you sure you want to remove this stock from the portfolio?");
    if (confirm != 'y')
    {
        cout << "[Cancelled] Deletion cancelled.\n";
        return;
    }

    string err;
    if (deleteInvestmentCore(id, stock, err))
    {
        cout << "[Success] Stock \"" << stock << "\" removed from portfolio.\n";
    }
    else
    {
        cout << "[Error] " << err << "\n";
    }
}

void searchStockInPortfolio()
{
    cout << "\n------------------------------------------------------------\n";
    cout << "              SEARCH STOCK IN USER PORTFOLIO\n";
    cout << "------------------------------------------------------------\n";

    if (userCount == 0)
    {
        cout << "No users registered yet.\n";
        return;
    }

    string id = getValidString("Enter User ID: ");
    int index = findUser(id);

    if (index == -1)
    {
        cout << "[Error] User not found.\n";
        return;
    }

    User& user = users[index];
    string stock = toUpperCase(getValidString("Enter Stock Symbol to search: "));
    Investment* holding = findInvestment(user, stock);

    if (holding == nullptr)
    {
        cout << "[Result] Stock \"" << stock << "\" is not present in " << user.name << "'s portfolio.\n";
        return;
    }

    double totalPortfolio = calculateTotal(user);
    double allocation = (totalPortfolio > 0.0) ? (holding->totalInvested / totalPortfolio) * 100.0 : 0.0;

    cout << "\n============================================\n";
    cout << "                STOCK FOUND\n";
    cout << "============================================\n";
    cout << "Stock Name       : " << holding->stockName << "\n";
    cout << "Quantity         : " << holding->quantity << " shares\n";
    cout << "Avg Price        : " << formatCurrency(holding->price) << "\n";
    cout << "Total Invested   : " << formatCurrency(holding->totalInvested) << "\n";
    cout << "Allocation       : " << fixed << setprecision(2) << allocation << "%\n";
    cout << "============================================\n";
}

void viewPortfolio()
{
    cout << "\n------------------------------------------------------------\n";
    cout << "                      VIEW PORTFOLIO\n";
    cout << "------------------------------------------------------------\n";

    if (userCount == 0)
    {
        cout << "No users registered yet.\n";
        return;
    }

    string id = getValidString("Enter User ID: ");
    int index = findUser(id);

    if (index == -1)
    {
        cout << "[Error] User not found.\n";
        return;
    }

    User& user = users[index];

    cout << "\n=====================================================================\n";
    cout << "                          USER PORTFOLIO\n";
    cout << "=====================================================================\n";
    cout << "User ID   : " << user.userID << "\n";
    cout << "User Name : " << user.name << "\n";

    if (user.head == nullptr)
    {
        cout << "\nNo investments found in this portfolio.\n";
        cout << "=====================================================================\n";
        return;
    }

    double totalPortfolio = calculateTotal(user);

    cout << "\n";
    cout << left
         << setw(16) << "Stock"
         << setw(14) << "Quantity"
         << setw(18) << "Avg Price"
         << setw(20) << "Invested"
         << setw(14) << "Allocation"
         << "\n";
    cout << string(82, '-') << "\n";

    Investment* current = user.head;
    while (current != nullptr)
    {
        double percentage = (totalPortfolio > 0.0) ? (current->totalInvested / totalPortfolio) * 100.0 : 0.0;

        cout << left
             << setw(16) << current->stockName
             << setw(14) << current->quantity
             << setw(18) << formatCurrency(current->price)
             << setw(20) << formatCurrency(current->totalInvested)
             << setw(14) << (to_string(percentage).substr(0, to_string(percentage).find('.') + 3) + "%")
             << "\n";

        current = current->next;
    }

    cout << string(82, '-') << "\n";
    cout << "Total Portfolio Investment: " << formatCurrency(totalPortfolio) << "\n";
    cout << "Note: Figures represent acquisition purchase cost.\n";
    cout << "=====================================================================\n";
}

// ============================================================
// PORTFOLIO ANALYTICS
// ============================================================

void viewUserAnalytics()
{
    cout << "\n------------------------------------------------------------\n";
    cout << "                 INDIVIDUAL USER ANALYTICS\n";
    cout << "------------------------------------------------------------\n";

    if (userCount == 0)
    {
        cout << "No users registered yet.\n";
        return;
    }

    string id = getValidString("Enter User ID: ");
    int index = findUser(id);

    if (index == -1)
    {
        cout << "[Error] User not found.\n";
        return;
    }

    User& user = users[index];

    if (user.head == nullptr)
    {
        cout << "[Info] User has no investments.\n";
        return;
    }

    double totalPortfolio = calculateTotal(user);
    int holdingsCount = countHoldings(user);

    Investment* largest = user.head;
    Investment* smallest = user.head;
    Investment* current = user.head->next;

    while (current != nullptr)
    {
        if (current->totalInvested > largest->totalInvested)
        {
            largest = current;
        }
        if (current->totalInvested < smallest->totalInvested)
        {
            smallest = current;
        }
        current = current->next;
    }

    double avgCostPerStock = (holdingsCount > 0) ? (totalPortfolio / holdingsCount) : 0.0;
    double maxAlloc = (totalPortfolio > 0.0) ? (largest->totalInvested / totalPortfolio) * 100.0 : 0.0;

    cout << "\n============================================================\n";
    cout << "              ANALYTICS: " << user.name << " (" << user.userID << ")\n";
    cout << "============================================================\n";
    cout << "Total Portfolio Cost    : " << formatCurrency(totalPortfolio) << "\n";
    cout << "Distinct Stocks Held    : " << holdingsCount << "\n";
    cout << "Average Cost per Holding: " << formatCurrency(avgCostPerStock) << "\n";
    cout << "Largest Investment      : " << largest->stockName << " (" << formatCurrency(largest->totalInvested) << ")\n";
    cout << "Smallest Investment     : " << smallest->stockName << " (" << formatCurrency(smallest->totalInvested) << ")\n";
    cout << "Top Allocation Asset    : " << largest->stockName << " (" << fixed << setprecision(2) << maxAlloc << "% of portfolio)\n";
    cout << "============================================================\n";
}

void viewOverallSystemAnalytics()
{
    cout << "\n============================================================\n";
    cout << "                 SYSTEM-WIDE ANALYTICS\n";
    cout << "============================================================\n";

    if (userCount == 0)
    {
        cout << "No users registered yet.\n";
        return;
    }

    double grandTotal = 0.0;
    int totalHoldings = 0;
    int topUserIndex = 0;
    double maxUserTotal = 0.0;

    for (int i = 0; i < userCount; ++i)
    {
        double uTotal = calculateTotal(users[i]);
        grandTotal += uTotal;
        totalHoldings += countHoldings(users[i]);

        if (uTotal > maxUserTotal)
        {
            maxUserTotal = uTotal;
            topUserIndex = i;
        }
    }

    cout << "Registered Users        : " << userCount << " / " << MAX_USERS << "\n";
    cout << "Total Active Holdings   : " << totalHoldings << "\n";
    cout << "Total Capital Invested  : " << formatCurrency(grandTotal) << "\n";

    if (maxUserTotal > 0.0)
    {
        cout << "Top Portfolio Account   : " << users[topUserIndex].name 
             << " (ID: " << users[topUserIndex].userID << ") with " 
             << formatCurrency(maxUserTotal) << "\n";
    }
    else
    {
        cout << "Top Portfolio Account   : None (0.00 invested)\n";
    }
    cout << "============================================================\n";
}

// ============================================================
// SELECTION SORT (ASCENDING AND DESCENDING)
// ============================================================

void selectionSort(Investment* head, bool descending)
{
    Investment* current = head;

    while (current != nullptr)
    {
        Investment* targetNode = current;
        Investment* search = current->next;

        while (search != nullptr)
        {
            if (descending)
            {
                if (search->totalInvested > targetNode->totalInvested)
                {
                    targetNode = search;
                }
                else if (fabs(search->totalInvested - targetNode->totalInvested) < 1e-6)
                {
                    if (search->stockName < targetNode->stockName)
                    {
                        targetNode = search;
                    }
                }
            }
            else
            {
                if (search->totalInvested < targetNode->totalInvested)
                {
                    targetNode = search;
                }
                else if (fabs(search->totalInvested - targetNode->totalInvested) < 1e-6)
                {
                    if (search->stockName < targetNode->stockName)
                    {
                        targetNode = search;
                    }
                }
            }

            search = search->next;
        }

        if (targetNode != current)
        {
            swap(current->stockName, targetNode->stockName);
            swap(current->quantity, targetNode->quantity);
            swap(current->price, targetNode->price);
            swap(current->totalInvested, targetNode->totalInvested);
        }

        current = current->next;
    }
}

void selectionSortUsers(UserRankingItem items[], int count, bool descending)
{
    for (int i = 0; i < count - 1; ++i)
    {
        int targetIdx = i;
        for (int j = i + 1; j < count; ++j)
        {
            if (descending)
            {
                if (items[j].totalInvested > items[targetIdx].totalInvested)
                {
                    targetIdx = j;
                }
                else if (fabs(items[j].totalInvested - items[targetIdx].totalInvested) < 1e-6)
                {
                    if (items[j].name < items[targetIdx].name)
                    {
                        targetIdx = j;
                    }
                }
            }
            else
            {
                if (items[j].totalInvested < items[targetIdx].totalInvested)
                {
                    targetIdx = j;
                }
                else if (fabs(items[j].totalInvested - items[targetIdx].totalInvested) < 1e-6)
                {
                    if (items[j].name < items[targetIdx].name)
                    {
                        targetIdx = j;
                    }
                }
            }
        }

        if (targetIdx != i)
        {
            swap(items[i], items[targetIdx]);
        }
    }
}

void displaySortedHoldings(const User& user, bool descending)
{
    if (user.head == nullptr)
    {
        cout << "[Info] No investments found for this user.\n";
        return;
    }

    Investment* copyHead = copyList(user.head);
    selectionSort(copyHead, descending);

    double totalPortfolio = calculateTotal(user);

    cout << "\n=========================================================================\n";
    if (descending)
    {
        cout << "        INVESTMENT RANKING -- DESCENDING (HIGHEST TO LOWEST)\n";
    }
    else
    {
        cout << "        INVESTMENT RANKING -- ASCENDING  (LOWEST TO HIGHEST)\n";
    }
    cout << "=========================================================================\n";
    cout << "User ID   : " << user.userID << "\n";
    cout << "User Name : " << user.name << "\n\n";

    cout << left
         << setw(8)  << "Rank"
         << setw(16) << "Stock"
         << setw(12) << "Quantity"
         << setw(18) << "Avg Price"
         << setw(20) << "Total Invested"
         << setw(12) << "Allocation"
         << "\n";
    cout << string(86, '-') << "\n";

    Investment* current = copyHead;
    int rank = 1;

    Investment* highestNode = nullptr;
    Investment* lowestNode = nullptr;

    while (current != nullptr)
    {
        if (highestNode == nullptr || current->totalInvested > highestNode->totalInvested)
        {
            highestNode = current;
        }
        if (lowestNode == nullptr || current->totalInvested < lowestNode->totalInvested)
        {
            lowestNode = current;
        }

        double allocation = (totalPortfolio > 0.0) ? (current->totalInvested / totalPortfolio) * 100.0 : 0.0;

        cout << left
             << setw(8)  << rank
             << setw(16) << current->stockName
             << setw(12) << current->quantity
             << setw(18) << formatCurrency(current->price)
             << setw(20) << formatCurrency(current->totalInvested)
             << setw(12) << (to_string(allocation).substr(0, to_string(allocation).find('.') + 3) + "%")
             << "\n";

        current = current->next;
        rank++;
    }

    cout << string(86, '-') << "\n";
    cout << "Total Portfolio Investment: " << formatCurrency(totalPortfolio) << "\n";

    if (highestNode != nullptr)
    {
        cout << "Highest Investment        : " << highestNode->stockName 
             << " (" << formatCurrency(highestNode->totalInvested) << ")\n";
    }
    if (lowestNode != nullptr)
    {
        cout << "Lowest Investment         : " << lowestNode->stockName 
             << " (" << formatCurrency(lowestNode->totalInvested) << ")\n";
    }

    cout << "=========================================================================\n";

    clearInvestments(copyHead);
}

void showInvestmentRankingSubmenu()
{
    if (userCount == 0)
    {
        cout << "\nNo users registered yet.\n";
        return;
    }

    string id = getValidString("\nEnter User ID to rank portfolio: ");
    int index = findUser(id);

    if (index == -1)
    {
        cout << "[Error] User not found.\n";
        return;
    }

    User& user = users[index];
    if (user.head == nullptr)
    {
        cout << "[Info] No investments found in " << user.name << "'s portfolio.\n";
        return;
    }

    int choice = 0;
    do
    {
        cout << "\n------------------------------------------------------------\n";
        cout << "             SELECTION SORT RANKING SUBMENU\n";
        cout << "------------------------------------------------------------\n";
        cout << "1. Sort by Investment -- Descending (Highest to Lowest)\n";
        cout << "2. Sort by Investment -- Ascending  (Lowest to Highest)\n";
        cout << "3. Return to Main Menu\n";
        cout << "------------------------------------------------------------\n";

        choice = getValidInt("Enter your ranking choice (1-3): ", 1, 3);

        switch (choice)
        {
            case 1:
                displaySortedHoldings(user, true);
                break;
            case 2:
                displaySortedHoldings(user, false);
                break;
            case 3:
                cout << "Returning to Main Menu...\n";
                break;
        }
    } while (choice != 3);
}

// ============================================================
// FILE PERSISTENCE & BACKUP / RESTORE
// ============================================================

bool saveToFile(const string& filename)
{
    ofstream outFile(filename.c_str());
    if (!outFile.is_open())
    {
        cerr << "[Error] Unable to open file \"" << filename << "\" for writing.\n";
        return false;
    }

    outFile << "PORTFOLIO_DATA_V1\n";
    outFile << userCount << "\n";

    for (int i = 0; i < userCount; ++i)
    {
        outFile << users[i].userID << "\n";
        outFile << users[i].name << "\n";

        int hCount = countHoldings(users[i]);
        outFile << hCount << "\n";

        Investment* current = users[i].head;
        while (current != nullptr)
        {
            outFile << current->stockName << " "
                    << current->quantity << " "
                    << fixed << setprecision(4) << current->price << " "
                    << fixed << setprecision(4) << current->totalInvested << "\n";
            current = current->next;
        }
    }

    outFile.close();
    return true;
}

bool loadFromFile(const string& filename)
{
    ifstream inFile(filename.c_str());
    if (!inFile.is_open())
    {
        return false;
    }

    string header;
    getline(inFile, header);

    if (header != "PORTFOLIO_DATA_V1")
    {
        cerr << "[Warning] Unrecognized file header in \"" << filename << "\".\n";
        inFile.close();
        return false;
    }

    int incomingUserCount = 0;
    if (!(inFile >> incomingUserCount) || incomingUserCount < 0 || incomingUserCount > MAX_USERS)
    {
        cerr << "[Warning] Invalid user count in \"" << filename << "\".\n";
        inFile.close();
        return false;
    }

    string dummy;
    getline(inFile, dummy);

    User tempUsers[MAX_USERS];

    for (int i = 0; i < incomingUserCount; ++i)
    {
        string uid, uname;
        if (!getline(inFile, uid) || !getline(inFile, uname))
        {
            for (int k = 0; k < i; ++k) clearInvestments(tempUsers[k]);
            inFile.close();
            return false;
        }

        tempUsers[i].userID = uid;
        tempUsers[i].name = uname;
        tempUsers[i].head = nullptr;

        int hCount = 0;
        if (!(inFile >> hCount) || hCount < 0)
        {
            for (int k = 0; k <= i; ++k) clearInvestments(tempUsers[k]);
            inFile.close();
            return false;
        }

        Investment* tail = nullptr;
        for (int j = 0; j < hCount; ++j)
        {
            string stock;
            int qty;
            double prc, total;

            if (!(inFile >> stock >> qty >> prc >> total))
            {
                for (int k = 0; k <= i; ++k) clearInvestments(tempUsers[k]);
                inFile.close();
                return false;
            }

            Investment* node = new Investment(stock, qty, prc);
            node->totalInvested = total;

            if (tempUsers[i].head == nullptr)
            {
                tempUsers[i].head = node;
                tail = node;
            }
            else
            {
                tail->next = node;
                tail = node;
            }
        }
        getline(inFile, dummy);
    }

    inFile.close();

    cleanupAllMemory();
    userCount = incomingUserCount;
    for (int i = 0; i < userCount; ++i)
    {
        users[i] = tempUsers[i];
    }

    return true;
}

void exportBackup()
{
    cout << "\n------------------------------------------------------------\n";
    cout << "                    EXPORT DATA BACKUP\n";
    cout << "------------------------------------------------------------\n";

    string filename = getValidString("Enter backup filename (press enter for default: portfolio_backup.txt): ", true);
    if (filename.empty())
    {
        filename = DEFAULT_BACKUP_FILE;
    }

    if (saveToFile(filename))
    {
        cout << "[Success] Portfolio backup exported successfully to \"" << filename << "\".\n";
        cout << "  Contains " << userCount << " user profile(s).\n";
    }
    else
    {
        cout << "[Error] Failed to create backup file.\n";
    }
}

void restoreBackup()
{
    cout << "\n------------------------------------------------------------\n";
    cout << "                   RESTORE DATA BACKUP\n";
    cout << "------------------------------------------------------------\n";

    string filename = getValidString("Enter backup filename to restore: ", true);
    if (filename.empty())
    {
        filename = DEFAULT_BACKUP_FILE;
    }

    char confirm = getConfirmation("Warning: Restoring will overwrite current unsaved data. Proceed?");
    if (confirm != 'y')
    {
        cout << "[Cancelled] Backup restoration cancelled.\n";
        return;
    }

    if (loadFromFile(filename))
    {
        saveToFile();
        cout << "[Success] Data restored successfully from \"" << filename << "\".\n";
        cout << "  Loaded " << userCount << " user profile(s).\n";
    }
    else
    {
        cout << "[Error] Failed to restore backup. Please ensure the file exists and is valid.\n";
    }
}
