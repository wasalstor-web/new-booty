require('dotenv').config();

// Core Infrastructure
const PluginManager = require('./core/pluginManager');
const DomainAdapter = require('./core/domainAdapter');
const TrainingDataCollector = require('./core/trainingDataCollector');

// Orchestrators
const ModelOrchestrator = require('./orchestrator/modelOrchestrator');
const N8nOrchestrator = require('./orchestrator/n8nOrchestrator');

// Existing services
const N8nClient = require('./n8n/n8nClient');
const AIEngine = require('./ai/aiEngine');
const WorkflowOptimizer = require('./ai/workflowOptimizer');
const TelegramBotService = require('./utils/telegramBot');
const WorkflowVersionControl = require('./utils/versionControl');
const PermissionManager = require('./utils/permissionManager');

const express = require('express');
const app = express();
app.use(express.json());

// ============================================
// NEXUS v3.0 - INFRASTRUCTURE INITIALIZATION
// ============================================

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🧠 Nexus v3.0 - البنية التحتية الذكية                 ║
║      Self-Building AI Infrastructure                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

// Initialize core infrastructure
const pluginManager = new PluginManager();
const domainAdapter = new DomainAdapter();
const trainingCollector = new TrainingDataCollector();
const modelOrchestrator = new ModelOrchestrator();

// Register models
console.log('🤖 Registering AI models...');

// OpenAI Models
modelOrchestrator.registerModel({
  name: 'gpt-4',
  provider: 'gpt-4',
  type: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  capabilities: ['conversation', 'workflow_generation', 'code_generation', 'analysis'],
  priority: 1,
  costPerToken: 0.00003
});

modelOrchestrator.registerModel({
  name: 'gpt-3.5-turbo',
  provider: 'gpt-3.5-turbo',
  type: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  capabilities: ['conversation', 'workflow_generation'],
  priority: 5,
  costPerToken: 0.000002
});

// Enable default model
(async () => {
  try {
    await modelOrchestrator.enableModel('gpt-4');
    modelOrchestrator.setActiveModel('gpt-4');
    modelOrchestrator.setFallbackChain(['gpt-4', 'gpt-3.5-turbo']);
  } catch (error) {
    console.error('Warning: Could not enable default model:', error.message);
  }
})();

// Register plugins
console.log('🔌 Loading plugins...');

const ecommercePlugin = require('./plugins/ecommerce.plugin');
const healthcarePlugin = require('./plugins/healthcare.plugin');
const localModelsPlugin = require('./plugins/localModels.plugin');

pluginManager.registerPlugin('ecommerce', ecommercePlugin);
pluginManager.registerPlugin('healthcare', healthcarePlugin);
pluginManager.registerPlugin('local-models', localModelsPlugin);

// Register domains
console.log('🌍 Registering domains...');

domainAdapter.registerDomain({
  name: 'general',
  displayName: 'General Purpose',
  description: 'General purpose workflows and automation',
  workflows: [],
  aiPrompts: {
    analyze: 'Analyze this workflow and provide insights',
    generate: 'Generate a workflow based on the description'
  }
});

domainAdapter.activateDomain('general');

// Initialize N8N Orchestrator
const n8nOrchestrator = new N8nOrchestrator(modelOrchestrator);

// Initialize existing services
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
const versionControl = new WorkflowVersionControl();
const permissionManager = new PermissionManager();

// Add default admin
if (process.env.ADMIN_TELEGRAM_ID) {
  permissionManager.addUser(process.env.ADMIN_TELEGRAM_ID, 'admin', {
    name: 'System Admin'
  });
}

// Initialize Telegram Bot
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

// ============================================
// API ENDPOINTS
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'nexus-infrastructure',
    version: '3.0.0',
    features: {
      versionControl: true,
      permissions: true,
      modelOrchestration: true,
      pluginSystem: true,
      domainAdapter: true,
      trainingCollector: true,
      n8nOrchestrator: true,
      telegramBot: !!telegramBot
    },
    infrastructure: {
      enabledPlugins: pluginManager.getEnabledPlugins(),
      activeDomain: domainAdapter.getActiveDomain()?.name,
      activeModel: modelOrchestrator.activeModel,
      availableModels: modelOrchestrator.getAllModels().length
    },
    timestamp: new Date().toISOString()
  });
});

// Model management
app.get('/api/models', (req, res) => {
  res.json({
    success: true,
    models: modelOrchestrator.getAllModels()
  });
});

