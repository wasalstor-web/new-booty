#!/bin/bash

# Deploy to Hostinger Script
# سكريبت النشر على Hostinger

echo "🚀 Starting deployment to Hostinger..."

# Load environment variables
source .env

# Check required variables
if [ -z "$HOSTINGER_HOST" ] || [ -z "$HOSTINGER_USER" ] || [ -z "$HOSTINGER_PATH" ]; then
    echo "❌ Error: Missing Hostinger configuration in .env file"
    echo "Please set: HOSTINGER_HOST, HOSTINGER_USER, HOSTINGER_PATH"
    exit 1
fi

echo "📦 Creating deployment package..."
tar -czf deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='n8n-data' \
    --exclude='*.log' \
    --exclude='tmp' \
    src/ \
    package.json \
    docker-compose.yml \
    .env.example \
    README.md

echo "📤 Uploading to Hostinger..."
scp deploy.tar.gz $HOSTINGER_USER@$HOSTINGER_HOST:$HOSTINGER_PATH/

echo "🔧 Installing on server..."
ssh $HOSTINGER_USER@$HOSTINGER_HOST << EOF
cd $HOSTINGER_PATH
tar -xzf deploy.tar.gz
npm install --production
pm2 restart n8n-ai-automation || pm2 start src/index.js --name n8n-ai-automation
pm2 save
echo "✅ Deployment complete!"
EOF

# Cleanup
rm deploy.tar.gz

echo "
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✅ تم النشر بنجاح! / Deployment Successful!           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

🌐 Server: $HOSTINGER_HOST
📁 Path: $HOSTINGER_PATH
🚀 Application: Running with PM2

Check status: ssh $HOSTINGER_USER@$HOSTINGER_HOST 'pm2 status'
View logs: ssh $HOSTINGER_USER@$HOSTINGER_HOST 'pm2 logs n8n-ai-automation'
"
