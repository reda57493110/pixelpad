# Run this script as Administrator to allow port 3000 through Windows Firewall
# Right-click PowerShell and select "Run as Administrator", then run: .\fix-firewall.ps1

netsh advfirewall firewall add rule name="Next.js Dev Server" dir=in action=allow protocol=TCP localport=3000

Write-Host "Firewall rule added successfully!" -ForegroundColor Green
Write-Host "You can now access your app from your phone at: http://192.168.1.19:3000" -ForegroundColor Cyan
























