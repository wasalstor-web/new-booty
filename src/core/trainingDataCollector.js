/**
 * Training Data Collector - جامع بيانات التدريب
 * 
 * يجمع البيانات لتدريب نماذج مفتوحة المصدر مستقبلاً
 * Collects data for training open-source models in the future
 */
const fs = require('fs').promises;
const path = require('path');

class TrainingDataCollector {
  constructor(storageDir = './training-data') {
    this.storageDir = storageDir;
    this.sessions = new Map();
    this.datasets = new Map();
    this.init();
  }

  /**
   * Initialize storage
   */
  async init() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      await fs.mkdir(path.join(this.storageDir, 'conversations'), { recursive: true });
      await fs.mkdir(path.join(this.storageDir, 'workflows'), { recursive: true });
      await fs.mkdir(path.join(this.storageDir, 'feedback'), { recursive: true });
      await fs.mkdir(path.join(this.storageDir, 'model-outputs'), { recursive: true });
      console.log('✅ Training Data Collector initialized');
    } catch (error) {
      console.error('Error initializing training data collector:', error.message);
    }
  }

  /**
   * Collect conversation data
   */
  async collectConversation(data) {
    const {
      userId,
      userMessage,
      aiResponse,
      intent,
      domain,
      modelUsed,
      successful
    } = data;

    const conversationEntry = {
      timestamp: new Date().toISOString(),
      userId,
      input: userMessage,
      output: aiResponse,
      intent: intent || 'unknown',
      domain: domain || 'general',
      model: modelUsed || 'unknown',
      successful: successful !== false,
      metadata: {
        language: this.detectLanguage(userMessage),
        messageLength: userMessage.length,
        responseLength: aiResponse.length
      }
    };

    // Store in memory
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, []);
    }
    this.sessions.get(userId).push(conversationEntry);

    // Save to disk
    await this.saveConversation(conversationEntry);

    // Update dataset
    this.updateDataset('conversations', conversationEntry);
  }

  /**
   * Collect workflow generation data
   */
  async collectWorkflowGeneration(data) {
    const {
      userId,
      description,
      generatedWorkflow,
      modelUsed,
      successful,
      executionResults
    } = data;

    const workflowEntry = {
      timestamp: new Date().toISOString(),
      userId,
      description,
      workflow: generatedWorkflow,
      model: modelUsed || 'unknown',
      successful: successful !== false,
      executionResults: executionResults || null,
      metadata: {
        nodeCount: generatedWorkflow.nodes?.length || 0,
        connectionCount: Object.keys(generatedWorkflow.connections || {}).length
      }
    };

    await this.saveWorkflowData(workflowEntry);
    this.updateDataset('workflows', workflowEntry);
  }

  /**
   * Collect model comparison data
   */
  async collectModelComparison(data) {
    const {
      prompt,
      models,
      outputs,
      selectedModel,
      reason
    } = data;

    const comparisonEntry = {
      timestamp: new Date().toISOString(),
      prompt,
      models: models.map((model, index) => ({
        name: model,
        output: outputs[index],
        selected: model === selectedModel
      })),
      selectedModel,
      reason
    };

    await this.saveModelOutput(comparisonEntry);
    this.updateDataset('model-comparisons', comparisonEntry);
  }

  /**
   * Collect user feedback
   */
  async collectFeedback(data) {
    const {
      userId,
      action,
      rating,
      comment,
      context,
      modelUsed
    } = data;

    const feedbackEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action,
      rating: rating || 0,
      comment: comment || '',
      context: context || {},
      model: modelUsed || 'unknown'
    };

    await this.saveFeedback(feedbackEntry);
    this.updateDataset('feedback', feedbackEntry);
  }

  /**
   * Save conversation to disk
   */
  async saveConversation(entry) {
    const date = new Date().toISOString().split('T')[0];
    const filename = `conversations-${date}.jsonl`;
    const filepath = path.join(this.storageDir, 'conversations', filename);
    
    try {
      await fs.appendFile(filepath, JSON.stringify(entry) + '\n');
    } catch (error) {
      console.error('Error saving conversation:', error.message);
    }
  }

  /**
   * Save workflow data to disk
   */
  async saveWorkflowData(entry) {
    const date = new Date().toISOString().split('T')[0];
    const filename = `workflows-${date}.jsonl`;
    const filepath = path.join(this.storageDir, 'workflows', filename);
    
    try {
      await fs.appendFile(filepath, JSON.stringify(entry) + '\n');
    } catch (error) {
      console.error('Error saving workflow data:', error.message);
    }
  }

  /**
   * Save model output comparison
   */
  async saveModelOutput(entry) {
    const date = new Date().toISOString().split('T')[0];
    const filename = `model-outputs-${date}.jsonl`;
    const filepath = path.join(this.storageDir, 'model-outputs', filename);
    
    try {
      await fs.appendFile(filepath, JSON.stringify(entry) + '\n');
    } catch (error) {
      console.error('Error saving model output:', error.message);
    }
  }

  /**
   * Save feedback to disk
   */
  async saveFeedback(entry) {
    const date = new Date().toISOString().split('T')[0];
    const filename = `feedback-${date}.jsonl`;
    const filepath = path.join(this.storageDir, 'feedback', filename);
    
    try {
      await fs.appendFile(filepath, JSON.stringify(entry) + '\n');
    } catch (error) {
      console.error('Error saving feedback:', error.message);
    }
  }

  /**
   * Update in-memory dataset
   */
  updateDataset(type, entry) {
    if (!this.datasets.has(type)) {
      this.datasets.set(type, []);
    }
    
    const dataset = this.datasets.get(type);
    dataset.push(entry);

    // Keep only last 1000 entries in memory
    if (dataset.length > 1000) {
      dataset.shift();
    }
  }

  /**
   * Export dataset for training
   */
  async exportForTraining(format = 'jsonl') {
    const exports = {
      conversations: [],
      workflows: [],
      feedback: [],
      modelComparisons: []
    };

    // Read all files
    const types = ['conversations', 'workflows', 'feedback', 'model-outputs'];
    
    for (const type of types) {
      const dir = path.join(this.storageDir, type);
      const files = await fs.readdir(dir);
      
      for (const file of files) {
        const content = await fs.readFile(path.join(dir, file), 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());
        const key = type === 'model-outputs' ? 'modelComparisons' : type;
        exports[key].push(...lines.map(line => JSON.parse(line)));
      }
    }

    if (format === 'jsonl') {
      return exports;
    } else if (format === 'huggingface') {
      return this.convertToHuggingFaceFormat(exports);
    } else if (format === 'llama') {
      return this.convertToLlamaFormat(exports);
    }

    return exports;
  }

  /**
   * Convert to Hugging Face dataset format
   */
  convertToHuggingFaceFormat(data) {
    const dataset = {
      data: [],
      metadata: {
        name: 'nexus-training-data',
        version: '1.0.0',
        description: 'Training data for Nexus AI automation system',
        features: {
          text: 'string',
          response: 'string',
          intent: 'string',
          domain: 'string',
          model: 'string'
        }
      }
    };

    // Convert conversations
    data.conversations.forEach(conv => {
      dataset.data.push({
        text: conv.input,
        response: conv.output,
        intent: conv.intent,
        domain: conv.domain,
        model: conv.model
      });
    });

    return dataset;
  }

  /**
   * Convert to LLaMA fine-tuning format
   */
  convertToLlamaFormat(data) {
    const llamaData = [];

    data.conversations.forEach(conv => {
      llamaData.push({
        instruction: conv.input,
        output: conv.output,
        context: `Domain: ${conv.domain}, Intent: ${conv.intent}`
      });
    });

    return llamaData;
  }

  /**
   * Detect language (simple heuristic)
   */
  detectLanguage(text) {
    // Check for Arabic characters
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text) ? 'ar' : 'en';
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const stats = {
      conversations: 0,
      workflows: 0,
      feedback: 0,
      modelComparisons: 0,
      sessions: this.sessions.size
    };

    this.datasets.forEach((data, type) => {
      stats[type] = data.length;
    });

    return stats;
  }

  /**
   * Clean old data (keep last N days)
   */
  async cleanupOldData(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const types = ['conversations', 'workflows', 'feedback', 'model-outputs'];
    
    for (const type of types) {
      const dir = path.join(this.storageDir, type);
      const files = await fs.readdir(dir);
      
      for (const file of files) {
        const filepath = path.join(dir, file);
        const stats = await fs.stat(filepath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filepath);
          console.log(`🗑️  Deleted old file: ${file}`);
        }
      }
    }
  }
}

module.exports = TrainingDataCollector;
