param([Parameter(Mandatory = $true)][string]$PackageArchive)

$ErrorActionPreference = 'Stop'
$workspace = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../../..')).Path
$archive = (Resolve-Path -LiteralPath $PackageArchive).Path
$scratchBase = 'C:\Users\Administrator\Documents\Codex\scratch-tests'
$taskPath = Join-Path $scratchBase ('pro-minimum-peers-' + [guid]::NewGuid().ToString('N'))
$created = $false
$result = 1
try {
  New-Item -ItemType Directory -Path $taskPath | Out-Null
  $created = $true
  $manifest = @{
    name = 'pro-minimum-peer-check'; private = $true; type = 'module'
    dependencies = @{
      '@bubblesjs/antv-next-pro' = ('file:' + $archive.Replace('\', '/'))
      'antdv-next' = '1.5.2'; vue = '3.5.0'; typescript = '5.9.3'; '@types/node' = '24.0.0'
    }
  }
  $manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $taskPath 'package.json') -Encoding utf8
  $consumer = Join-Path $workspace 'packages/antdv-next-pro/tests/consumer'
  Get-ChildItem -LiteralPath $consumer -File | Where-Object { $_.Extension -in '.mts', '.cts', '.json' } | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $taskPath $_.Name)
  }
  Push-Location $taskPath
  try {
    & pnpm.cmd install --ignore-scripts --no-frozen-lockfile *> (Join-Path $PSScriptRoot 'minimum-peers-install.log')
    if ($LASTEXITCODE -ne 0) { throw '最低 peer 依赖安装失败' }
    & pnpm.cmd exec tsc -p tsconfig.json *> (Join-Path $PSScriptRoot 'minimum-peers-types.log')
    if ($LASTEXITCODE -ne 0) { throw '最低 peer 消费者类型检查失败' }
  } finally { Pop-Location }
  & node (Join-Path $PSScriptRoot 'verify-minimum-peers.mjs') $taskPath *> (Join-Path $PSScriptRoot 'minimum-peers-browser.log')
  if ($LASTEXITCODE -ne 0) { throw '最低 peer 浏览器检查失败' }
  $result = 0
} finally {
  if ($created -and (Test-Path -LiteralPath $taskPath)) {
    $resolvedTask = (Resolve-Path -LiteralPath $taskPath).Path
    $resolvedBase = (Resolve-Path -LiteralPath $scratchBase).Path.TrimEnd('\') + '\'
    if (-not $resolvedTask.StartsWith($resolvedBase, [System.StringComparison]::OrdinalIgnoreCase)) {
      throw "清理目标不在本次测试范围：$resolvedTask"
    }
    $item = Get-Item -LiteralPath $resolvedTask -Force
    if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
      throw "测试目录成为链接，保留并停止清理：$resolvedTask"
    }
    Remove-Item -LiteralPath $resolvedTask -Recurse -Force
    Write-Output "已清理本次最低 peer 测试目录：$resolvedTask"
  }
}
exit $result
