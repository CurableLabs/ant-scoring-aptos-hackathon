@echo off
echo === Quick HDMI Connection Fixes ===
echo.
echo This script provides quick access to common HDMI troubleshooting commands.
echo Please run as Administrator for best results.
echo.
pause

:menu
cls
echo === HDMI Troubleshooting Menu ===
echo.
echo 1. Open Device Manager (Update Graphics Drivers)
echo 2. Open Display Settings
echo 3. Open Power Options
echo 4. Open Windows Update
echo 5. Run System File Checker
echo 6. Run DISM Health Check
echo 7. Open Event Viewer
echo 8. Restart Graphics Driver (Windows+Ctrl+Shift+B)
echo 9. Exit
echo.
set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" (
    echo Opening Device Manager...
    devmgmt.msc
    goto menu
)
if "%choice%"=="2" (
    echo Opening Display Settings...
    ms-settings:display
    goto menu
)
if "%choice%"=="3" (
    echo Opening Power Options...
    powercfg.cpl
    goto menu
)
if "%choice%"=="4" (
    echo Opening Windows Update...
    ms-settings:windowsupdate
    goto menu
)
if "%choice%"=="5" (
    echo Running System File Checker...
    echo This may take several minutes...
    sfc /scannow
    pause
    goto menu
)
if "%choice%"=="6" (
    echo Running DISM Health Check...
    echo This may take several minutes...
    dism /online /cleanup-image /restorehealth
    pause
    goto menu
)
if "%choice%"=="7" (
    echo Opening Event Viewer...
    eventvwr.msc
    goto menu
)
if "%choice%"=="8" (
    echo Use Windows+Ctrl+Shift+B to restart graphics driver
    echo Press those keys now, then press any key to continue...
    pause
    goto menu
)
if "%choice%"=="9" (
    exit
)

echo Invalid choice. Please try again.
pause
goto menu
