param([string]$Dir="$PSScriptRoot",[string]$Pattern='^(n[123])-(desktop|mobile)-(dark|light)\.png$',[string]$OutFile='pixels.json')
Add-Type -AssemblyName System.Drawing
$files = Get-ChildItem (Join-Path $Dir '*.png') | Where-Object { $_.Name -match $Pattern } | Sort-Object Name
$targets = @(
  @{name='cyan'; r=0;   g=212; b=255; tol=70},
  @{name='pink'; r=255; g=45;  b=155; tol=70},
  @{name='gold'; r=255; g=193; b=7;   tol=75},
  @{name='iris'; r=139; g=125; b=255; tol=70}
)
$results = @()
foreach ($f in $files) {
  $bmp = [System.Drawing.Bitmap]::FromFile($f.FullName)
  $w = $bmp.Width; $h = $bmp.Height
  $stride = if ($w -gt 800) { 5 } else { 3 }
  $sumR=0;$sumG=0;$sumB=0;$n=0;$nearBlack=0;$nearWhite=0;$dark=0;$light=0
  $counts = @{}
  foreach ($t in $targets) { $counts[$t.name]=0 }
  for ($y=0; $y -lt $h; $y += $stride) {
    for ($x=0; $x -lt $w; $x += $stride) {
      $p = $bmp.GetPixel($x,$y)
      $sumR += $p.R; $sumG += $p.G; $sumB += $p.B; $n++
      $lum = (0.2126*$p.R + 0.7152*$p.G + 0.0722*$p.B)
      if ($p.R -lt 18 -and $p.G -lt 18 -and $p.B -lt 18) { $nearBlack++ }
      if ($p.R -gt 240 -and $p.G -gt 240 -and $p.B -gt 240) { $nearWhite++ }
      if ($lum -lt 60) { $dark++ } elseif ($lum -gt 200) { $light++ }
      foreach ($t in $targets) {
        if ([math]::Abs($p.R-$t.r) -le $t.tol -and [math]::Abs($p.G-$t.g) -le $t.tol -and [math]::Abs($p.B-$t.b) -le $t.tol) { $counts[$t.name]++ }
      }
      $qr=[int]([math]::Floor($p.R/32)*32); $qg=[int]([math]::Floor($p.G/32)*32); $qb=[int]([math]::Floor($p.B/32)*32)
      $key = ('{0:X2}{1:X2}{2:X2}' -f $qr,$qg,$qb)
      if ($counts.ContainsKey("q$key")) { $counts["q$key"]++ } else { $counts["q$key"]=1 }
    }
  }
  $bmp.Dispose()
  $top = $counts.GetEnumerator() | Where-Object { $_.Key -like 'q*' } | Sort-Object Value -Descending | Select-Object -First 5 | ForEach-Object { @{color=$_.Key.Substring(1); count=$_.Value} }
  $obj = [ordered]@{
    file=$f.Name; width=$w; height=$h; samples=$n
    meanR=[math]::Round($sumR/$n,1); meanG=[math]::Round($sumG/$n,1); meanB=[math]::Round($sumB/$n,1)
    nearBlackPct=[math]::Round(100*$nearBlack/$n,2); nearWhitePct=[math]::Round(100*$nearWhite/$n,2)
    darkPct=[math]::Round(100*$dark/$n,2); lightPct=[math]::Round(100*$light/$n,2)
    neonSamples=[ordered]@{ cyan=$counts['cyan']; pink=$counts['pink']; gold=$counts['gold']; iris=$counts['iris'] }
    neonPct=[ordered]@{ cyan=[math]::Round(100*$counts['cyan']/$n,2); pink=[math]::Round(100*$counts['pink']/$n,2); gold=[math]::Round(100*$counts['gold']/$n,2); iris=[math]::Round(100*$counts['iris']/$n,2) }
    topQuantized=$top
  }
  $results += $obj
}
$outPath = Join-Path $Dir $OutFile
$results | ConvertTo-Json -Depth 6 | Set-Content -Path $outPath -Encoding UTF8
$results | ForEach-Object { "{0}: neon% c={1} p={2} g={3} i={4}; mean={5},{6},{7}; dark={8}% light={9}%" -f $_.file,$_.neonPct.cyan,$_.neonPct.pink,$_.neonPct.gold,$_.neonPct.iris,$_.meanR,$_.meanG,$_.meanB,$_.darkPct,$_.lightPct }
