CXX = g++
CXXFLAGS = -std=c++11 -Wall -O2

all: portfolio.exe test_runner.exe

portfolio.exe: main.cpp Portfolio.cpp Portfolio.h
	$(CXX) $(CXXFLAGS) main.cpp Portfolio.cpp -o portfolio.exe

test_runner.exe: test_portfolio.cpp Portfolio.cpp Portfolio.h
	$(CXX) $(CXXFLAGS) test_portfolio.cpp Portfolio.cpp -o test_runner.exe

test: test_runner.exe
	./test_runner.exe

clean:
	del /f /q portfolio.exe test_runner.exe 2>nul || rm -f portfolio.exe test_runner.exe
