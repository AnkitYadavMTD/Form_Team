# Test Campaign Creation Script

$baseUrl = "http://localhost:3001"
$email = "testadmin$(Get-Random)@example.com"
$password = "TestPassword123!"

# 1. Register a test admin
Write-Host "1. Registering test admin: $email" -ForegroundColor Cyan
$registerBody = @{
    name = "testadmin"
    fullName = "Test Admin"
    mobileNumber = "1234567890"
    email = $email
    password = $password
    city = "New York"
    plan = "pro"
    termsAgreed = $true
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $registerBody `
        -UseBasicParsing
    
    Write-Host "✅ Admin registered successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Admin registration: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 2. Directly bypass - Create a token manually for testing
# In a real scenario, you'd get this from login after approval
Write-Host "`n2. Generating test token..." -ForegroundColor Cyan

# For testing purposes, we'll use a hardcoded admin ID
# You can replace this with actual admin ID from your database
$testAdminId = 1  # Use first admin, or update this
$testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoxLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJhZG1pblJvbGUiOiJhZG1pbiJ9.PLACEHOLDER"

# Let's try to login with a known admin first
Write-Host "`n2. Attempting login..." -ForegroundColor Cyan
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $loginBody `
        -UseBasicParsing -ErrorAction Stop
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.token
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
} catch {
    Write-Host "ℹ️ Login failed - account may be pending. Testing with mock token..." -ForegroundColor Yellow
    # Use a test token - replace with actual token from your database if needed
    $token = "test-token"
}

# 4. Create a test campaign
Write-Host "`n3. Creating test campaign..." -ForegroundColor Cyan
$campaignBody = @{
    name = "Black Friday 2024"
    advertiser = "TechStore Inc"
    category = "Technology"
    status = "active"
    payout_type = "CPA"
    payout_amount = 75.50
    currency = "USD"
    conversion_event = "Purchase"
    sale_percentage = 10
    offer_url = "https://techstore.com/offers/black-friday"
    postback_url = "https://api.example.com/postback"
    tracking_parameters = @{
        utm_source = "affiliate"
        utm_medium = "cpa"
        utm_campaign = "black_friday_2024"
    }
} | ConvertTo-Json

try {
    $campaignResponse = Invoke-WebRequest -Uri "$baseUrl/api/campaigns" `
        -Method POST `
        -Headers @{
            "Content-Type"="application/json"
            "Authorization"="Bearer $token"
        } `
        -Body $campaignBody `
        -ErrorAction Stop
    
    $campaignData = $campaignResponse.Content | ConvertFrom-Json
    Write-Host "✅ Campaign created successfully!" -ForegroundColor Green
    Write-Host "`nCampaign Details:" -ForegroundColor Cyan
    Write-Host ($campaignData | ConvertTo-Json -Depth 10)
} catch {
    $errorResponse = $_.Exception.Response.Content | ConvertFrom-Json
    Write-Host "❌ Campaign creation failed: $($errorResponse.error)" -ForegroundColor Red
    if ($errorResponse.details) {
        Write-Host "Details: $($errorResponse.details)" -ForegroundColor Red
    }
}

# 5. Get all campaigns
Write-Host "`n4. Fetching all campaigns..." -ForegroundColor Cyan
try {
    $campaignsResponse = Invoke-WebRequest -Uri "$baseUrl/api/campaigns" `
        -Method GET `
        -Headers @{
            "Content-Type"="application/json"
            "Authorization"="Bearer $token"
        } `
        -ErrorAction Stop
    
    $campaignsData = $campaignsResponse.Content | ConvertFrom-Json
    Write-Host "✅ Fetched campaigns successfully!" -ForegroundColor Green
    Write-Host "Total campaigns: $($campaignsData.count)" -ForegroundColor Cyan
    Write-Host ($campaignsData.data | ConvertTo-Json -Depth 10)
} catch {
    $errorResponse = $_.Exception.Response.Content | ConvertFrom-Json
    Write-Host "❌ Failed to fetch campaigns: $($errorResponse.error)" -ForegroundColor Red
}
