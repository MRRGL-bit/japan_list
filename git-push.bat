@echo off
chcp 65001 >nul
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
    echo 오류: Git이 설치되어 있지 않거나 PATH에 없습니다.
    echo Git 설치: https://git-scm.com/download/win
    pause
    exit /b 1
)

if not exist .git (
    git init
    git branch -M main
)

git remote remove origin 2>nul
git remote add origin https://github.com/MRRGL-bit/japan_list.git

git add .
git status --short
git commit -m "Update: 일본어 공부 사이트 파일 업데이트"
git push -u origin main

echo.
echo 푸시 완료.
pause
