@echo off
setlocal enabledelayedexpansion

echo ===============================================================================
echo            Qt Widgets Build Script - Stock Portfolio System
echo ===============================================================================

:: Check for CMake
where cmake >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Found CMake. Configuring build directory...
    if not exist build mkdir build
    cd build
    cmake .. -G "MinGW Makefiles"
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] CMake configuration failed. Ensure Qt path is added to CMAKE_PREFIX_PATH.
        cd ..
        pause
        exit /b 1
    )
    cmake --build .
    if %ERRORLEVEL% EQU 0 (
        cd ..
        echo [SUCCESS] portfolio_gui.exe compiled successfully!
        echo Running portfolio_gui.exe...
        start portfolio_gui.exe
    ) else (
        echo [ERROR] Build failed.
        cd ..
    )
    pause
    exit /b 0
)

:: Check for qmake fallback
where qmake >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Found qmake. Running qmake and mingw32-make...
    qmake PortfolioQt.pro
    mingw32-make
    if %ERRORLEVEL% EQU 0 (
        echo [SUCCESS] portfolio_gui.exe compiled successfully!
        start portfolio_gui.exe
    ) else (
        echo [ERROR] Compilation failed.
    )
    pause
    exit /b 0
)

echo [ERROR] Neither CMake nor qmake was found in PATH.
echo.
echo To build the Qt GUI:
echo  1. Install Qt (Qt 6.x or Qt 5.15) via the official Qt Online Installer or MSYS2.
echo  2. Add the Qt bin directory and MinGW bin directory to your Windows PATH.
echo     Example: C:\Qt\6.6.2\mingw_64\bin
echo  3. Re-run build_qt.bat or open PortfolioQt.pro in Qt Creator / VS Code.
echo.
pause
