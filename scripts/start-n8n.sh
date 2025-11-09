#!/bin/bash

# AI Automation System n8n Startup Script
# سكريبت بدء n8n لنظام الأتمتة الذكي

echo "🚀 Starting n8n for AI Automation..."

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    echo "✅ Using docker-compose"
    docker-compose up -d
elif command -v docker &> /dev/null; then
    echo "✅ Using docker run"
    
    # Create network if it doesn't exist
    docker network create n8n-ai-network 2>/dev/null || true
    
    # Remove old container if exists
    docker rm -f n8n-automation 2>/dev/null || true
    
    # Start n8n container
    docker run -d \
      --name n8n-automation \
      --network n8n-ai-network \
      --restart always \
      -p 5678:5678 \
      -e N8N_BASIC_AUTH_ACTIVE=true \
      -e N8N_BASIC_AUTH_USER=admin \
      -e N8N_BASIC_AUTH_PASSWORD=admin123 \
      -e N8N_HOST=${N8N_HOST:-localhost} \
      -e N8N_PORT=${N8N_PORT:-5678} \
      -e N8N_PROTOCOL=${N8N_PROTOCOL:-http} \
      -e WEBHOOK_URL=${N8N_PROTOCOL:-http}://${N8N_HOST:-localhost}:${N8N_PORT:-5678}/ \
      -e GENERIC_TIMEZONE=Asia/Riyadh \
      -e N8N_LOG_LEVEL=info \
      -e EXECUTIONS_DATA_SAVE_ON_SUCCESS=all \
      -e EXECUTIONS_DATA_SAVE_ON_ERROR=all \
      -e N8N_METRICS=true \
      -v $(pwd)/n8n-data:/home/node/.n8n \
      -v $(pwd)/workflows:/workflows \
      n8nio/n8n:latest
    
    echo "✅ n8n container started"
    echo "📊 Container name: n8n-automation"
    echo "🌐 URL: http://localhost:5678"
    echo "👤 Username: admin"
    echo "🔑 Password: admin123"
else
    echo "❌ Docker is not installed"
    exit 1
fi

echo ""
echo "⏳ Waiting for n8n to be ready..."

# Wait for n8n to be ready (check health endpoint)
MAX_ATTEMPTS=60
ATTEMPT=0
N8N_URL="http://localhost:5678"

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -s -f "$N8N_URL/healthz" > /dev/null 2>&1; then
        echo "✅ n8n is ready!"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    sleep 2
    echo -n "."
done

echo ""

# Check if n8n is running
if docker ps | grep -q n8n-automation; then
    echo "✅ n8n is running!"
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║   🎉 n8n Started Successfully!                           ║"
    echo "║      (للنظام الذكي على Hostinger)                       ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    echo "📍 Access n8n at: http://localhost:5678"
    echo "👤 Username: admin"
    echo "🔑 Password: admin123"
    echo ""
    echo "📝 To view logs: docker logs -f n8n-automation"
    echo "🛑 To stop: docker stop n8n-automation"
    echo ""
    
    # Open n8n in browser automatically
    echo "🌐 Opening n8n in browser..."
    
    # Detect OS and open browser
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v xdg-open &> /dev/null; then
            xdg-open "$N8N_URL" &
        elif command -v gnome-open &> /dev/null; then
            gnome-open "$N8N_URL" &
        elif command -v kde-open &> /dev/null; then
            kde-open "$N8N_URL" &
        else
            echo "⚠️  Could not detect browser. Please open manually: $N8N_URL"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "$N8N_URL"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows
        start "$N8N_URL"
    else
        echo "⚠️  Could not detect OS. Please open manually: $N8N_URL"
    fi
    
    echo "✅ Browser opened!"
else
    echo "❌ n8n failed to start"
    echo "📝 Check logs: docker logs n8n-automation"
    exit 1
fi
