/**
 * N8N Integration Bridge - جسر التكامل مع n8n
 * 
 * يربط جميع المكونات (النماذج، الإضافات، المجالات) مباشرة بـ n8n
 * Connects all components (models, plugins, domains) directly to n8n
 */
class N8nIntegrationBridge {
  constructor(n8nClient, modelOrchestrator, pluginManager, domainAdapter, trainingCollector) {
    this.n8nClient = n8nClient;
    this.modelOrchestrator = modelOrchestrator;
    this.pluginManager = pluginManager;
    this.domainAdapter = domainAdapter;
    this.trainingCollector = trainingCollector;
    
    this.integrations = new Map();
  }

  /**
   * Initialize - ربط كل شيء بـ n8n
   */
  async initialize() {
    console.log('🔗 Connecting all components to n8n...');

    // 1. ربط النماذج بـ n8n
    await this.connectModelsToN8n();

    // 2. ربط الإضافات بـ n8n
    await this.connectPluginsToN8n();

    // 3. ربط المجالات بـ n8n
    await this.connectDomainsToN8n();

    // 4. ربط جامع البيانات بـ n8n
    await this.connectTrainingCollectorToN8n();

    // 5. إنشاء workflows للتطوير الذاتي
    await this.createSelfDevelopmentWorkflows();

    console.log('✅ All components connected to n8n!');
  }

  /**
   * ربط النماذج بـ n8n - كل نموذج يصبح node في n8n
   */
  async connectModelsToN8n() {
    console.log('🤖 Connecting AI models to n8n...');

    const models = this.modelOrchestrator.getAllModels();

    for (const model of models) {
      // إنشاء workflow خاص بكل نموذج
      const workflow = {
        name: `AI Model: ${model.name}`,
        active: true,
        nodes: [
          {
            parameters: {
              httpMethod: 'POST',
              path: `ai-model-${model.name}`,
              responseMode: 'responseNode',
              options: {}
            },
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [250, 300],
            webhookId: `model-${model.name}`
          },
          {
            parameters: {
              functionCode: `
// استدعاء النموذج ${model.name}
const modelName = '${model.name}';
const prompt = $input.item.json.prompt;
const options = $input.item.json.options || {};

// استدعاء API الخاص بالنظام
const response = await $http.request({
  method: 'POST',
  url: 'http://localhost:3000/api/ai/chat',
  body: {
    message: prompt,
    model: modelName,
    ...options
  }
});

return { json: response };
              `
            },
            name: `Execute ${model.name}`,
            type: 'n8n-nodes-base.code',
            typeVersion: 2,
            position: [450, 300]
          },
          {
            parameters: {},
            name: 'Respond to Webhook',
            type: 'n8n-nodes-base.respondToWebhook',
            typeVersion: 1,
            position: [650, 300]
          }
        ],
        connections: {
          'Webhook': {
            main: [[{ node: `Execute ${model.name}`, type: 'main', index: 0 }]]
          },
          [`Execute ${model.name}`]: {
            main: [[{ node: 'Respond to Webhook', type: 'main', index: 0 }]]
          }
        },
        settings: {},
        staticData: null
      };

      try {
        const created = await this.n8nClient.createWorkflow(workflow);
        this.integrations.set(`model-${model.name}`, {
          type: 'model',
          workflowId: created.id,
          webhookUrl: `http://localhost:5678/webhook/ai-model-${model.name}`
        });
        console.log(`  ✅ ${model.name} connected to n8n`);
      } catch (error) {
        console.error(`  ❌ Failed to connect ${model.name}:`, error.message);
      }
    }
  }

  /**
   * ربط الإضافات بـ n8n - كل إضافة تصبح مجموعة workflows
   */
  async connectPluginsToN8n() {
    console.log('🔌 Connecting plugins to n8n...');

    const plugins = this.pluginManager.getEnabledPlugins();

    for (const plugin of plugins) {
      const pluginObj = this.pluginManager.getPlugin(plugin.name);
      
      if (pluginObj.getWorkflows) {
        const workflows = pluginObj.getWorkflows();
        
        for (const workflowTemplate of workflows) {
          // تحويل template إلى workflow كامل في n8n
          const workflow = await this.convertTemplateToN8nWorkflow(workflowTemplate, plugin.name);
          
          try {
            const created = await this.n8nClient.createWorkflow(workflow);
            console.log(`  ✅ ${plugin.name}: ${workflow.name} created`);
          } catch (error) {
            console.error(`  ❌ Failed to create ${workflow.name}:`, error.message);
          }
        }
      }
    }
  }

