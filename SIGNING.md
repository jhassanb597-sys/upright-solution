# Release signing

The generated upload keystore is stored outside the project at
`%USERPROFILE%\.android\upright-upload.p12`. Its password is stored separately in a
Windows DPAPI-protected file at
`%USERPROFILE%\.android\upright-upload-password.dpapi`. Only the Windows account that
created the password file can decrypt it. Back up the keystore securely and save its
password in a password manager before moving to another machine or Windows account.
Never commit the keystore or password file.

Install the locked JavaScript dependencies and build a signed release APK from
PowerShell under the same Windows account. With the release signing environment
variables set below, Gradle signs the release with the upload keystore. Without
them, a release build uses the debug key and is only suitable for local testing.
The React Native Gradle plugin bundles JavaScript and Metro image assets as part
of the release build.

```powershell
$node = "$env:LOCALAPPDATA\Programs\nodejs\v22.23.3"
$env:PATH = "$node;$node\node_modules\npm\bin;$env:PATH"
npm ci

$secure = Get-Content "$HOME\.android\upright-upload-password.dpapi" -Raw | ConvertTo-SecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    $env:RELEASE_STORE_FILE = "$HOME\.android\upright-upload.p12"
    $env:RELEASE_STORE_PASSWORD = $password
    $env:RELEASE_KEY_ALIAS = "upright-upload"
    $env:RELEASE_KEY_PASSWORD = $password
    .\android\gradlew.bat -p android clean :app:assembleRelease
}
finally {
    if ($pointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
    Remove-Item Env:RELEASE_STORE_FILE, Env:RELEASE_STORE_PASSWORD, Env:RELEASE_KEY_ALIAS, Env:RELEASE_KEY_PASSWORD -ErrorAction SilentlyContinue
    Remove-Variable password, secure, pointer -ErrorAction SilentlyContinue
}
```

The signed APK is written to `app\build\outputs\apk\release\app-release.apk`.
To create a Play Store bundle instead, run `.\gradlew.bat :app:bundleRelease`.
For Google Play App Signing, register this certificate as the upload key and keep a
secure backup of the keystore and its password.
