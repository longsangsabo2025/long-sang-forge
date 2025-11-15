#!/bin/bash

# N8N Workflow Deployment Script
# Automates the deployment of AI automation workflows to n8n

set -e

echo "🚀 Starting N8N Workflow Deployment..."

# Configuration
N8N_URL="${VITE_N8N_INSTANCE_URL:-http://localhost:5678}"
N8N_API_KEY="${VITE_N8N_API_KEY}"
WORKFLOW_DIR="./workflows"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if n8n is accessible
    if ! curl -s "${N8N_URL}/rest/active" >/dev/null 2>&1; then
        print_error "Cannot access n8n at ${N8N_URL}"
        print_error "Please ensure n8n is running and accessible"
        exit 1
    fi
    
    # Check API key
    if [ -z "$N8N_API_KEY" ]; then
        print_warning "N8N_API_KEY not set. Some operations may fail."
    fi
    
    # Check workflow files exist
    if [ ! -d "$WORKFLOW_DIR" ]; then
        print_error "Workflow directory not found: $WORKFLOW_DIR"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Import workflow
import_workflow() {
    local workflow_file=$1
    local workflow_name=$(basename "$workflow_file" .json)
    
    print_status "Importing workflow: $workflow_name"
    
    if [ ! -f "$workflow_file" ]; then
        print_error "Workflow file not found: $workflow_file"
        return 1
    fi
    
    # Read workflow content
    local workflow_content=$(cat "$workflow_file")
    
    # Import via API (if API key available)
    if [ -n "$N8N_API_KEY" ]; then
        local response=$(curl -s -X POST "${N8N_URL}/rest/workflows/import" \
            -H "X-N8N-API-KEY: $N8N_API_KEY" \
            -H "Content-Type: application/json" \
            -d "$workflow_content")
        
        if echo "$response" | grep -q '"id"'; then
            print_success "Workflow $workflow_name imported successfully"
            return 0
        else
            print_error "Failed to import $workflow_name: $response"
            return 1
        fi
    else
        print_warning "No API key - please import $workflow_file manually via n8n UI"
        return 0
    fi
}

# Activate workflow
activate_workflow() {
    local workflow_name=$1
    
    if [ -z "$N8N_API_KEY" ]; then
        print_warning "Cannot activate $workflow_name - no API key"
        return 0
    fi
    
    print_status "Activating workflow: $workflow_name"
    
    # Get workflow ID first
    local workflows=$(curl -s -X GET "${N8N_URL}/rest/workflows" \
        -H "X-N8N-API-KEY: $N8N_API_KEY")
    
    local workflow_id=$(echo "$workflows" | grep -o '"id":"[^"]*"' | grep -A5 -B5 "$workflow_name" | grep '"id"' | cut -d'"' -f4 | head -1)
    
    if [ -z "$workflow_id" ]; then
        print_error "Workflow ID not found for: $workflow_name"
        return 1
    fi
    
    # Activate workflow
    local response=$(curl -s -X POST "${N8N_URL}/rest/workflows/${workflow_id}/activate" \
        -H "X-N8N-API-KEY: $N8N_API_KEY")
    
    if echo "$response" | grep -q '"active":true'; then
        print_success "Workflow $workflow_name activated"
    else
        print_error "Failed to activate $workflow_name: $response"
    fi
}

# Test webhook
test_webhook() {
    local webhook_path=$1
    local test_payload=$2
    
    print_status "Testing webhook: $webhook_path"
    
    local webhook_url="${N8N_URL}/webhook/${webhook_path}"
    local response=$(curl -s -w "%{http_code}" -X POST "$webhook_url" \
        -H "Content-Type: application/json" \
        -d "$test_payload")
    
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        print_success "Webhook $webhook_path is working"
    else
        print_warning "Webhook $webhook_path returned HTTP $http_code"
    fi
}

# Main deployment process
main() {
    echo "========================================"
    echo "🤖 N8N AI Automation Workflow Deployment"
    echo "========================================"
    echo
    
    check_prerequisites
    echo
    
    # Workflows to deploy (in order)
    local workflows=(
        "master-orchestrator"
        "smart-workflow-router"
        "content-production-factory"
    )
    
    # Import workflows
    print_status "Importing workflows..."
    for workflow in "${workflows[@]}"; do
        import_workflow "${WORKFLOW_DIR}/${workflow}.json"
        sleep 2
    done
    echo
    
    # Activate workflows
    print_status "Activating workflows..."
    for workflow in "${workflows[@]}"; do
        activate_workflow "$workflow"
        sleep 2
    done
    echo
    
    # Test webhooks
    print_status "Testing webhook endpoints..."
    
    test_webhook "master-orchestrator" '{
        "action": "test_connection",
        "user_id": "deployment-test"
    }'
    
    test_webhook "smart-workflow-router" '{
        "action": "test_connection",
        "user_id": "deployment-test"
    }'
    
    test_webhook "content-production-factory" '{
        "action": "test_connection",
        "user_id": "deployment-test"
    }'
    
    echo
    print_success "Deployment completed!"
    echo
    echo "📋 Next Steps:"
    echo "1. Verify workflows in n8n UI: ${N8N_URL}"
    echo "2. Check webhook endpoints are active"
    echo "3. Test the Master Play Button in your React app"
    echo "4. Configure OpenAI API credentials in n8n"
    echo "5. Set up Supabase database connection"
    echo
    echo "🔗 Webhook URLs:"
    echo "- Master Orchestrator: ${N8N_URL}/webhook/master-orchestrator"
    echo "- Smart Router: ${N8N_URL}/webhook/smart-workflow-router"
    echo "- Content Factory: ${N8N_URL}/webhook/content-production-factory"
    echo
}

# Run main function
main "$@"