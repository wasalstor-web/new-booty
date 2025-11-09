/**
 * Model Orchestrator - منسق النماذج
 * 
 * يدير ويبدل بين نماذج AI المختلفة (OpenAI, Llama, Mistral, إلخ)
 * Manages and switches between different AI models
 */
class ModelOrchestrator {
  constructor() {
    this.models = new Map();
    this.activeModel = null;
    this.fallbackChain = [];
    this.modelStats = new Map();
  }

  /**
   * Register a model provider
   */
  registerModel(config) {
    const {
      name,
      provider,
      type, // 'openai', 'local', 'api'
      endpoint,
      apiKey,
      capabilities,
      priority,
      costPerToken
    } = config;

    if (this.models.has(name)) {
      throw new Error(`Model ${name} is already registered`);
    }

    this.models.set(name, {
      name,
      provider,
      type,
      endpoint,
      apiKey,
      capabilities: capabilities || [],
      priority: priority || 10,
      costPerToken: costPerToken || 0,
      enabled: false,
      stats: {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalTokens: 0,
        totalCost: 0,
        averageLatency: 0
      }
    });

    console.log(`✅ Model registered: ${name} (${provider})`);
  }

  /**
   * Enable a model
   */
  async enableModel(name) {
    const model = this.models.get(name);
    
    if (!model) {
      throw new Error(`Model ${name} not found`);
    }

    // Test connection
    try {
      await this.testModel(name);
      model.enabled = true;
      console.log(`✅ Model enabled: ${name}`);
    } catch (error) {
      console.error(`❌ Failed to enable model ${name}:`, error.message);
      throw error;
    }
  }

  /**
   * Set active model
   */
  setActiveModel(name) {
    const model = this.models.get(name);
    
    if (!model) {
      throw new Error(`Model ${name} not found`);
    }

    if (!model.enabled) {
      throw new Error(`Model ${name} is not enabled`);
    }

    this.activeModel = name;
    console.log(`🎯 Active model set to: ${name}`);
  }

  /**
   * Configure fallback chain
   */
  setFallbackChain(modelNames) {
    // Validate all models exist
    for (const name of modelNames) {
      if (!this.models.has(name)) {
        throw new Error(`Model ${name} in fallback chain not found`);
      }
    }

    this.fallbackChain = modelNames;
    console.log(`🔄 Fallback chain configured: ${modelNames.join(' -> ')}`);
  }

  /**
   * Call model with automatic fallback
   */
  async call(prompt, options = {}) {
    const modelsToTry = options.model 
      ? [options.model]
      : this.activeModel 
        ? [this.activeModel, ...this.fallbackChain]
        : this.fallbackChain;

    let lastError = null;

    for (const modelName of modelsToTry) {
      const model = this.models.get(modelName);
      
      if (!model || !model.enabled) {
        continue;
      }

      try {
        const startTime = Date.now();
        const response = await this.executeModelCall(model, prompt, options);
        const latency = Date.now() - startTime;

        // Update stats
        this.updateStats(modelName, true, latency, response.tokens || 0);

        return {
          response: response.text,
          model: modelName,
          tokens: response.tokens,
          latency,
          cost: (response.tokens || 0) * model.costPerToken
        };

      } catch (error) {
        console.error(`❌ Model ${modelName} failed:`, error.message);
        this.updateStats(modelName, false, 0, 0);
        lastError = error;
        
        // Try next model in fallback chain
        continue;
      }
    }

    throw new Error(`All models failed. Last error: ${lastError?.message}`);
  }

  /**
   * Execute actual model call based on type
   */
  async executeModelCall(model, prompt, options) {
    switch (model.type) {
      case 'openai':
        return await this.callOpenAI(model, prompt, options);
      
      case 'local':
        return await this.callLocalModel(model, prompt, options);
      
      case 'api':
        return await this.callCustomAPI(model, prompt, options);
      
      default:
        throw new Error(`Unknown model type: ${model.type}`);
    }
  }

  /**
   * Call OpenAI model
   */
  async callOpenAI(model, prompt, options) {
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey: model.apiKey });

    const response = await client.chat.completions.create({
      model: model.provider,
      messages: [
        { role: 'system', content: options.systemPrompt || 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000
    });

    return {
      text: response.choices[0].message.content,
      tokens: response.usage.total_tokens
    };
  }

  /**
   * Call local model (Ollama, LLaMA, etc.)
   */
  async callLocalModel(model, prompt, options) {
    const axios = require('axios');

    const response = await axios.post(model.endpoint, {
      model: model.provider,
      prompt: prompt,
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        num_predict: options.maxTokens || 2000
      }
    });

    return {
      text: response.data.response,
      tokens: response.data.prompt_eval_count + response.data.eval_count
    };
  }

  /**
   * Call custom API
   */
  async callCustomAPI(model, prompt, options) {
    const axios = require('axios');

    const response = await axios.post(
      model.endpoint,
      {
        prompt,
        ...options
      },
      {
        headers: {
          'Authorization': `Bearer ${model.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      text: response.data.text || response.data.response,
      tokens: response.data.tokens || 0
    };
  }

  /**
   * Test model connection
   */
  async testModel(name) {
    const model = this.models.get(name);
    
    try {
      const response = await this.executeModelCall(model, 'Test connection', {});
      return response.text ? true : false;
    } catch (error) {
      throw new Error(`Model test failed: ${error.message}`);
    }
  }

  /**
   * Update model statistics
   */
  updateStats(modelName, success, latency, tokens) {
    const model = this.models.get(modelName);
    
    if (!model) return;

    const stats = model.stats;
    stats.totalCalls++;
    
    if (success) {
      stats.successfulCalls++;
      stats.totalTokens += tokens;
      stats.totalCost += tokens * model.costPerToken;
      
      // Update average latency
      const prevTotal = stats.averageLatency * (stats.successfulCalls - 1);
      stats.averageLatency = (prevTotal + latency) / stats.successfulCalls;
    } else {
      stats.failedCalls++;
    }
  }

  /**
   * Get model statistics
   */
  getStats(modelName = null) {
    if (modelName) {
      const model = this.models.get(modelName);
      return model ? model.stats : null;
    }

    const allStats = {};
    this.models.forEach((model, name) => {
      allStats[name] = model.stats;
    });
    return allStats;
  }

  /**
   * Get best model for task
   */
  getBestModelForTask(task) {
    const eligibleModels = [];

    this.models.forEach((model, name) => {
      if (model.enabled && model.capabilities.includes(task)) {
        eligibleModels.push({
          name,
          priority: model.priority,
          successRate: model.stats.totalCalls > 0 
            ? model.stats.successfulCalls / model.stats.totalCalls 
            : 0,
          avgLatency: model.stats.averageLatency
        });
      }
    });

    if (eligibleModels.length === 0) {
      return this.activeModel;
    }

    // Sort by success rate, then by priority, then by latency
    eligibleModels.sort((a, b) => {
      if (Math.abs(a.successRate - b.successRate) > 0.1) {
        return b.successRate - a.successRate;
      }
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.avgLatency - b.avgLatency;
    });

    return eligibleModels[0].name;
  }

  /**
   * Get all models info
   */
  getAllModels() {
    const models = [];
    
    this.models.forEach((model, name) => {
      models.push({
        name,
        provider: model.provider,
        type: model.type,
        enabled: model.enabled,
        isActive: name === this.activeModel,
        capabilities: model.capabilities,
        stats: model.stats
      });
    });

    return models;
  }
}

module.exports = ModelOrchestrator;
