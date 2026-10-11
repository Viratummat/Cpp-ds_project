#include <QApplication>
#include <QFont>
#include <QIcon>
#include "MainWindow.h"

int main(int argc, char *argv[])
{
    // Enable High DPI scaling for modern displays
#if QT_VERSION >= QT_VERSION_CHECK(5, 6, 0) && QT_VERSION < QT_VERSION_CHECK(6, 0, 0)
    QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
    QCoreApplication::setAttribute(Qt::AA_UseHighDpiPixmaps);
#endif

    QApplication app(argc, argv);
    app.setApplicationName("Stock Portfolio Management System");
    app.setApplicationVersion("2.0.0");
    app.setOrganizationName("Financial Systems");

    // Set default application font
    QFont defaultFont("Segoe UI", 10);
    defaultFont.setStyleHint(QFont::SansSerif);
    app.setFont(defaultFont);

    MainWindow window;
    window.show();

    return app.exec();
}
