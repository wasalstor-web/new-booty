#!/bin/bash

# Nexus n8n Startup Script
# سكريبت بدء n8n

echo "🚀 Starting Nexus n8n..."

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    echo "✅ Using docker-compose"
    docker-compose up -d
elif command -v docker &> /dev/null; then
    echo "✅ Using docker run"
    
    # Create network if it doesn't exist
    docker network create nexus-network 2>/dev/null || true
    
    # Remove old container if exists
    docker rm -f nexus-n8n 2>/dev/null || true
    
    # Start n8n container
    docker run -d \
      --name nexus-n8n \
      --network nexus-network \
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
    echo "📊 Container name: nexus-n8n"
    echo "🌐 URL: http://localhost:5678"
    echo "👤 Username: admin"
    echo "🔑 Password: admin123"
else
    echo "❌ Docker is not installed"
    exit 1
fi

echo ""
echo "⏳ Waiting for n8n to be ready..."
sleep 5

# Check if n8n is running
if docker ps | grep -q nexus-n8n; then
    echo "✅ n8n is running!"
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║   🎉 n8n Started Successfully!                           ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    echo "📍 Access n8n at: http://localhost:5678"
    echo "👤 Username: admin"
    echo "🔑 Password: admin123"
    echo ""
    echo "📝 To view logs: docker logs -f nexus-n8n"
    echo "🛑 To stop: docker stop nexus-n8n"
else
    echo "❌ n8n failed to start"
    echo "📝 Check logs: docker logs nexus-n8n"
    exit 1
fi
