const axios = require('axios');

/**
 * n8n Client - للتواصل مع n8n API
 * Handles all communication with n8n API
 */
class N8nClient {
  constructor(config) {
    this.baseURL = `${config.protocol}://${config.host}:${config.port}/api/v1`;
    this.apiKey = config.apiKey;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Get all workflows
   */
  async getWorkflows() {
    try {
      const response = await this.client.get('/workflows');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching workflows:', error.message);
      throw error;
    }
  }

  /**
   * Get specific workflow by ID
   */
  async getWorkflow(workflowId) {
    try {
      const response = await this.client.get(`/workflows/${workflowId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching workflow ${workflowId}:`, error.message);
      throw error;
    }
  }

  /**
   * Create new workflow
   */
  async createWorkflow(workflowData) {
    try {
      const response = await this.client.post('/workflows', workflowData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating workflow:', error.message);
      throw error;
    }
  }

  /**
   * Update existing workflow
   */
  async updateWorkflow(workflowId, workflowData) {
    try {
      const response = await this.client.patch(`/workflows/${workflowId}`, workflowData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating workflow ${workflowId}:`, error.message);
      throw error;
    }
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId) {
    try {
      await this.client.delete(`/workflows/${workflowId}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting workflow ${workflowId}:`, error.message);
      throw error;
    }
  }

  /**
   * Activate workflow
   */
  async activateWorkflow(workflowId) {
    try {
      const workflow = await this.getWorkflow(workflowId);
      workflow.active = true;
      return await this.updateWorkflow(workflowId, workflow);
    } catch (error) {
      console.error(`Error activating workflow ${workflowId}:`, error.message);
      throw error;
    }
  }

  /**
   * Deactivate workflow
   */
  async deactivateWorkflow(workflowId) {
    try {
      const workflow = await this.getWorkflow(workflowId);
      workflow.active = false;
      return await this.updateWorkflow(workflowId, workflow);
    } catch (error) {
      console.error(`Error deactivating workflow ${workflowId}:`, error.message);
      throw error;
    }
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(workflowId, data = {}) {
    try {
      const response = await this.client.post(`/workflows/${workflowId}/execute`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error executing workflow ${workflowId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get workflow executions
   */
  async getExecutions(workflowId) {
    try {
      const response = await this.client.get(`/executions`, {
        params: { workflowId }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching executions for workflow ${workflowId}:`, error.message);
      throw error;
    }
  }
}

module.exports = N8nClient;
