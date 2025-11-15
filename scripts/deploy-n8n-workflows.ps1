# N8N Workflow Deployment Script for Windows
# Automates the deployment of AI automation workflows to n8n

param(
    [string]$N8nUrl = $env:VITE_N8N_INSTANCE_URL ?? "http://localhost:5678",
    [string]$ApiKey = $env:VITE_N8N_API_KEY,
    [string]$WorkflowDir = "./workflows"
)

# Colors for output
$colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
}

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $colors.Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $colors.Red
}

function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    # Check if n8n is accessible
    try {
        $response = Invoke-WebRequest -Uri "$N8nUrl/rest/active" -Method GET -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -ne 200) {
            throw "N8n not accessible"
        }
    }
    catch {
        Write-Error "Cannot access n8n at $N8nUrl"
        Write-Error "Please ensure n8n is running and accessible"
        exit 1
    }
    
    # Check API key
    if (-not $ApiKey) {
        Write-Warning "N8N_API_KEY not set. Some operations may fail."
    }
    
    # Check workflow directory
    if (-not (Test-Path $WorkflowDir)) {
        Write-Error "Workflow directory not found: $WorkflowDir"
        exit 1
    }
    
    Write-Success "Prerequisites check passed"
}

function Import-Workflow {
    param(
        [string]$WorkflowFile
    )
    
    $workflowName = [System.IO.Path]::GetFileNameWithoutExtension($WorkflowFile)
    Write-Status "Importing workflow: $workflowName"
    
    if (-not (Test-Path $WorkflowFile)) {
        Write-Error "Workflow file not found: $WorkflowFile"
        return $false
    }
    
    # Read workflow content
    $workflowContent = Get-Content $WorkflowFile -Raw
    
    # Import via API (if API key available)
    if ($ApiKey) {
        try {
            $headers = @{
                "X-N8N-API-KEY" = $ApiKey
                "Content-Type" = "application/json"
            }
            
            $response = Invoke-RestMethod -Uri "$N8nUrl/rest/workflows/import" -Method POST -Headers $headers -Body $workflowContent
            
            if ($response.id) {
                Write-Success "Workflow $workflowName imported successfully"
                return $true
            } else {
                Write-Error "Failed to import $workflowName"
                return $false
            }
        }
        catch {
            Write-Error "Failed to import $workflowName`: $($_.Exception.Message)"
            return $false
        }
    } else {
        Write-Warning "No API key - please import $WorkflowFile manually via n8n UI"
        return $true
    }
}

function Enable-Workflow {
    param(
        [string]$WorkflowName
    )
    
    if (-not $ApiKey) {
        Write-Warning "Cannot activate $WorkflowName - no API key"
        return $true
    }
    
    Write-Status "Activating workflow: $WorkflowName"
    
    try {
        # Get workflow ID first
        $headers = @{ "X-N8N-API-KEY" = $ApiKey }
        $workflows = Invoke-RestMethod -Uri "$N8nUrl/rest/workflows" -Method GET -Headers $headers
        
        $workflow = $workflows | Where-Object { $_.name -like "*$WorkflowName*" } | Select-Object -First 1
        
        if (-not $workflow) {
            Write-Error "Workflow not found: $WorkflowName"
            return $false
        }
        
        $workflowId = $workflow.id
        
        # Activate workflow
        $response = Invoke-RestMethod -Uri "$N8nUrl/rest/workflows/$workflowId/activate" -Method POST -Headers $headers
        
        if ($response.active) {
            Write-Success "Workflow $WorkflowName activated"
            return $true
        } else {
            Write-Error "Failed to activate $WorkflowName"
            return $false
        }
    }
    catch {
        Write-Error "Failed to activate $WorkflowName`: $($_.Exception.Message)"
        return $false
    }
}

function Test-Webhook {
    param(
        [string]$WebhookPath,
        [string]$TestPayload
    )
    
    Write-Status "Testing webhook: $WebhookPath"
    
    $webhookUrl = "$N8nUrl/webhook/$WebhookPath"
    
    try {
        $headers = @{ "Content-Type" = "application/json" }
        $response = Invoke-WebRequest -Uri $webhookUrl -Method POST -Headers $headers -Body $TestPayload -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Write-Success "Webhook $WebhookPath is working"
        } else {
            Write-Warning "Webhook $WebhookPath returned HTTP $($response.StatusCode)"
        }
    }
    catch {
        Write-Warning "Webhook $WebhookPath test failed: $($_.Exception.Message)"
    }
}

function Main {
    Write-Host "========================================" -ForegroundColor $colors.Cyan
    Write-Host "🤖 N8N AI Automation Workflow Deployment" -ForegroundColor $colors.Cyan
    Write-Host "========================================" -ForegroundColor $colors.Cyan
    Write-Host ""
    
    Test-Prerequisites
    Write-Host ""
    
    # Workflows to deploy (in order)
    $workflows = @(
        "master-orchestrator",
        "smart-workflow-router",
        "content-production-factory"
    )
    
    # Import workflows
    Write-Status "Importing workflows..."
    foreach ($workflow in $workflows) {
        $workflowFile = Join-Path $WorkflowDir "$workflow.json"
        Import-Workflow -WorkflowFile $workflowFile
        Start-Sleep -Seconds 2
    }
    Write-Host ""
    
    # Activate workflows
    Write-Status "Activating workflows..."
    foreach ($workflow in $workflows) {
        Enable-Workflow -WorkflowName $workflow
        Start-Sleep -Seconds 2
    }
    Write-Host ""
    
    # Test webhooks
    Write-Status "Testing webhook endpoints..."
    
    $testPayload = @{
        action = "test_connection"
        user_id = "deployment-test"
    } | ConvertTo-Json
    
    Test-Webhook -WebhookPath "master-orchestrator" -TestPayload $testPayload
    Test-Webhook -WebhookPath "smart-workflow-router" -TestPayload $testPayload
    Test-Webhook -WebhookPath "content-production-factory" -TestPayload $testPayload
    
    Write-Host ""
    Write-Success "Deployment completed!"
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor $colors.Cyan
    Write-Host "1. Verify workflows in n8n UI: $N8nUrl"
    Write-Host "2. Check webhook endpoints are active"
    Write-Host "3. Test the Master Play Button in your React app"
    Write-Host "4. Configure OpenAI API credentials in n8n"
    Write-Host "5. Set up Supabase database connection"
    Write-Host ""
    Write-Host "🔗 Webhook URLs:" -ForegroundColor $colors.Cyan
    Write-Host "- Master Orchestrator: $N8nUrl/webhook/master-orchestrator"
    Write-Host "- Smart Router: $N8nUrl/webhook/smart-workflow-router"
    Write-Host "- Content Factory: $N8nUrl/webhook/content-production-factory"
    Write-Host ""
}

# Run main function
Main