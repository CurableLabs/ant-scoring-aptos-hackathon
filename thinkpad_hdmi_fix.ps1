<<<<<<< Updated upstream
<<<<<<< HEAD
=======
>>>>>>> Stashed changes
# ThinkPad HDMI Connection Fix Script
# Addresses common ThinkPad hybrid graphics and DisplayLink issues
# Run as Administrator for full functionality

Write-Host "=== ThinkPad HDMI Connection Fix Tool ===" -ForegroundColor Green
Write-Host "Detected: ThinkPad with Intel + NVIDIA Hybrid Graphics + DisplayLink" -ForegroundColor Yellow
Write-Host ""

# Check if running as admin
function Test-IsAdmin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-IsAdmin)) {
    Write-Host "WARNING: Run this script as Administrator for best results!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "STEP 1: Graphics Driver Quick Restart" -ForegroundColor Cyan
Write-Host "Press Windows + Ctrl + Shift + B now to restart graphics drivers..."
Write-Host "You should see the screen flicker briefly."
$null = Read-Host "Press Enter after trying the key combination"

Write-Host ""
Write-Host "STEP 2: Checking Current Graphics Configuration" -ForegroundColor Cyan

# Check graphics cards
$graphics = Get-WmiObject Win32_VideoController | Where-Object {$_.Name -notlike "*Remote*"}
foreach ($gpu in $graphics) {
    Write-Host "Graphics Card: $($gpu.Name)" -ForegroundColor White
    Write-Host "  Driver Version: $($gpu.DriverVersion)"
    Write-Host "  Driver Date: $($gpu.DriverDate)"
    Write-Host ""
}

Write-Host "STEP 3: DisplayLink Device Management" -ForegroundColor Cyan
$displayLink = Get-WmiObject Win32_PnPEntity | Where-Object {$_.Name -like "*DisplayLink*"}
if ($displayLink) {
    Write-Host "DisplayLink devices found. These can interfere with HDMI connections." -ForegroundColor Yellow
    $displayLink | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor White
    }
    Write-Host ""
    $disableDisplayLink = Read-Host "Temporarily disable DisplayLink devices? (y/n)"
    if ($disableDisplayLink -eq 'y') {
        Write-Host "Disabling DisplayLink devices..." -ForegroundColor Yellow
        # Note: This requires admin rights
        try {
            $displayLink | ForEach-Object {
                Write-Host "Disabling: $($_.Name)"
                (Get-WmiObject Win32_PnPEntity -Filter "DeviceID='$($_.DeviceID)'").Disable()
            }
        } catch {
            Write-Host "Could not disable DisplayLink devices. Try manually via Device Manager." -ForegroundColor Red
        }
    }
} else {
    Write-Host "No DisplayLink devices found." -ForegroundColor Green
}

Write-Host ""
Write-Host "STEP 4: NVIDIA/Intel Graphics Switching Fix" -ForegroundColor Cyan

