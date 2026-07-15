$src = "C:\Users\Paquito\Downloads\luciaia-clone\out"
$repo = "https://github.com/3737631/luciaia.git"
$dst = "C:\Users\Paquito\AppData\Local\Temp\gh-pages-deploy"

if (Test-Path $dst) { Remove-Item -Path $dst -Recurse -Force }
New-Item -ItemType Directory -Path $dst -Force | Out-Null

Set-Location $dst
git init -q
git checkout -b gh-pages 2>&1 | Out-Null

Get-ChildItem -Path $src -Force | Copy-Item -Destination $dst -Recurse -Force

git add -A 2>&1 | Out-Null
git commit -m "deploy $(Get-Date -Format yyyy-MM-dd)" 2>&1 | Out-Null
git remote add origin $repo 2>&1 | Out-Null

Write-Output "Pushing..."
git push origin gh-pages --force 2>&1
Write-Output "DONE"
