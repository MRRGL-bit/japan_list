# GitHub 자동 커밋 & 푸시 스크립트
# 사용법: PowerShell에서 .\git-push.ps1 실행
# * Git 설치 필요: https://git-scm.com/download/win

$ErrorActionPreference = "Stop"
$repoUrl = "https://github.com/MRRGL-bit/japan_list.git"

Set-Location $PSScriptRoot

# Git 설치 여부 확인
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "오류: Git이 설치되어 있지 않거나 PATH에 없습니다." -ForegroundColor Red
    Write-Host "Git 설치: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# 초기화 (이미 되어 있으면 무시)
if (-not (Test-Path .git)) {
    git init
    git branch -M main
}

# 원격 저장소 설정 (이미 있으면 URL만 업데이트)
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    git remote add origin $repoUrl
} elseif ($remote -ne $repoUrl) {
    git remote set-url origin $repoUrl
}

# 추가, 커밋, 푸시
git add .
$status = git status --short
if (-not $status) {
    Write-Host "변경 사항이 없습니다." -ForegroundColor Yellow
    exit 0
}
git commit -m "Update: 일본어 공부 사이트 파일 업데이트"
git push -u origin main

Write-Host "푸시 완료: $repoUrl" -ForegroundColor Green
