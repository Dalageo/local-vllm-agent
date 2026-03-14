#!/bin/bash
# Agent Frontend + API Server Startup Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' 

# Navigate to project root
cd "$(dirname "$0")/../.." || exit

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════╗"
echo "║       🖥️  Agent Terminal - Web Interface           ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if vLLM server is running
echo -e "${YELLOW}Checking vLLM server status...${NC}"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ vLLM server is running${NC}"
else
    echo -e "${RED}✗ vLLM server is not running${NC}"
    echo -e "${YELLOW}Please start the vLLM server first:${NC}"
    echo -e "  ${CYAN}bash app/scripts/start_agent.sh${NC}"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

export PYTHONPATH="${PWD}"
PORT=${1:-8080}

echo ""
echo -e "${CYAN}Starting FastAPI server...${NC}"
echo -e "  Port:     ${GREEN}${PORT}${NC}"
echo -e "  API:      ${GREEN}http://localhost:${PORT}/api${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:${PORT}${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""

# Start uvicorn server
python3 -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --reload
