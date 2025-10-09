param(
    [string]$BucketName = "lexohub-documents",
    [string]$Region = "us-east-1"
)

Write-Host "Fixing AWS S3 and Bedrock Configuration..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Configuring S3 CORS..." -ForegroundColor Yellow

$corsConfig = @"
{
    "CORSRules": [
        {
            "AllowedOrigins": ["http://localhost:5180", "http://localhost:5173", "http://localhost:3000"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedHeaders": ["*"],
            "ExposeHeaders": ["ETag", "x-amz-server-side-encryption", "x-amz-request-id"],
            "MaxAgeSeconds": 3000
        }
    ]
}
"@

$corsFile = "s3-cors-config.json"
$corsConfig | Out-File -FilePath $corsFile -Encoding utf8

try {
    aws s3api put-bucket-cors --bucket $BucketName --cors-configuration file://$corsFile --region $Region
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ S3 CORS configured successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to configure CORS" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error configuring CORS: $_" -ForegroundColor Red
}

Remove-Item $corsFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Step 2: Listing available Bedrock models..." -ForegroundColor Yellow

try {
    $models = aws bedrock list-foundation-models --region $Region --output json | ConvertFrom-Json
    $claudeModels = $models.modelSummaries | Where-Object { $_.modelId -like "*claude*" }
    
    Write-Host "Available Claude models:" -ForegroundColor White
    foreach ($model in $claudeModels) {
        Write-Host "  - $($model.modelId)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Checking for inference profiles..." -ForegroundColor Yellow
    
    $profiles = aws bedrock list-inference-profiles --region $Region --output json 2>&1
    if ($LASTEXITCODE -eq 0) {
        $profileData = $profiles | ConvertFrom-Json
        $claudeProfiles = $profileData.inferenceProfileSummaries | Where-Object { $_.modelIds -like "*claude*" }
        
        if ($claudeProfiles) {
            Write-Host "✓ Available Claude inference profiles:" -ForegroundColor Green
            foreach ($profile in $claudeProfiles) {
                Write-Host "  - $($profile.inferenceProfileArn)" -ForegroundColor Gray
                Write-Host "    Models: $($profile.modelIds -join ', ')" -ForegroundColor DarkGray
            }
        } else {
            Write-Host "⚠ No Claude inference profiles found" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠ Cannot list inference profiles (may need additional permissions)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Error checking Bedrock models: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 3: Recommended Model Configuration" -ForegroundColor Yellow
Write-Host "Update your .env file with one of these model IDs:" -ForegroundColor White
Write-Host ""
Write-Host "Option 1 (Recommended - Cross-region inference profile):" -ForegroundColor Cyan
Write-Host "VITE_AWS_BEDROCK_MODEL_ID=us.anthropic.claude-3-5-sonnet-20241022-v2:0" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2 (Region-specific):" -ForegroundColor Cyan
Write-Host "VITE_AWS_BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0" -ForegroundColor Gray
Write-Host "Note: You may need to request model access in Bedrock console" -ForegroundColor DarkGray
Write-Host ""
Write-Host "✓ Configuration complete!" -ForegroundColor Green
Write-Host "Restart your dev server after updating .env" -ForegroundColor Yellow
