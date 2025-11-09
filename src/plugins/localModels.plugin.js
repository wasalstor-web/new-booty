/**
 * Local Model Plugin - إضافة نماذج محلية
 * 
 * يتيح استخدام نماذج مفتوحة المصدر محلياً (Llama, Mistral, إلخ)
 */
module.exports = {
  name: 'local-models',
  version: '1.0.0',
  description: 'Support for local open-source models (Llama, Mistral, Falcon, etc.)',

  async initialize(config, pluginManager) {
    console.log('🤖 Initializing Local Models plugin...');

    // تسجيل النماذج المحلية المتاحة
    this.availableModels = [
      {
        name: 'llama-2-7b',
        provider: 'Meta Llama 2 7B',
        type: 'local',
        endpoint: 'http://localhost:11434/api/generate',
        capabilities: ['conversation', 'workflow_generation', 'code_generation'],
        priority: 5,
        costPerToken: 0 // مجاني
      },
      {
        name: 'mistral-7b',
        provider: 'Mistral 7B',
        type: 'local',
        endpoint: 'http://localhost:11434/api/generate',
        capabilities: ['conversation', 'analysis'],
        priority: 5,
        costPerToken: 0
      },
      {
        name: 'codellama-13b',
        provider: 'Code Llama 13B',
        type: 'local',
        endpoint: 'http://localhost:11434/api/generate',
        capabilities: ['code_generation', 'workflow_generation'],
        priority: 3,
        costPerToken: 0
      }
    ];

    console.log(`✅ Local Models plugin initialized with ${this.availableModels.length} models`);
  },

  async shutdown() {
    console.log('🤖 Local Models plugin shutting down...');
  },

  getModels() {
    return this.availableModels;
  },

  // Helper to download and setup a model
  async downloadModel(modelName) {
    console.log(`📥 Downloading model: ${modelName}...`);
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);

    try {
      await execPromise(`ollama pull ${modelName}`);
      console.log(`✅ Model ${modelName} downloaded successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to download ${modelName}:`, error.message);
      return false;
    }
  }
};
