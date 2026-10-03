@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    CODGAR Universal Windows Installer & Launcher
echo ======================================================

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js not found!
    echo Downloading Node.js 20 LTS for Windows...
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi' -OutFile '%TEMP%\node_installer.msi'"
    echo Installing Node.js, please grant permission if prompted...
    msiexec /i "%TEMP%\node_installer.msi" /passive
    echo Installation finished. Reloading PATH...
    set "PATH=%PATH%;C:\Program Files\nodejs"
) else (
    echo [OK] Node.js is already installed.
)

:: Setup .env
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
    ) else (
        echo PORT=3000 > .env
    )
)

:: Install dependencies
echo Installing packages and modules...
call npm install --no-audit --no-fund

echo ======================================================
echo    Codgar AI is ready! Starting on port 3000...
echo ======================================================
call npm run dev
pause
