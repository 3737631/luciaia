$root = "C:\Users\Paquito\AppData\Local\Temp\opencode\gh-pages\call"
$ts = (Get-Date -Format "yyyyMMddHHmm")
Get-ChildItem "$root\*\index.html" | ForEach-Object {
  $p = $_.FullName
  $c = [System.IO.File]::ReadAllText($p)
  $c = $c -replace "page-e6c292eae4ab6d38", "page-v$ts"
  [System.IO.File]::WriteAllText($p, $c)
  Write-Host "$($_.Directory.Name): OK"
}
Remove-Item $PSCommandPath -Force
