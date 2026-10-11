QT += core gui widgets

CONFIG += c++17 windows

TARGET = portfolio_gui
TEMPLATE = app

SOURCES += \
    main_qt.cpp \
    MainWindow.cpp \
    Portfolio.cpp

HEADERS += \
    MainWindow.h \
    Portfolio.h

# Windows subsystem
win32 {
    RC_ICONS =
}
