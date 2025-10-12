# PowerShell script to apply S3 CORS configuration
# Run this script to configure CORS for document uploads

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  S3 CORS Configuration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$bucketName = "lexohub-documents"
$region = "us-east-1"
$corsConfigFile = "s3-cors-config.json"

# Check if AWS CLI is installed
Write-Host "Checking AWS CLI installation..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "✓ AWS CLI found: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install AWS CLI:" -ForegroundColor Yellow
    Write-Host "  https://aws.amazon.com/cli/" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host ""

# Check if CORS config file exists
if (-not (Test-Path $corsConfigFile)) {
    Write-Host "✗ CORS configuration file not found: $corsConfigFile" -ForegroundColor Red
    exit 1
}

Write-Host "✓ CORS configuration file found" -ForegroundColor Green
Write-Host ""

# Display current CORS configuration
Write-Host "Fetching current CORS configuration..." -ForegroundColor Yellow
try {
    $currentCors = aws s3api get-bucket-cors --bucket $bucketName --region $region 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Current CORS configuration:" -ForegroundColor Cyan
        Write-Host $currentCors
    } else {
        Write-Host "No CORS configuration currently set" -ForegroundColor Yellow
    }
} catch {
    Write-Host "No CORS configuration currently set" -ForegroundColor Yellow
}

Write-Host ""

# Ask for confirmation
Write-Host "This will update CORS configuration for bucket: $bucketName" -ForegroundColor Yellow
Write-Host "Region: $region" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Do you want to continue? (Y/N)"

if ($confirmation -ne 'Y' -and $confirmation -ne 'y') {
    Write-Host "Operation cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Applying CORS configuration..." -ForegroundColor Yellow

# Apply CORS configuration
try {
    aws s3api put-bucket-cors `
        --bucket $bucketName `
        --cors-configuration file://$corsConfigFile `
        --region $region

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✓ CORS Configuration Applied!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Restart your development server" -ForegroundColor White
        Write-Host "2. Test document upload in the application" -ForegroundColor White
        Write-Host "3. Check browser console for any errors" -ForegroundColor White
        Write-Host ""
        
        # Verify the configuration
        Write-Host "Verifying configuration..." -ForegroundColor Yellow
        $newCors = aws s3api get-bucket-cors --bucket $bucketName --region $region
        Write-Host ""
        Write-Host "New CORS configuration:" -ForegroundColor Cyan
        Write-Host $newCors
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "✗ Failed to apply CORS configuration" -ForegroundColor Red
        Write-Host "Please check your AWS credentials and permissions" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "✗ Error applying CORS configuration: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Done!" -ForegroundColor Green
