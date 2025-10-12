# PowerShell script to verify AWS configuration for document upload
# Run this to check if everything is configured correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AWS Configuration Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$bucketName = "lexohub-documents"
$region = "us-east-1"
$bedrockRegion = "us-east-1"
$allChecks = @()

# Function to add check result
function Add-CheckResult {
    param($name, $status, $message)
    $script:allChecks += [PSCustomObject]@{
        Name = $name
        Status = $status
        Message = $message
    }
}

# Check 1: AWS CLI
Write-Host "1. Checking AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "   ✓ AWS CLI installed: $awsVersion" -ForegroundColor Green
    Add-CheckResult "AWS CLI" "✓" "Installed"
} catch {
    Write-Host "   ✗ AWS CLI not found" -ForegroundColor Red
    Add-CheckResult "AWS CLI" "✗" "Not installed"
}

Write-Host ""

# Check 2: AWS Credentials
Write-Host "2. Checking AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
    Write-Host "   ✓ Credentials configured" -ForegroundColor Green
    Write-Host "   Account: $($identity.Account)" -ForegroundColor Cyan
    Write-Host "   User: $($identity.Arn)" -ForegroundColor Cyan
    Add-CheckResult "AWS Credentials" "✓" "Configured"
} catch {
    Write-Host "   ✗ Credentials not configured or invalid" -ForegroundColor Red
    Add-CheckResult "AWS Credentials" "✗" "Not configured"
}

Write-Host ""

# Check 3: S3 Bucket Access
Write-Host "3. Checking S3 bucket access..." -ForegroundColor Yellow
try {
    aws s3 ls s3://$bucketName/ --region $region 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Can access bucket: $bucketName" -ForegroundColor Green
        Add-CheckResult "S3 Bucket Access" "✓" "Accessible"
    } else {
        Write-Host "   ✗ Cannot access bucket: $bucketName" -ForegroundColor Red
        Add-CheckResult "S3 Bucket Access" "✗" "Not accessible"
    }
} catch {
    Write-Host "   ✗ Error accessing bucket" -ForegroundColor Red
    Add-CheckResult "S3 Bucket Access" "✗" "Error"
}

Write-Host ""

# Check 4: S3 CORS Configuration
Write-Host "4. Checking S3 CORS configuration..." -ForegroundColor Yellow
try {
    $cors = aws s3api get-bucket-cors --bucket $bucketName --region $region 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ CORS configured" -ForegroundColor Green
        $corsObj = $cors | ConvertFrom-Json
        $allowedOrigins = $corsObj.CORSRules[0].AllowedOrigins
        Write-Host "   Allowed origins: $($allowedOrigins -join ', ')" -ForegroundColor Cyan
        
        # Check if localhost is allowed
        if ($allowedOrigins -match "localhost") {
            Write-Host "   ✓ Localhost allowed" -ForegroundColor Green
            Add-CheckResult "S3 CORS" "✓" "Configured with localhost"
        } else {
            Write-Host "   ⚠ Localhost not in allowed origins" -ForegroundColor Yellow
            Add-CheckResult "S3 CORS" "⚠" "Configured but missing localhost"
        }
    } else {
        Write-Host "   ✗ CORS not configured" -ForegroundColor Red
        Add-CheckResult "S3 CORS" "✗" "Not configured"
    }
} catch {
    Write-Host "   ✗ CORS not configured" -ForegroundColor Red
    Add-CheckResult "S3 CORS" "✗" "Not configured"
}

Write-Host ""

# Check 5: Bedrock Access
Write-Host "5. Checking Bedrock access..." -ForegroundColor Yellow
try {
    $models = aws bedrock list-foundation-models --region $bedrockRegion 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Can access Bedrock" -ForegroundColor Green
        
        # Check for Claude model
        if ($models -match "claude-3-5-sonnet") {
            Write-Host "   ✓ Claude 3.5 Sonnet available" -ForegroundColor Green
            Add-CheckResult "Bedrock Access" "✓" "Claude 3.5 Sonnet available"
        } else {
            Write-Host "   ⚠ Claude 3.5 Sonnet not found" -ForegroundColor Yellow
            Add-CheckResult "Bedrock Access" "⚠" "Accessible but Claude not found"
        }
    } else {
        Write-Host "   ✗ Cannot access Bedrock" -ForegroundColor Red
        Add-CheckResult "Bedrock Access" "✗" "Not accessible"
    }
} catch {
    Write-Host "   ✗ Error accessing Bedrock" -ForegroundColor Red
    Add-CheckResult "Bedrock Access" "✗" "Error"
}

Write-Host ""

# Check 6: Environment Variables
Write-Host "6. Checking environment variables..." -ForegroundColor Yellow
$envFile = ".env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    
    $requiredVars = @(
        "VITE_AWS_S3_BUCKET",
        "VITE_AWS_REGION",
        "VITE_AWS_ACCESS_KEY_ID",
        "VITE_AWS_SECRET_ACCESS_KEY",
        "VITE_AWS_BEDROCK_REGION",
        "VITE_AWS_BEDROCK_MODEL_ID"
    )
    
    $missingVars = @()
    foreach ($var in $requiredVars) {
        if ($envContent -match "$var=.+") {
            Write-Host "   ✓ $var configured" -ForegroundColor Green
        } else {
            Write-Host "   ✗ $var missing" -ForegroundColor Red
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -eq 0) {
        Add-CheckResult "Environment Variables" "✓" "All configured"
    } else {
        Add-CheckResult "Environment Variables" "✗" "Missing: $($missingVars -join ', ')"
    }
} else {
    Write-Host "   ✗ .env file not found" -ForegroundColor Red
    Add-CheckResult "Environment Variables" "✗" ".env file not found"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allChecks | Format-Table -AutoSize

Write-Host ""

# Overall status
$failedChecks = $allChecks | Where-Object { $_.Status -eq "✗" }
$warningChecks = $allChecks | Where-Object { $_.Status -eq "⚠" }

if ($failedChecks.Count -eq 0 -and $warningChecks.Count -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ All checks passed!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your AWS configuration is ready for document upload!" -ForegroundColor Green
    Write-Host ""
} elseif ($failedChecks.Count -eq 0) {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  ⚠ Configuration has warnings" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please review the warnings above" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ Configuration incomplete" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the failed checks above" -ForegroundColor Red
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Review AWS_DOCUMENT_UPLOAD_SETUP.md" -ForegroundColor White
    Write-Host "2. Fix failed checks" -ForegroundColor White
    Write-Host "3. Run this script again to verify" -ForegroundColor White
    Write-Host ""
}
