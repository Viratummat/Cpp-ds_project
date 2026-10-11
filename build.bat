@echo off
echo ============================================================
echo   Compiling Stock Portfolio Management System (C++)
echo ============================================================
g++ -std=c++11 -Wall -O2 main.cpp Portfolio.cpp -o portfolio.exe
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] portfolio.exe built successfully!
    echo Run using: portfolio.exe
) else (
    echo [ERROR] Compilation failed. Please check your C++ compiler configuration.
)
pause