  /**
   * ربط المجالات بـ n8n - كل مجال له workflows مخصصة
   */
  async connectDomainsToN8n() {
    console.log('🌍 Connecting domains to n8n...');

    const domains = this.domainAdapter.getAllDomains();

    for (const domain of domains) {
      // إنشاء workflow لتفعيل المجال
      const activationWorkflow = {
        name: `Domain: ${domain.displayName}`,
        active: false,
        nodes: [
          {
            parameters: {
              httpMethod: 'POST',
              path: `domain-${domain.name}`,
              responseMode: 'responseNode'
            },
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [250, 300]
          },
          {
            parameters: {
              functionCode: `
// تفعيل المجال ${domain.displayName}
const response = await $http.request({
  method: 'POST',
  url: 'http://localhost:3000/api/domains/activate',
  body: {
    domainName: '${domain.name}',
    userId: $input.item.json.userId || 'admin'
  }
});

return { json: { 
  success: true, 
  domain: '${domain.displayName}',
  message: 'تم تفعيل المجال بنجاح'
}};
              `
            },
            name: `Activate ${domain.displayName}`,
            type: 'n8n-nodes-base.code',
            typeVersion: 2,
            position: [450, 300]
          },
          {
            parameters: {},
            name: 'Respond to Webhook',
            type: 'n8n-nodes-base.respondToWebhook',
            typeVersion: 1,
            position: [650, 300]
          }
        ],
        connections: {
          'Webhook': {
            main: [[{ node: `Activate ${domain.displayName}`, type: 'main', index: 0 }]]
          },
          [`Activate ${domain.displayName}`]: {
            main: [[{ node: 'Respond to Webhook', type: 'main', index: 0 }]]
          }
        }
      };

      try {
        const created = await this.n8nClient.createWorkflow(activationWorkflow);
        console.log(`  ✅ Domain ${domain.displayName} connected`);
      } catch (error) {
        console.error(`  ❌ Failed to connect domain:`, error.message);
      }
    }
  }

  /**
   * ربط جامع البيانات بـ n8n
   */
  async connectTrainingCollectorToN8n() {
    console.log('📚 Connecting training collector to n8n...');

    const workflow = {
      name: 'Training Data Collector',
      active: true,
      nodes: [
        {
          parameters: {
            rule: {
              interval: [{ field: 'hours', hoursInterval: 1 }]
            }
          },
          name: 'Schedule',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1.1,
          position: [250, 300]
        },
        {
          parameters: {
            functionCode: `
// جمع وتصدير بيانات التدريب
const response = await $http.request({
  method: 'POST',
  url: 'http://localhost:3000/api/training/export',
  body: {
    format: 'llama',
    userId: 'system'
  }
});

return { json: { 
  success: true,
  dataCollected: response.data,
  timestamp: new Date().toISOString()
}};
            `
          },
          name: 'Collect Training Data',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [450, 300]
        },
        {
          parameters: {
            functionCode: `
// حفظ البيانات
const fs = require('fs');
const data = $input.item.json;

fs.writeFileSync(
  './training-data/export-' + Date.now() + '.json',
  JSON.stringify(data, null, 2)
);

return { json: { saved: true }};
            `
          },
          name: 'Save Data',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [650, 300]
        }
      ],
      connections: {
        'Schedule': {
          main: [[{ node: 'Collect Training Data', type: 'main', index: 0 }]]
        },
        'Collect Training Data': {
          main: [[{ node: 'Save Data', type: 'main', index: 0 }]]
        }
      }
    };

    try {
      await this.n8nClient.createWorkflow(workflow);
      console.log('  ✅ Training collector connected');
    } catch (error) {
      console.error('  ❌ Failed to connect training collector:', error.message);
    }
  }

