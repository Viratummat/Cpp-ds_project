@echo off
setlocal enabledelayedexpansion

echo ===============================================================================
echo        STOCK PORTFOLIO MANAGEMENT SYSTEM - BUILD SUITE (MinGW C++)
echo ===============================================================================

:: 1. Check for standard g++ (MinGW)
where g++ >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] g++ compiler not found in system PATH.
    echo Please ensure C:\MinGW\bin is added to your environment PATH.
    pause
    exit /b 1
)

echo [FOUND] C++ Compiler:
g++ --version | findstr /C:"g++" /C:"GCC"

echo.
echo Select build option:
echo   [1] Build Native Win32 GUI Application (portfolio_gui.exe) [DEFAULT]
echo   [2] Build Console Application (portfolio.exe)
echo   [3] Build Automated Tests and Run Suite (test_runner.exe)
echo   [4] Build Everything (Console + Win32 GUI + Tests)
echo   [5] Build and Launch Win32 GUI Application
echo.
set /p opt="Enter choice (1-5, or press Enter for 1): "
if "%opt%"=="" set opt=1

if "%opt%"=="1" goto build_gui
if "%opt%"=="2" goto build_console
if "%opt%"=="3" goto build_tests
if "%opt%"=="4" goto build_all
if "%opt%"=="5" goto build_and_run_gui
goto build_gui

:build_gui
echo -------------------------------------------------------------------------------
echo Building Native Windows Desktop GUI (portfolio_gui.exe)...
echo -------------------------------------------------------------------------------
g++ -std=c++11 -Wall -O2 Win32App.cpp Portfolio.cpp -mwindows -lcomctl32 -lcomdlg32 -lgdi32 -luser32 -o portfolio_gui.exe
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] portfolio_gui.exe built successfully!
    echo Run via: portfolio_gui.exe
) else (
    echo [ERROR] Failed to compile portfolio_gui.exe
)
goto finish

:build_console
echo -------------------------------------------------------------------------------
echo Building Pure C++ Console Application (portfolio.exe)...
echo -------------------------------------------------------------------------------
g++ -std=c++11 -Wall -O2 main.cpp Portfolio.cpp -o portfolio.exe
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] portfolio.exe built successfully!
    echo Run via: portfolio.exe
) else (
    echo [ERROR] Failed to compile portfolio.exe
)
goto finish

:build_tests
echo -------------------------------------------------------------------------------
echo Compiling and Running Automated Tests (test_runner.exe)...
echo -------------------------------------------------------------------------------
g++ -std=c++11 -Wall -O2 test_portfolio.cpp Portfolio.cpp -o test_runner.exe
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] test_runner.exe built successfully. Running tests...
    echo.
    test_runner.exe
) else (
    echo [ERROR] Failed to compile test_runner.exe
)
goto finish

:build_all
echo -------------------------------------------------------------------------------
echo Building All Targets (Console + Win32 GUI + Tests)...
echo -------------------------------------------------------------------------------
g++ -std=c++11 -Wall -O2 main.cpp Portfolio.cpp -o portfolio.exe
if %ERRORLEVEL% EQU 0 (
    echo  [OK] portfolio.exe built.
) else (
    echo  [FAIL] portfolio.exe failed.
)

g++ -std=c++11 -Wall -O2 Win32App.cpp Portfolio.cpp -mwindows -lcomctl32 -lcomdlg32 -lgdi32 -luser32 -o portfolio_gui.exe
if %ERRORLEVEL% EQU 0 (
    echo  [OK] portfolio_gui.exe built.
) else (
    echo  [FAIL] portfolio_gui.exe failed.
)

g++ -std=c++11 -Wall -O2 test_portfolio.cpp Portfolio.cpp -o test_runner.exe
if %ERRORLEVEL% EQU 0 (
    echo  [OK] test_runner.exe built.
) else (
    echo  [FAIL] test_runner.exe failed.
)
goto finish

:build_and_run_gui
echo -------------------------------------------------------------------------------
echo Building and Launching Native Windows Desktop GUI...
echo -------------------------------------------------------------------------------
g++ -std=c++11 -Wall -O2 Win32App.cpp Portfolio.cpp -mwindows -lcomctl32 -lcomdlg32 -lgdi32 -luser32 -o portfolio_gui.exe
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Launching portfolio_gui.exe...
    start portfolio_gui.exe
) else (
    echo [ERROR] Failed to compile portfolio_gui.exe
)
goto finish

:finish
echo ===============================================================================
pause