app.post('/api/models/switch', async (req, res) => {
  try {
    const { modelName, userId } = req.body;
    permissionManager.requirePermission(userId, '*');
    
    modelOrchestrator.setActiveModel(modelName);
    res.json({ success: true, activeModel: modelName });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/models/stats', (req, res) => {
  res.json({
    success: true,
    stats: modelOrchestrator.getStats()
  });
});

// Plugin management
app.get('/api/plugins', (req, res) => {
  res.json({
    success: true,
    plugins: pluginManager.getEnabledPlugins()
  });
});

app.post('/api/plugins/enable', async (req, res) => {
  try {
    const { pluginName, config, userId } = req.body;
    permissionManager.requirePermission(userId, '*');
    
    await pluginManager.enablePlugin(pluginName, config);
    
    // If it's a domain plugin, register its domain
    const plugin = pluginManager.getPlugin(pluginName);
    if (plugin.getWorkflows) {
      domainAdapter.registerDomain({
        name: pluginName,
        displayName: plugin.name,
        description: plugin.description,
        workflows: plugin.getWorkflows(),
        aiPrompts: plugin.getPrompts()
      });
    }
    
    // If it's a model plugin, register its models
    if (plugin.getModels) {
      for (const model of plugin.getModels()) {
        modelOrchestrator.registerModel(model);
      }
    }
    
    res.json({ success: true, message: `Plugin ${pluginName} enabled` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Domain management
app.get('/api/domains', (req, res) => {
  res.json({
    success: true,
    domains: domainAdapter.getAllDomains()
  });
});

app.post('/api/domains/activate', async (req, res) => {
  try {
    const { domainName, userId } = req.body;
    permissionManager.requirePermission(userId, '*');
    
    domainAdapter.activateDomain(domainName);
    res.json({ success: true, activeDomain: domainName });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// N8N orchestration
app.post('/api/n8n/build', async (req, res) => {
  try {
    const { userId } = req.body;
    permissionManager.requirePermission(userId, '*');
    
    await n8nOrchestrator.buildN8n();
    res.json({ success: true, message: 'n8n built successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/n8n/status', async (req, res) => {
  const status = await n8nOrchestrator.getStatus();
  res.json({ success: true, status });
});

app.post('/api/n8n/rebuild', async (req, res) => {
  try {
    const { config, userId } = req.body;
    permissionManager.requirePermission(userId, '*');
    
    await n8nOrchestrator.rebuild(config);
    res.json({ success: true, message: 'n8n rebuilt successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Training data
app.get('/api/training/stats', (req, res) => {
  res.json({
    success: true,
    stats: trainingCollector.getStatistics()
  });
});

app.post('/api/training/export', async (req, res) => {
  try {
    const { format, userId } = req.body;
    permissionManager.requirePermission(userId, '*');
    
    const data = await trainingCollector.exportForTraining(format || 'jsonl');
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enhanced workflow generation with model orchestration
app.post('/api/generate', async (req, res) => {
  try {
    const { description, userId, preferredModel } = req.body;
    permissionManager.requirePermission(userId, 'workflow.create');
    
    // Use model orchestrator instead of direct AI call
    const model = preferredModel || modelOrchestrator.getBestModelForTask('workflow_generation');
    
    const activeDomain = domainAdapter.getActiveDomain();
    const domainPrompts = activeDomain ? activeDomain.aiPrompts : {};
    
    const prompt = domainPrompts.generate || `Generate an n8n workflow for: ${description}`;
    
    const response = await modelOrchestrator.call(prompt, { model });
    
    // Collect training data
    await trainingCollector.collectWorkflowGeneration({
      userId,
      description,
      generatedWorkflow: JSON.parse(response.response),
      modelUsed: response.model,
      successful: true
    });
    
    res.json({ 
      success: true, 
      workflow: JSON.parse(response.response),
      metadata: {
        model: response.model,
        tokens: response.tokens,
        cost: response.cost,
        latency: response.latency
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enhanced AI call with training collection
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, userId, model } = req.body;
    
    const response = await modelOrchestrator.call(message, { model });
    
    // Collect training data
    await trainingCollector.collectConversation({
      userId,
      userMessage: message,
      aiResponse: response.response,
      modelUsed: response.model,
      domain: domainAdapter.getActiveDomain()?.name,
      successful: true
    });
    
    res.json({
      success: true,
      response: response.response,
      metadata: {
        model: response.model,
        tokens: response.tokens,
        cost: response.cost,
        latency: response.latency
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Keep existing endpoints
app.post('/api/analyze', async (req, res) => {
  try {
    const { workflowId, userId } = req.body;
    permissionManager.requirePermission(userId, 'ai.analyze');
    
    const analysis = await workflowOptimizer.analyzeWorkflow(workflowId);
    permissionManager.log('workflow.analyzed', userId, { workflowId });
    
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Version control endpoints
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
    await n8nClient.updateWorkflow(workflowId, result.workflowData);
    
    permissionManager.log('workflow.rollback', userId, { workflowId, steps });
    
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✅ Nexus v3.0 جاهز! / Ready!                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

📊 Server: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health

🆕 البنية التحتية الجديدة / New Infrastructure:
   🤖 Model Orchestrator - تبديل بين النماذج
   🔌 Plugin System - نظام الإضافات
   🌍 Domain Adapter - دعم أي مجال
   📚 Training Collector - جمع بيانات التدريب
   🏗️  N8N Orchestrator - بناء n8n تلقائياً

🔧 المكونات الأساسية / Core Components:
   ${modelOrchestrator.getAllModels().length} نموذج AI متاح
   ${pluginManager.getEnabledPlugins().length} إضافة نشطة
   ${domainAdapter.getAllDomains().length} مجال مسجل
   
🚀 النظام يبني نفسه ويتطور تلقائياً!
💡 System builds and evolves itself automatically!
  `);
});

// Export for testing
module.exports = {
  app,
  modelOrchestrator,
  pluginManager,
  domainAdapter,
  trainingCollector,
  n8nOrchestrator,
  versionControl,
  permissionManager
};
