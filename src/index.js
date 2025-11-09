require('dotenv').config();

const N8nClient = require('./n8n/n8nClient');
const AIEngine = require('./ai/aiEngine');
const WorkflowOptimizer = require('./ai/workflowOptimizer');
const TelegramBotService = require('./utils/telegramBot');
const WorkflowVersionControl = require('./utils/versionControl');
const PermissionManager = require('./utils/permissionManager');
const express = require('express');

const app = express();
app.use(express.json());

// Initialize services
const n8nClient = new N8nClient({
  host: process.env.N8N_HOST || 'localhost',
  port: process.env.N8N_PORT || 5678,
  protocol: process.env.N8N_PROTOCOL || 'http',
  apiKey: process.env.N8N_API_KEY
});

const aiEngine = new AIEngine({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.AI_MODEL || 'gpt-4'
});

const workflowOptimizer = new WorkflowOptimizer(n8nClient, aiEngine);

// Initialize Version Control
const versionControl = new WorkflowVersionControl();

// Initialize Permission Manager
const permissionManager = new PermissionManager();

// Add default admin user (from environment or use first user)
if (process.env.ADMIN_TELEGRAM_ID) {
  permissionManager.addUser(process.env.ADMIN_TELEGRAM_ID, 'admin', {
    name: 'System Admin'
  });
}

// Initialize Telegram Bot if token is provided
let telegramBot = null;
if (process.env.TELEGRAM_BOT_TOKEN) {
  telegramBot = new TelegramBotService(
    process.env.TELEGRAM_BOT_TOKEN,
    n8nClient,
    aiEngine,
    workflowOptimizer,
    versionControl,
    permissionManager
  );
  console.log('✅ Telegram Bot initialized');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'n8n-ai-automation',
    version: '2.0.0',
    features: {
      versionControl: true,
      permissions: true,
      aiEngine: true,
      telegramBot: !!telegramBot
    },
    timestamp: new Date().toISOString()
  });
});

// API endpoint to analyze workflows
app.post('/api/analyze', async (req, res) => {
  try {
    const { workflowId, userId } = req.body;
    
    // Check permission
    permissionManager.requirePermission(userId, 'ai.analyze');
    
    const analysis = await workflowOptimizer.analyzeWorkflow(workflowId);
    
    permissionManager.log('workflow.analyzed', userId, { workflowId });
    
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to generate workflows
app.post('/api/generate', async (req, res) => {
  try {
    const { description, userId } = req.body;
    
    // Check permission
    permissionManager.requirePermission(userId, 'workflow.create');
    
    const workflow = await workflowOptimizer.generateWorkflow(description);
    
    // Save initial version
    if (workflow.workflow && workflow.workflow.id) {
      await versionControl.saveVersion(
        workflow.workflow.id,
        workflow.workflow,
        { userId, description: 'Initial creation by AI' }
      );
    }
    
    permissionManager.log('workflow.created', userId, { description });
    
    res.json({ success: true, workflow });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to optimize workflows
app.post('/api/optimize', async (req, res) => {
  try {
    const { workflowId, userId } = req.body;
    
    // Check permission
    permissionManager.requirePermission(userId, 'ai.optimize');
    
    const optimized = await workflowOptimizer.optimizeWorkflow(workflowId);
    
    permissionManager.log('workflow.optimized', userId, { workflowId });
    
    res.json({ success: true, optimized });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint for version control
app.get('/api/versions/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { userId } = req.query;
    
    permissionManager.requirePermission(userId, 'workflow.read');
    
    const history = await versionControl.getHistory(workflowId);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/rollback', async (req, res) => {
  try {
    const { workflowId, steps, userId } = req.body;
    
    permissionManager.requirePermission(userId, 'workflow.update');
    
    const result = await versionControl.rollback(workflowId, steps || 1);
    
    // Apply the rollback to n8n
    await n8nClient.updateWorkflow(workflowId, result.workflowData);
    
    permissionManager.log('workflow.rollback', userId, { workflowId, steps });
    
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Permissions management endpoints
app.get('/api/users', async (req, res) => {
  try {
    const { userId } = req.query;
    
    permissionManager.requirePermission(userId, '*');
    
    const users = permissionManager.getAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/users/add', async (req, res) => {
  try {
    const { userId: requesterId, targetUserId, role, metadata } = req.body;
    
    permissionManager.requirePermission(requesterId, '*');
    
    permissionManager.addUser(targetUserId, role, metadata);
    res.json({ success: true, message: 'User added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start auto-optimization service
app.post('/api/auto-optimize/start', async (req, res) => {
  try {
    const { userId } = req.body;
    
    permissionManager.requirePermission(userId, '*');
    
    workflowOptimizer.startAutoOptimization();
    res.json({ success: true, message: 'Auto-optimization started' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stop auto-optimization service
app.post('/api/auto-optimize/stop', async (req, res) => {
  try {
    const { userId } = req.body;
    
    permissionManager.requirePermission(userId, '*');
    
    workflowOptimizer.stopAutoOptimization();
    res.json({ success: true, message: 'Auto-optimization stopped' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🤖 Nexus v2.0 - نظام الأتمتة الذكي المطور             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

✅ النظام جاهز / System Ready!

📊 Server: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
🤖 AI Model: ${process.env.AI_MODEL || 'gpt-4'}
⚡ n8n API: ${process.env.N8N_PROTOCOL}://${process.env.N8N_HOST}:${process.env.N8N_PORT}
${telegramBot ? '💬 Telegram Bot: Active' : ''}

🆕 إضافات جديدة / New Features:
   📝 Version Control - التحكم في الإصدارات
   🔐 Permission System - نظام الصلاحيات
   🔙 Rollback Support - دعم التراجع
   📊 Audit Logging - سجل العمليات

🚀 النظام يعمل وجاهز لتطوير الأتمتة بنفسه!
🧠 System is running and ready to self-develop automation!
  `);
});

// Export for testing
module.exports = {
  app,
  versionControl,
  permissionManager,
  workflowOptimizer
};
