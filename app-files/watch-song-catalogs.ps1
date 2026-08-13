$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$demoDirectory = Join-Path $projectRoot 'demo-songs'
$communityDirectory = Join-Path $projectRoot 'community-songs'
$catalogPath = Join-Path $PSScriptRoot 'demo-catalog.js'

New-Item -ItemType Directory -Path $demoDirectory -Force | Out-Null
New-Item -ItemType Directory -Path $communityDirectory -Force | Out-Null

function Get-SongSlug([string] $name) {
  $slug = $name.ToLowerInvariant() -replace '[^a-z0-9]+', '-'
  return $slug.Trim('-')
}

function Read-SongFolder([string] $directory, [string] $folder) {
  $songs = @()
  Get-ChildItem -LiteralPath $directory -Filter '*.drumsong' -File |
    Sort-Object Name |
    ForEach-Object {
      try {
        $document = Get-Content -LiteralPath $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
        $song = $document.song
        if ($null -eq $song -or -not $song.title -or -not $song.sequence -or -not $song.bpm) {
          Write-Warning "Skipped $($_.Name): the file does not contain a complete song."
          return
        }
        $song | Add-Member -NotePropertyName id -NotePropertyValue (Get-SongSlug $_.BaseName) -Force
        $song | Add-Member -NotePropertyName builtIn -NotePropertyValue $true -Force
        $song | Add-Member -NotePropertyName folder -NotePropertyValue $folder -Force
        $songs += $song
      }
      catch {
        Write-Warning "Skipped $($_.Name): $($_.Exception.Message)"
      }
    }
  return @($songs)
}

function Write-SongCatalogs {
  $demoSongs = @(Read-SongFolder $demoDirectory 'demo')
  $communitySongs = @(Read-SongFolder $communityDirectory 'community')
  $demoJson = if ($demoSongs.Count) { ConvertTo-Json -InputObject @($demoSongs) -Depth 20 -Compress } else { '[]' }
  $communityJson = if ($communitySongs.Count) { ConvertTo-Json -InputObject @($communitySongs) -Depth 20 -Compress } else { '[]' }
  $catalogVersion = [DateTime]::UtcNow.Ticks.ToString()
  $javascript = "window.ETHEREAL_DEMO_CATALOG_VERSION = '$catalogVersion';`r`nwindow.ETHEREAL_DEMO_SONGS = $demoJson;`r`nwindow.ETHEREAL_COMMUNITY_SONGS = $communityJson;"
  [System.IO.File]::WriteAllText($catalogPath, $javascript, [System.Text.UTF8Encoding]::new($false))
  Write-Host "Song catalogues updated: $($demoSongs.Count) demo and $($communitySongs.Count) community song(s)." -ForegroundColor Green
}

Write-SongCatalogs
Write-Host ''
Write-Host 'Watching the demo-songs and community-songs folders.' -ForegroundColor Cyan
Write-Host 'Keep this window open while using the trainer. Press Ctrl+C to stop.'
Write-Host ''
Start-Process (Join-Path $projectRoot 'index.html')

$watchers = @()
$registrations = @()
foreach ($directory in @($demoDirectory, $communityDirectory)) {
  $watcher = [System.IO.FileSystemWatcher]::new($directory, '*.drumsong')
  $watcher.IncludeSubdirectories = $false
  $watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, LastWrite, CreationTime'
  $watcher.EnableRaisingEvents = $true
  $watchers += $watcher
  $registrations += Register-ObjectEvent -InputObject $watcher -EventName Created
  $registrations += Register-ObjectEvent -InputObject $watcher -EventName Changed
  $registrations += Register-ObjectEvent -InputObject $watcher -EventName Deleted
  $registrations += Register-ObjectEvent -InputObject $watcher -EventName Renamed
}

try {
  while ($true) {
    $event = Wait-Event -Timeout 1
    if ($null -ne $event) {
      Get-Event | Remove-Event
      Start-Sleep -Milliseconds 250
      Write-SongCatalogs
    }
  }
}
finally {
  $registrations | ForEach-Object { Unregister-Event -SubscriptionId $_.SubscriptionId -ErrorAction SilentlyContinue }
  $watchers | ForEach-Object { $_.Dispose() }
}
