$ErrorActionPreference = "Stop"
$env:JAVA_HOME = "C:\Users\A B C\.jdks\jbr-21.0.11"
$env:ANDROID_HOME = "C:\Users\A B C\AppData\Local\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
$root = "C:\Users\A B C\Downloads\upright-solution"

Write-Host "==> STEP 1: TypeScript check"
Set-Location $root
$tsc = & npx tsc --noEmit 2>&1
if ($LASTEXITCODE -ne 0) { Write-Host "TS errors: $tsc"; exit 1 }
Write-Host "    TypeScript: PASS"

Write-Host "==> STEP 2: Patching ninja files (MAX_PATH workaround)"
& node "$root\node_modules\react-native-worklets\android\fix-ninja.js"

Write-Host "==> STEP 3: assembleDebug"
Set-Location "$root\android"
.\gradlew.bat assembleDebug

if ($LASTEXITCODE -eq 0) {
    $apk = "$root\android\app\build\outputs\apk\debug\app-debug.apk"
    Write-Host ""
    Write-Host "BUILD SUCCESS!"
    Write-Host "APK: $apk"
    (Get-Item $apk).Length | ForEach-Object { Write-Host "Size: $([math]::Round($_ / 1MB, 1)) MB" }
} else {
    # Try to patch ninja and retry once
    Write-Host "==> Retry: re-patching ninja and retrying assembleDebug"
    Set-Location $root
    & node "$root\node_modules\react-native-worklets\android\fix-ninja.js"
    Set-Location "$root\android"
    .\gradlew.bat assembleDebug
    if ($LASTEXITCODE -eq 0) {
        $apk = "$root\android\app\build\outputs\apk\debug\app-debug.apk"
        Write-Host "BUILD SUCCESS (retry)!"
        Write-Host "APK: $apk"
    }
}
