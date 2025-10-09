param(
    [string]$AccessKeyId,
    [string]$SecretAccessKey,
    [string]$BucketName = "lexohub-documents",
    [string]$Region = "us-east-1"
)

Write-Host "Verifying AWS S3 Bucket Configuration..." -ForegroundColor Cyan
Write-Host ""

if (-not $AccessKeyId -or -not $SecretAccessKey) {
    Write-Host "Usage: .\verify-aws-bucket.ps1 -AccessKeyId YOUR_KEY -SecretAccessKey YOUR_SECRET" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This script will:" -ForegroundColor White
    Write-Host "  1. Check if the S3 bucket exists" -ForegroundColor Gray
    Write-Host "  2. Verify your credentials work" -ForegroundColor Gray
    Write-Host "  3. Test Bedrock model access" -ForegroundColor Gray
    exit
}

$env:AWS_ACCESS_KEY_ID = $AccessKeyId
$env:AWS_SECRET_ACCESS_KEY = $SecretAccessKey
$env:AWS_DEFAULT_REGION = $Region

Write-Host "Testing AWS Credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Credentials are valid" -ForegroundColor Green
        $identity | ConvertFrom-Json | Format-List
    } else {
        Write-Host "✗ Invalid credentials" -ForegroundColor Red
        Write-Host $identity -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ AWS CLI not installed or credentials invalid" -ForegroundColor Red
    Write-Host "Install AWS CLI: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Checking S3 Bucket: $BucketName" -ForegroundColor Yellow
try {
    $bucket = aws s3api head-bucket --bucket $BucketName 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Bucket exists and is accessible" -ForegroundColor Green
    } else {
        Write-Host "✗ Bucket does not exist or is not accessible" -ForegroundColor Red
        Write-Host ""
        Write-Host "Creating bucket..." -ForegroundColor Yellow
        aws s3api create-bucket --bucket $BucketName --region $Region
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Bucket created successfully" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to create bucket" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "✗ Error checking bucket" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing Bedrock Access..." -ForegroundColor Yellow
try {
    $models = aws bedrock list-foundation-models --region $Region 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Bedrock access confirmed" -ForegroundColor Green
        $modelList = $models | ConvertFrom-Json
        $claude = $modelList.modelSummaries | Where-Object { $_.modelId -like "*claude-3-5-sonnet*" }
        if ($claude) {
            Write-Host "✓ Claude 3.5 Sonnet model available" -ForegroundColor Green
        } else {
            Write-Host "⚠ Claude 3.5 Sonnet not found in available models" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ Cannot access Bedrock" -ForegroundColor Red
        Write-Host $models -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error checking Bedrock access" -ForegroundColor Red
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "If all checks passed, add these to your .env file:" -ForegroundColor White
Write-Host "VITE_AWS_ACCESS_KEY_ID=$AccessKeyId" -ForegroundColor Gray
Write-Host "VITE_AWS_SECRET_ACCESS_KEY=$SecretAccessKey" -ForegroundColor Gray
