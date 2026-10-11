cmake_minimum_required(VERSION 3.16)
project(StockPortfolioManagementSystem VERSION 2.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

# Find Qt packages (Qt 6 or fallback to Qt 5)
find_package(QT NAMES Qt6 Qt5 REQUIRED COMPONENTS Core Gui Widgets)
find_package(Qt${QT_VERSION_MAJOR} REQUIRED COMPONENTS Core Gui Widgets)

add_executable(portfolio_gui
    WIN32
    main_qt.cpp
    MainWindow.h
    MainWindow.cpp
    Portfolio.h
    Portfolio.cpp
)

target_link_libraries(portfolio_gui PRIVATE
    Qt${QT_VERSION_MAJOR}::Core
    Qt${QT_VERSION_MAJOR}::Gui
    Qt${QT_VERSION_MAJOR}::Widgets
)

# Output executable directly to project root for ease of execution
set_target_properties(portfolio_gui PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}"
)
