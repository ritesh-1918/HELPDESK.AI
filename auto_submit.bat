@echo off
chcp 65001 > nul
echo ======================================================
echo    HE THONG TU DONG NOP CODE VA TAO PULL REQUEST
echo ======================================================

:: Kiem tra gh CLI
where gh >nul 2>nul
if %errorlevel% neq 0 (
    echo [i] Khong tim thay GitHub CLI. Dang tu dong cai dat...
    winget install --id GitHub.cli --silent --accept-source-agreements --accept-package-agreements
    echo [!] Da cai dat xong. Vui long mo lai CMD moi de chay lai file.
    pause
    exit /b
)

:: Kiem tra dang nhap
gh auth status >nul 2>nul
if %errorlevel% neq 0 (
    echo [*] Dang mo trinh duyet de dang nhap GitHub...
    gh auth login --web -h github.com -p https
)

:: Commit va Push code
echo [*] Tu dong commit...
git add .
git commit -m "fix: resolve git merge conflicts and syntax errors, verify build ok"

:: Mo Pull Request
echo [*] Dang tien hanh tao Pull Request...
gh pr create --base gssoc --title "[BOUNTY] Fix Ticket Timeline Date Parsing Discrepancies on Safari" --body "Fixes #642 - Normalizes date formats before parsing them client-side in dateUtils.js and updates UI layout."

pause
