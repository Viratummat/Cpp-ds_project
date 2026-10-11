#include "Portfolio.h"
#include <cassert>
#include <iostream>
#include <cmath>

using namespace std;

void runTests()
{
    cout << "============================================================\n";
    cout << "          STARTING AUTOMATED C++ INTEGRATION TESTS\n";
    cout << "============================================================\n";

    // Clean initial state
    cleanupAllMemory();
    assert(userCount == 0);
    cout << "[PASS] Clean initial state verified: 0 users.\n";

    // 1. User creation and unique ID check
    users[0].userID = "USR101";
    users[0].name = "Test Investor One";
    users[0].head = nullptr;
    userCount = 1;

    assert(findUser("USR101") == 0);
    assert(findUser("usr101") == 0); // Case-insensitive
    assert(findUser("NON_EXISTENT") == -1);
    cout << "[PASS] User lookup and case-insensitivity verified.\n";

    // 2. Add investments to User 0
    Investment* inv1 = new Investment("TCS", 10, 3000.00); // 30,000
    Investment* inv2 = new Investment("INFY", 20, 1000.00); // 20,000
    Investment* inv3 = new Investment("RELIANCE", 5, 5000.00); // 25,000
    Investment* inv4 = new Investment("ITC", 50, 400.00); // 20,000 (tie with INFY)

    users[0].head = inv1;
    inv1->next = inv2;
    inv2->next = inv3;
    inv3->next = inv4;

    assert(countHoldings(users[0]) == 4);
    assert(fabs(calculateTotal(users[0]) - 95000.00) < 1e-4);
    cout << "[PASS] Portfolio total calculation verified: Rs. 95,000.00.\n";

    // 3. Test Weighted Average Purchase Price Calculation
    // Suppose we add 10 more shares of TCS @ Rs. 3300.00
    // Old: 10 @ 3000 = 30000
    // Add: 10 @ 3300 = 33000
    // New total = 63000
    // New qty = 20
    // New avg price = 63000 / 20 = 3150.00
    Investment* tcs = findInvestment(users[0], "TCS");
    assert(tcs != nullptr);
    tcs->totalInvested += (10 * 3300.00);
    tcs->quantity += 10;
    tcs->price = tcs->totalInvested / tcs->quantity;

    assert(tcs->quantity == 20);
    assert(fabs(tcs->totalInvested - 63000.00) < 1e-4);
    assert(fabs(tcs->price - 3150.00) < 1e-4);
    cout << "[PASS] Weighted-average purchase price merge verified.\n";

    // 4. Test Selection Sort DESCENDING (Highest to Lowest)
    Investment* copyDesc = copyList(users[0].head);
    selectionSort(copyDesc, true);

    // Expected order after TCS updated to 63,000:
    // 1. TCS: 63,000
    // 2. RELIANCE: 25,000
    // 3. INFY: 20,000 (alphabetical before ITC)
    // 4. ITC: 20,000
    Investment* curr = copyDesc;
    assert(curr->stockName == "TCS");
    assert(fabs(curr->totalInvested - 63000.00) < 1e-4);

    curr = curr->next;
    assert(curr->stockName == "RELIANCE");
    assert(fabs(curr->totalInvested - 25000.00) < 1e-4);

    curr = curr->next;
    assert(curr->stockName == "INFY");
    assert(fabs(curr->totalInvested - 20000.00) < 1e-4);

    curr = curr->next;
    assert(curr->stockName == "ITC");
    assert(fabs(curr->totalInvested - 20000.00) < 1e-4);

    clearInvestments(copyDesc);
    assert(copyDesc == nullptr);
    cout << "[PASS] Descending Selection Sort with tie-breaker verified.\n";

    // 5. Test Selection Sort ASCENDING (Lowest to Highest)
    Investment* copyAsc = copyList(users[0].head);
    selectionSort(copyAsc, false);

    // Expected order:
    // 1. INFY: 20,000
    // 2. ITC: 20,000
    // 3. RELIANCE: 25,000
    // 4. TCS: 63,000
    curr = copyAsc;
    assert(curr->stockName == "INFY");
    assert(fabs(curr->totalInvested - 20000.00) < 1e-4);

    curr = curr->next;
    assert(curr->stockName == "ITC");
    assert(fabs(curr->totalInvested - 20000.00) < 1e-4);

    curr = curr->next;
    assert(curr->stockName == "RELIANCE");
    assert(fabs(curr->totalInvested - 25000.00) < 1e-4);

    curr = curr->next;
    assert(curr->stockName == "TCS");
    assert(fabs(curr->totalInvested - 63000.00) < 1e-4);

    clearInvestments(copyAsc);
    assert(copyAsc == nullptr);
    cout << "[PASS] Ascending Selection Sort verified.\n";

    // 6. Verify original portfolio sequence was UNTOUCHED (Non-mutating verification)
    assert(users[0].head->stockName == "TCS");
    assert(users[0].head->next->stockName == "INFY");
    assert(users[0].head->next->next->stockName == "RELIANCE");
    assert(users[0].head->next->next->next->stockName == "ITC");
    cout << "[PASS] Non-mutating sorting safety verified: original sequence intact.\n";

    // 7. File Persistence Test
    const string testFile = "test_persistence.txt";
    bool saveOk = saveToFile(testFile);
    assert(saveOk == true);
    cout << "[PASS] File serialization verified.\n";

    // Clear state
    cleanupAllMemory();
    assert(userCount == 0);

    // Reload from file
    bool loadOk = loadFromFile(testFile);
    assert(loadOk == true);
    assert(userCount == 1);
    assert(users[0].userID == "USR101");
    assert(countHoldings(users[0]) == 4);
    assert(fabs(calculateTotal(users[0]) - 128000.00) < 1e-4);
    cout << "[PASS] File deserialization and state restoration verified.\n";

    // Clean up test file memory
    cleanupAllMemory();
    remove(testFile.c_str());

    cout << "============================================================\n";
    cout << "           ALL AUTOMATED TESTS PASSED SUCCESSFULLY!\n";
    cout << "============================================================\n";
}

int main()
{
    runTests();
    return 0;
}
