# Regénere tp-manifest.json : libelles "Theme [em-dash] TP n" (meme style que sur le site).
# 1re année : Documents/TP/premiere-annee/<thème>/*.pdf
# 2e année  : Documents/TP/seconde-annee/<thème>/*.pdf + PDF à la racine (libellés « Divers — … »)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")

function Get-TpNumber([string]$fileName) {
  if ($fileName -match '(?i)[Tt][Pp]\s*(\d+)') { return [int]$Matches[1] }
  if ($fileName -match '(?i)_TP(\d+)') { return [int]$Matches[1] }
  return 9999
}

function Collect-Items([string]$absRoot) {
  $md = [char]0x2014
  $items = @()
  if (-not (Test-Path -LiteralPath $absRoot)) { return $items }
  Get-ChildItem -LiteralPath $absRoot -Directory -ErrorAction SilentlyContinue | Sort-Object Name | ForEach-Object {
    $theme = $_.Name
    Get-ChildItem -LiteralPath $_.FullName -Filter *.pdf -File -ErrorAction SilentlyContinue |
      Sort-Object { Get-TpNumber $_.Name }, Name |
      ForEach-Object {
        $n = Get-TpNumber $_.Name
        $suffix = if ($n -eq 9999) { "$md document" } else { "$md TP $n" }
        $items += [PSCustomObject]@{ rel = "$theme/$($_.Name)"; label = "$theme $suffix" }
      }
  }
  Get-ChildItem -LiteralPath $absRoot -Filter *.pdf -File -ErrorAction SilentlyContinue | Sort-Object Name | ForEach-Object {
    $n = Get-TpNumber $_.Name
    $suffix = if ($n -eq 9999) { "$md document" } else { "$md TP $n" }
    $items += [PSCustomObject]@{ rel = $_.Name; label = "Divers $suffix" }
  }
  return $items
}

$premAbs = Join-Path $root "Documents\TP\premiere-annee"
$secAbs = Join-Path $root "Documents\TP\seconde-annee"

$out = [PSCustomObject]@{
  premiere = [PSCustomObject]@{
    bundle = "Documents/TP/premiere-annee"
    items  = @(Collect-Items $premAbs)
  }
  seconde = [PSCustomObject]@{
    bundle = "Documents/TP/seconde-annee"
    items  = @(Collect-Items $secAbs)
  }
}

$jsonPath = Join-Path $PSScriptRoot "tp-manifest.json"
$out | ConvertTo-Json -Depth 8 | Set-Content -Path $jsonPath -Encoding utf8
Write-Host "OK : $($out.premiere.items.Count) PDF 1re année, $($out.seconde.items.Count) PDF 2e année -> $jsonPath"