  /**
   * إنشاء workflows للتطوير الذاتي - n8n يطور نفسه
   */
  async createSelfDevelopmentWorkflows() {
    console.log('🔧 Creating self-development workflows...');

    // Workflow 1: تحليل وتحسين workflows موجودة
    const analyzeWorkflow = {
      name: '🧠 Self-Analysis & Optimization',
      active: true,
      nodes: [
        {
          parameters: {
            rule: {
              interval: [{ field: 'hours', hoursInterval: 6 }]
            }
          },
          name: 'Schedule Every 6 Hours',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1.1,
          position: [250, 300]
        },
        {
          parameters: {
            functionCode: `
// الحصول على جميع workflows
const workflows = await $http.request({
  method: 'GET',
  url: 'http://localhost:5678/api/v1/workflows',
  headers: {
    'X-N8N-API-KEY': process.env.N8N_API_KEY
  }
});

return workflows.data.data.map(w => ({ json: w }));
            `
          },
          name: 'Get All Workflows',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [450, 300]
        },
        {
          parameters: {
            functionCode: `
// تحليل كل workflow بالـ AI
const workflow = $input.item.json;

const analysis = await $http.request({
  method: 'POST',
  url: 'http://localhost:3000/api/analyze',
  body: {
    workflowId: workflow.id,
    userId: 'system'
  }
});

return { json: { workflow: workflow, analysis: analysis.data }};
            `
          },
          name: 'Analyze with AI',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [650, 300]
        },
        {
          parameters: {
            functionCode: `
// تطبيق التحسينات المقترحة
const data = $input.item.json;

if (data.analysis && data.analysis.analysis.suggestions) {
  const optimized = await $http.request({
    method: 'POST',
    url: 'http://localhost:3000/api/optimize',
    body: {
      workflowId: data.workflow.id,
      userId: 'system'
    }
  });
  
  return { json: { 
    workflow: data.workflow.name,
    optimized: true,
    improvements: optimized.data
  }};
}

return { json: { workflow: data.workflow.name, optimized: false }};
            `
          },
          name: 'Apply Optimizations',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [850, 300]
        }
      ],
      connections: {
        'Schedule Every 6 Hours': {
          main: [[{ node: 'Get All Workflows', type: 'main', index: 0 }]]
        },
        'Get All Workflows': {
          main: [[{ node: 'Analyze with AI', type: 'main', index: 0 }]]
        },
        'Analyze with AI': {
          main: [[{ node: 'Apply Optimizations', type: 'main', index: 0 }]]
        }
      }
    };

    // Workflow 2: إنشاء workflows جديدة تلقائياً
    const createWorkflow = {
      name: '🚀 Auto-Create New Workflows',
      active: true,
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'auto-create-workflow',
            responseMode: 'responseNode'
          },
          name: 'Webhook Trigger',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            functionCode: `
// توليد workflow جديد بالـ AI
const description = $input.item.json.description;

const workflow = await $http.request({
  method: 'POST',
  url: 'http://localhost:3000/api/generate',
  body: {
    description: description,
    userId: 'system'
  }
});

return { json: workflow.data };
            `
          },
          name: 'Generate with AI',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [450, 300]
        },
        {
          parameters: {
            functionCode: `
// إنشاء الـ workflow في n8n
const workflowData = $input.item.json.workflow;

const created = await $http.request({
  method: 'POST',
  url: 'http://localhost:5678/api/v1/workflows',
  headers: {
    'X-N8N-API-KEY': process.env.N8N_API_KEY
  },
  body: workflowData
});

return { json: { 
  success: true,
  created: created.data.data,
  message: 'تم إنشاء workflow جديد تلقائياً'
}};
            `
          },
          name: 'Create in n8n',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [650, 300]
        },
        {
          parameters: {},
          name: 'Respond',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [850, 300]
        }
      ],
      connections: {
        'Webhook Trigger': {
          main: [[{ node: 'Generate with AI', type: 'main', index: 0 }]]
        },
        'Generate with AI': {
          main: [[{ node: 'Create in n8n', type: 'main', index: 0 }]]
        },
        'Create in n8n': {
          main: [[{ node: 'Respond', type: 'main', index: 0 }]]
        }
      }
    };

    // Workflow 3: مراقبة الأداء وتبديل النماذج
    const monitorPerformance = {
      name: '📊 Monitor & Switch Models',
      active: true,
      nodes: [
        {
          parameters: {
            rule: {
              interval: [{ field: 'minutes', minutesInterval: 30 }]
            }
          },
          name: 'Every 30 Minutes',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1.1,
          position: [250, 300]
        },
        {
          parameters: {
            functionCode: `
// الحصول على إحصائيات النماذج
const stats = await $http.request({
  method: 'GET',
  url: 'http://localhost:3000/api/models/stats'
});

// اختيار أفضل نموذج
let bestModel = null;
let bestScore = 0;

for (const [modelName, modelStats] of Object.entries(stats.data.stats)) {
  const successRate = modelStats.totalCalls > 0 
    ? modelStats.successfulCalls / modelStats.totalCalls 
    : 0;
  
  const score = successRate * 100 - (modelStats.averageLatency / 100);
  
  if (score > bestScore) {
    bestScore = score;
    bestModel = modelName;
  }
}

return { json: { bestModel, stats: stats.data.stats }};
            `
          },
          name: 'Analyze Performance',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [450, 300]
        },
        {
          parameters: {
            functionCode: `
// تبديل للنموذج الأفضل
const bestModel = $input.item.json.bestModel;

if (bestModel) {
  await $http.request({
    method: 'POST',
    url: 'http://localhost:3000/api/models/switch',
    body: {
      modelName: bestModel,
      userId: 'system'
    }
  });
}

return { json: { 
  switched: true, 
  model: bestModel,
  message: \`تم التبديل إلى \${bestModel}\`
}};
            `
          },
          name: 'Switch to Best Model',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [650, 300]
        }
      ],
      connections: {
        'Every 30 Minutes': {
          main: [[{ node: 'Analyze Performance', type: 'main', index: 0 }]]
        },
        'Analyze Performance': {
          main: [[{ node: 'Switch to Best Model', type: 'main', index: 0 }]]
        }
      }
    };

    // إنشاء جميع workflows
    try {
      await this.n8nClient.createWorkflow(analyzeWorkflow);
      console.log('  ✅ Self-analysis workflow created');
      
      await this.n8nClient.createWorkflow(createWorkflow);
      console.log('  ✅ Auto-create workflow created');
      
      await this.n8nClient.createWorkflow(monitorPerformance);
      console.log('  ✅ Performance monitor workflow created');
    } catch (error) {
      console.error('  ❌ Failed to create workflow:', error.message);
    }
  }

  /**
   * تحويل template إلى workflow كامل
   */
  async convertTemplateToN8nWorkflow(template, pluginName) {
    const nodes = [];
    const connections = {};

    // إضافة webhook trigger
    nodes.push({
      parameters: {
        httpMethod: 'POST',
        path: `${pluginName}-${template.name.toLowerCase().replace(/ /g, '-')}`,
        responseMode: 'responseNode'
      },
      name: 'Trigger',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [250, 300]
    });

    // تحويل nodes من template
    let xPos = 450;
    template.nodes.forEach((node, index) => {
      nodes.push({
        parameters: {
          functionCode: `// ${node.name}\nreturn { json: $input.item.json };`
        },
        name: node.name,
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [xPos, 300]
      });
      xPos += 200;
    });

    // إضافة respond
    nodes.push({
      parameters: {},
      name: 'Respond',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1,
      position: [xPos, 300]
    });

    // ربط nodes
    for (let i = 0; i < nodes.length - 1; i++) {
      connections[nodes[i].name] = {
        main: [[{ node: nodes[i + 1].name, type: 'main', index: 0 }]]
      };
    }

    return {
      name: `${pluginName}: ${template.name}`,
      active: true,
      nodes,
      connections
    };
  }

  /**
   * الحصول على جميع التكاملات
   */
  getIntegrations() {
    const integrations = [];
    
    this.integrations.forEach((integration, key) => {
      integrations.push({
        key,
        ...integration
      });
    });

    return integrations;
  }
}

module.exports = N8nIntegrationBridge;
