@echo off
echo === ThinkPad HDMI Quick Fixes ===
echo.
echo This provides immediate fixes for ThinkPad HDMI connection issues.
echo Run as Administrator for best results.
echo.

:menu
cls
echo === ThinkPad HDMI Menu ===
echo.
echo 1. Restart Graphics Drivers (Win+Ctrl+Shift+B)
echo 2. Switch to External Display Only
echo 3. Switch to Extend Display  
echo 4. Switch to Duplicate Display
echo 5. Open NVIDIA Control Panel
echo 6. Open Intel Graphics Settings
echo 7. Open Display Settings
echo 8. Open Lenovo Vantage
echo 9. Disable/Enable Display Adapters
echo 10. Run ThinkPad Comprehensive Fix
echo 11. Exit
echo.
set /p choice="Enter your choice (1-11): "

if "%choice%"=="1" (
    echo.
    echo Press Windows+Ctrl+Shift+B now to restart graphics drivers
    echo You should see the screen flicker briefly
    echo.
    pause
    goto menu
)
if "%choice%"=="2" (
    echo Switching to external display only...
    displayswitch.exe /external
    goto menu
)
if "%choice%"=="3" (
    echo Extending display...
    displayswitch.exe /extend
    goto menu
)
if "%choice%"=="4" (
    echo Duplicating display...
    displayswitch.exe /clone
    goto menu
)
if "%choice%"=="5" (
    echo Opening NVIDIA Control Panel...
    start "" "C:\Program Files\NVIDIA Corporation\Control Panel Client\nvcplui.exe" 2>nul
    if errorlevel 1 (
        echo NVIDIA Control Panel not found. Try updating NVIDIA drivers.
        pause
    )
    goto menu
)
if "%choice%"=="6" (
    echo Opening Intel Graphics Settings...
    start "" "C:\Windows\System32\igfxcuiservice.exe" 2>nul
    if errorlevel 1 (
        echo Intel Graphics Settings not found. Try from Windows Store.
        pause
    )
    goto menu
)
if "%choice%"=="7" (
    echo Opening Display Settings...
    start ms-settings:display
    goto menu
)
if "%choice%"=="8" (
    echo Opening Lenovo Vantage...
    start lenovovantage: 2>nul
    if errorlevel 1 (
        echo Lenovo Vantage not found. Install from Microsoft Store.
        pause
    )
    goto menu
)
if "%choice%"=="9" (
    echo Opening Device Manager to manage display adapters...
    devmgmt.msc
    echo.
    echo In Device Manager:
    echo 1. Expand "Display adapters"
    echo 2. Right-click each graphics device
    echo 3. Select "Disable device" then "Enable device"
    echo 4. This forces Windows to reinitialize the graphics drivers
    echo.
    pause
    goto menu
)
if "%choice%"=="10" (
    echo Running comprehensive ThinkPad fix script...
    powershell -ExecutionPolicy Bypass -File "thinkpad_hdmi_fix.ps1"
    pause
    goto menu
)
if "%choice%"=="11" (
    exit
)

echo Invalid choice. Please try again.
pause
goto menu
