@echo off
echo Adding firewall rule for Next.js dev server on port 3000...
echo This requires Administrator privileges!
echo.

netsh advfirewall firewall add rule name="Next.js Dev Server Port 3000" dir=in action=allow protocol=TCP localport=3000

if %errorlevel% == 0 (
    echo.
    echo SUCCESS! Firewall rule added.
    echo.
    echo You can now access your app from your phone at:
    echo http://192.168.1.19:3000
    echo.
    echo Make sure:
    echo 1. Your phone is on the same Wi-Fi network
    echo 2. The dev server is running (npm run dev)
    echo.
) else (
    echo.
    echo ERROR: Failed to add firewall rule.
    echo Please run this file as Administrator!
    echo Right-click and select "Run as administrator"
    echo.
)

pause























