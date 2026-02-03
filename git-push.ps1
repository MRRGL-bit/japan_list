# GitHub 저장소에 커밋 & 푸시 스크립트
# 사용법: PowerShell에서 .\git-push.ps1 실행
# (Git 설치 필요: https://git-scm.com/download/win)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$remote = "https://github.com/MRRGL-bit/japan_list.git"

# Git 설치 확인
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git이 설치되어 있지 않거나 PATH에 없습니다."
    Write-Host "https://git-scm.com/download/win 에서 설치 후 다시 실행해 주세요."
    exit 1
}

# 원격이 없으면 추가
$currentRemote = git remote get-url origin 2>$null
if (-not $currentRemote) {
    git remote add origin $remote
    Write-Host "원격 저장소 추가: $remote"
} elseif ($currentRemote -ne $remote) {
    git remote set-url origin $remote
    Write-Host "원격 URL 변경: $remote"
}

# 상태 확인
git status

# 모두 스테이징
git add -A

# 커밋 (변경 없으면 스킵)
$status = git status --porcelain
if ($status) {
    git commit -m "Vercel 배포 설정 수정 (buildCommand, deploy 실패 해결)"
    git branch -M main 2>$null
    git push -u origin main
    Write-Host "푸시 완료: $remote"
} else {
    Write-Host "커밋할 변경 사항이 없습니다."
}