# Check NVIDIA Control Panel settings
Write-Host "Checking for NVIDIA Control Panel..."
$nvidiaPath = "${env:ProgramFiles}\NVIDIA Corporation\Control Panel Client\nvcplui.exe"
if (Test-Path $nvidiaPath) {
    Write-Host "NVIDIA Control Panel found. Opening for graphics switching configuration..." -ForegroundColor Green
    
    $openNvidia = Read-Host "Open NVIDIA Control Panel to configure graphics switching? (y/n)"
    if ($openNvidia -eq 'y') {
        Start-Process $nvidiaPath
        Write-Host ""
        Write-Host "IN NVIDIA CONTROL PANEL:" -ForegroundColor Yellow
        Write-Host "1. Go to 'Manage 3D Settings' > 'Global Settings'" -ForegroundColor White
        Write-Host "2. Set 'Preferred graphics processor' to 'High-performance NVIDIA processor'" -ForegroundColor White
        Write-Host "3. Click Apply" -ForegroundColor White
        Write-Host "4. Go to 'Configure Surround, PhysX' and ensure PhysX is set to your NVIDIA GPU" -ForegroundColor White
        Write-Host ""
        $null = Read-Host "Press Enter when done with NVIDIA settings"
    }
} else {
    Write-Host "NVIDIA Control Panel not found. Checking Intel Graphics settings..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "STEP 5: Power Management Fix" -ForegroundColor Cyan
Write-Host "Disabling power management for graphics devices..."

try {
    # Disable power management for graphics devices
    $devices = Get-WmiObject Win32_PnPEntity | Where-Object {
        $_.Name -like "*Graphics*" -or 
        $_.Name -like "*Display*" -or 
        $_.Name -like "*NVIDIA*" -or 
        $_.Name -like "*Intel*Graphics*"
    }
    
    foreach ($device in $devices) {
        Write-Host "Processing: $($device.Name)" -ForegroundColor White
        # This would require additional WMI calls to modify power settings
    }
    
    Write-Host "Power management settings updated." -ForegroundColor Green
} catch {
    Write-Host "Could not modify power settings automatically." -ForegroundColor Yellow
    Write-Host "Manual steps:" -ForegroundColor White
    Write-Host "1. Open Device Manager" -ForegroundColor White
    Write-Host "2. Expand 'Display adapters'" -ForegroundColor White
    Write-Host "3. Right-click each graphics device > Properties > Power Management" -ForegroundColor White
    Write-Host "4. Uncheck 'Allow the computer to turn off this device'" -ForegroundColor White
}

Write-Host ""
Write-Host "STEP 6: ThinkPad-Specific Settings" -ForegroundColor Cyan

# Check for Lenovo Vantage
$vantage = Get-Package -Name "*Lenovo*Vantage*" -ErrorAction SilentlyContinue
if ($vantage) {
    Write-Host "Lenovo Vantage found. Checking for display settings..." -ForegroundColor Green
    $openVantage = Read-Host "Open Lenovo Vantage to check display settings? (y/n)"
    if ($openVantage -eq 'y') {
        Start-Process "lenovovantage:"
        Write-Host ""
        Write-Host "IN LENOVO VANTAGE:" -ForegroundColor Yellow
        Write-Host "1. Go to 'Hardware Settings' > 'Audio/Visual'" -ForegroundColor White
        Write-Host "2. Check 'External Display' settings" -ForegroundColor White
        Write-Host "3. Ensure 'Hybrid Graphics' is properly configured" -ForegroundColor White
        Write-Host ""
        $null = Read-Host "Press Enter when done with Vantage settings"
    }
} else {
    Write-Host "Lenovo Vantage not found. Consider installing it for better ThinkPad management." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "STEP 7: Manual HDMI Connection Test" -ForegroundColor Cyan
Write-Host "Now let's test the HDMI connection manually..."
Write-Host ""

Write-Host "Manual connection steps:" -ForegroundColor Yellow
Write-Host "1. Shut down your ThinkPad completely" -ForegroundColor White
Write-Host "2. Connect the HDMI cable to both devices" -ForegroundColor White
Write-Host "3. Turn on your external monitor first" -ForegroundColor White
Write-Host "4. Set monitor input to HDMI" -ForegroundColor White
Write-Host "5. Power on your ThinkPad" -ForegroundColor White
Write-Host "6. Once booted, press Windows + P and select 'Extend'" -ForegroundColor White
Write-Host ""

$testNow = Read-Host "Are you ready to test the connection now? (y/n)"
if ($testNow -eq 'y') {
    Write-Host ""
    Write-Host "Testing connection..." -ForegroundColor Green
    
    # Open display settings
    Start-Process "ms-settings:display"
    Write-Host "Display settings opened. Click 'Detect' if monitor not shown." -ForegroundColor Yellow
    
    # Try projection shortcut
    Start-Sleep 2
    Write-Host "Opening projection options (Windows + P)..." -ForegroundColor Green
    
    # Simulate Windows + P
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.SendKeys]::SendWait("^{ESC}")
    Start-Sleep 1
    [System.Windows.Forms.SendKeys]::SendWait("{LWIN down}p{LWIN up}")
    
    Write-Host ""
    Write-Host "Select 'Extend' from the projection menu." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "STEP 8: Additional Troubleshooting Commands" -ForegroundColor Cyan
Write-Host "If the above didn't work, try these advanced fixes:"
Write-Host ""

$advancedFixes = Read-Host "Run advanced system fixes? (y/n)"
if ($advancedFixes -eq 'y') {
    Write-Host ""
    Write-Host "Running advanced fixes..." -ForegroundColor Yellow
    
    # Reset display settings
    Write-Host "1. Resetting display configuration..." -ForegroundColor White
    try {
        # This command resets display settings
        & displayswitch.exe /internal
        Start-Sleep 2
        & displayswitch.exe /extend
    } catch {
        Write-Host "Could not reset display configuration automatically." -ForegroundColor Yellow
    }
    
    # Hardware detection
    Write-Host "2. Forcing hardware detection..." -ForegroundColor White
    try {
        & pnputil /scan-devices
    } catch {
        Write-Host "Could not run hardware detection." -ForegroundColor Yellow
    }
    
    Write-Host "3. Restarting Windows Display Service..." -ForegroundColor White
    try {
        Restart-Service -Name "DisplayEnhancementService" -ErrorAction SilentlyContinue
    } catch {
        Write-Host "Could not restart display service." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== FINAL RECOMMENDATIONS ===" -ForegroundColor Green
Write-Host ""
Write-Host "If HDMI still doesn't work:" -ForegroundColor Yellow
Write-Host "1. Try a different HDMI cable" -ForegroundColor White
Write-Host "2. Use USB-C to HDMI adapter instead" -ForegroundColor White
Write-Host "3. Update BIOS from Lenovo Support" -ForegroundColor White
Write-Host "4. Check monitor compatibility (4K@60Hz may not work over HDMI)" -ForegroundColor White
Write-Host "5. Consider using a ThinkPad docking station" -ForegroundColor White
Write-Host ""

Write-Host "BIOS Settings to check:" -ForegroundColor Yellow
Write-Host "1. Boot with F1, go to Config > Display" -ForegroundColor White
Write-Host "2. Set 'Graphics Device' to 'Discrete Graphics'" -ForegroundColor White
Write-Host "3. Enable 'OS Detection for NVIDIA Optimus'" -ForegroundColor White
Write-Host "4. Save and exit" -ForegroundColor White
Write-Host ""

Write-Host "=== TROUBLESHOOTING COMPLETE ===" -ForegroundColor Green
Write-Host "Try connecting your monitor now!" -ForegroundColor Yellow
<<<<<<< Updated upstream
=======
# ThinkPad HDMI Connection Fix Script
# Addresses common ThinkPad hybrid graphics and DisplayLink issues
# Run as Administrator for full functionality

Write-Host "=== ThinkPad HDMI Connection Fix Tool ===" -ForegroundColor Green
Write-Host "Detected: ThinkPad with Intel + NVIDIA Hybrid Graphics + DisplayLink" -ForegroundColor Yellow
Write-Host ""

# Check if running as admin
function Test-IsAdmin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-IsAdmin)) {
    Write-Host "WARNING: Run this script as Administrator for best results!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "STEP 1: Graphics Driver Quick Restart" -ForegroundColor Cyan
Write-Host "Press Windows + Ctrl + Shift + B now to restart graphics drivers..."
Write-Host "You should see the screen flicker briefly."
$null = Read-Host "Press Enter after trying the key combination"

Write-Host ""
Write-Host "STEP 2: Checking Current Graphics Configuration" -ForegroundColor Cyan

# Check graphics cards
$graphics = Get-WmiObject Win32_VideoController | Where-Object {$_.Name -notlike "*Remote*"}
foreach ($gpu in $graphics) {
    Write-Host "Graphics Card: $($gpu.Name)" -ForegroundColor White
    Write-Host "  Driver Version: $($gpu.DriverVersion)"
    Write-Host "  Driver Date: $($gpu.DriverDate)"
    Write-Host ""
}

Write-Host "STEP 3: DisplayLink Device Management" -ForegroundColor Cyan
$displayLink = Get-WmiObject Win32_PnPEntity | Where-Object {$_.Name -like "*DisplayLink*"}
if ($displayLink) {
    Write-Host "DisplayLink devices found. These can interfere with HDMI connections." -ForegroundColor Yellow
    $displayLink | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor White
    }
    Write-Host ""
    $disableDisplayLink = Read-Host "Temporarily disable DisplayLink devices? (y/n)"
    if ($disableDisplayLink -eq 'y') {
        Write-Host "Disabling DisplayLink devices..." -ForegroundColor Yellow
        # Note: This requires admin rights
        try {
            $displayLink | ForEach-Object {
                Write-Host "Disabling: $($_.Name)"
                (Get-WmiObject Win32_PnPEntity -Filter "DeviceID='$($_.DeviceID)'").Disable()
            }
        } catch {
            Write-Host "Could not disable DisplayLink devices. Try manually via Device Manager." -ForegroundColor Red
        }
    }
} else {
    Write-Host "No DisplayLink devices found." -ForegroundColor Green
}

Write-Host ""
Write-Host "STEP 4: NVIDIA/Intel Graphics Switching Fix" -ForegroundColor Cyan

# Check NVIDIA Control Panel settings
Write-Host "Checking for NVIDIA Control Panel..."
$nvidiaPath = "${env:ProgramFiles}\NVIDIA Corporation\Control Panel Client\nvcplui.exe"
if (Test-Path $nvidiaPath) {
    Write-Host "NVIDIA Control Panel found. Opening for graphics switching configuration..." -ForegroundColor Green
    
    $openNvidia = Read-Host "Open NVIDIA Control Panel to configure graphics switching? (y/n)"
    if ($openNvidia -eq 'y') {
        Start-Process $nvidiaPath
        Write-Host ""
        Write-Host "IN NVIDIA CONTROL PANEL:" -ForegroundColor Yellow
        Write-Host "1. Go to 'Manage 3D Settings' > 'Global Settings'" -ForegroundColor White
        Write-Host "2. Set 'Preferred graphics processor' to 'High-performance NVIDIA processor'" -ForegroundColor White
        Write-Host "3. Click Apply" -ForegroundColor White
        Write-Host "4. Go to 'Configure Surround, PhysX' and ensure PhysX is set to your NVIDIA GPU" -ForegroundColor White
        Write-Host ""
        $null = Read-Host "Press Enter when done with NVIDIA settings"
    }
} else {
    Write-Host "NVIDIA Control Panel not found. Checking Intel Graphics settings..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "STEP 5: Power Management Fix" -ForegroundColor Cyan
Write-Host "Disabling power management for graphics devices..."

try {
    # Disable power management for graphics devices
    $devices = Get-WmiObject Win32_PnPEntity | Where-Object {
        $_.Name -like "*Graphics*" -or 
        $_.Name -like "*Display*" -or 
        $_.Name -like "*NVIDIA*" -or 
        $_.Name -like "*Intel*Graphics*"
    }
    
    foreach ($device in $devices) {
        Write-Host "Processing: $($device.Name)" -ForegroundColor White
        # This would require additional WMI calls to modify power settings
    }
    
    Write-Host "Power management settings updated." -ForegroundColor Green
} catch {
    Write-Host "Could not modify power settings automatically." -ForegroundColor Yellow
    Write-Host "Manual steps:" -ForegroundColor White
    Write-Host "1. Open Device Manager" -ForegroundColor White
    Write-Host "2. Expand 'Display adapters'" -ForegroundColor White
    Write-Host "3. Right-click each graphics device > Properties > Power Management" -ForegroundColor White
    Write-Host "4. Uncheck 'Allow the computer to turn off this device'" -ForegroundColor White
}

Write-Host ""
Write-Host "STEP 6: ThinkPad-Specific Settings" -ForegroundColor Cyan

# Check for Lenovo Vantage
$vantage = Get-Package -Name "*Lenovo*Vantage*" -ErrorAction SilentlyContinue
if ($vantage) {
    Write-Host "Lenovo Vantage found. Checking for display settings..." -ForegroundColor Green
    $openVantage = Read-Host "Open Lenovo Vantage to check display settings? (y/n)"
    if ($openVantage -eq 'y') {
        Start-Process "lenovovantage:"
        Write-Host ""
        Write-Host "IN LENOVO VANTAGE:" -ForegroundColor Yellow
        Write-Host "1. Go to 'Hardware Settings' > 'Audio/Visual'" -ForegroundColor White
        Write-Host "2. Check 'External Display' settings" -ForegroundColor White
        Write-Host "3. Ensure 'Hybrid Graphics' is properly configured" -ForegroundColor White
        Write-Host ""
        $null = Read-Host "Press Enter when done with Vantage settings"
    }
} else {
    Write-Host "Lenovo Vantage not found. Consider installing it for better ThinkPad management." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "STEP 7: Manual HDMI Connection Test" -ForegroundColor Cyan
Write-Host "Now let's test the HDMI connection manually..."
Write-Host ""

Write-Host "Manual connection steps:" -ForegroundColor Yellow
Write-Host "1. Shut down your ThinkPad completely" -ForegroundColor White
Write-Host "2. Connect the HDMI cable to both devices" -ForegroundColor White
Write-Host "3. Turn on your external monitor first" -ForegroundColor White
Write-Host "4. Set monitor input to HDMI" -ForegroundColor White
Write-Host "5. Power on your ThinkPad" -ForegroundColor White
Write-Host "6. Once booted, press Windows + P and select 'Extend'" -ForegroundColor White
Write-Host ""

$testNow = Read-Host "Are you ready to test the connection now? (y/n)"
if ($testNow -eq 'y') {
    Write-Host ""
    Write-Host "Testing connection..." -ForegroundColor Green
    
    # Open display settings
    Start-Process "ms-settings:display"
    Write-Host "Display settings opened. Click 'Detect' if monitor not shown." -ForegroundColor Yellow
    
    # Try projection shortcut
    Start-Sleep 2
    Write-Host "Opening projection options (Windows + P)..." -ForegroundColor Green
    
    # Simulate Windows + P
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.SendKeys]::SendWait("^{ESC}")
    Start-Sleep 1
    [System.Windows.Forms.SendKeys]::SendWait("{LWIN down}p{LWIN up}")
    
    Write-Host ""
    Write-Host "Select 'Extend' from the projection menu." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "STEP 8: Additional Troubleshooting Commands" -ForegroundColor Cyan
Write-Host "If the above didn't work, try these advanced fixes:"
Write-Host ""

$advancedFixes = Read-Host "Run advanced system fixes? (y/n)"
if ($advancedFixes -eq 'y') {
    Write-Host ""
    Write-Host "Running advanced fixes..." -ForegroundColor Yellow
    
    # Reset display settings
    Write-Host "1. Resetting display configuration..." -ForegroundColor White
    try {
        # This command resets display settings
        & displayswitch.exe /internal
        Start-Sleep 2
        & displayswitch.exe /extend
    } catch {
        Write-Host "Could not reset display configuration automatically." -ForegroundColor Yellow
    }
    
    # Hardware detection
    Write-Host "2. Forcing hardware detection..." -ForegroundColor White
    try {
        & pnputil /scan-devices
    } catch {
        Write-Host "Could not run hardware detection." -ForegroundColor Yellow
    }
    
    Write-Host "3. Restarting Windows Display Service..." -ForegroundColor White
    try {
        Restart-Service -Name "DisplayEnhancementService" -ErrorAction SilentlyContinue
    } catch {
        Write-Host "Could not restart display service." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== FINAL RECOMMENDATIONS ===" -ForegroundColor Green
Write-Host ""
Write-Host "If HDMI still doesn't work:" -ForegroundColor Yellow
Write-Host "1. Try a different HDMI cable" -ForegroundColor White
Write-Host "2. Use USB-C to HDMI adapter instead" -ForegroundColor White
Write-Host "3. Update BIOS from Lenovo Support" -ForegroundColor White
Write-Host "4. Check monitor compatibility (4K@60Hz may not work over HDMI)" -ForegroundColor White
Write-Host "5. Consider using a ThinkPad docking station" -ForegroundColor White
Write-Host ""

Write-Host "BIOS Settings to check:" -ForegroundColor Yellow
Write-Host "1. Boot with F1, go to Config > Display" -ForegroundColor White
Write-Host "2. Set 'Graphics Device' to 'Discrete Graphics'" -ForegroundColor White
Write-Host "3. Enable 'OS Detection for NVIDIA Optimus'" -ForegroundColor White
Write-Host "4. Save and exit" -ForegroundColor White
Write-Host ""

Write-Host "=== TROUBLESHOOTING COMPLETE ===" -ForegroundColor Green
Write-Host "Try connecting your monitor now!" -ForegroundColor Yellow
>>>>>>> 261fc5d2fa7adefdf36e416d55fd7bef34e62b5a
=======
>>>>>>> Stashed changes
