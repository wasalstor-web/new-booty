/**
 * N8N Orchestrator - منسق n8n
 * 
 * يبني ويدير n8n بالكامل تلقائياً
 * Automatically builds and manages n8n completely
 */
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs').promises;
const path = require('path');

class N8nOrchestrator {
  constructor(modelOrchestrator) {
    this.modelOrchestrator = modelOrchestrator;
    this.n8nInstance = null;
    this.config = {
      port: process.env.N8N_PORT || 5678,
      host: process.env.N8N_HOST || 'localhost',
      protocol: process.env.N8N_PROTOCOL || 'http',
      dataDir: './n8n-data'
    };
    this.isRunning = false;
  }

  /**
   * Build and deploy n8n from scratch
   */
  async buildN8n() {
    console.log('🏗️  Building n8n infrastructure...');

    try {
      // Step 1: Generate docker-compose.yml
      await this.generateDockerCompose();

      // Step 2: Generate n8n configuration
      await this.generateN8nConfig();

      // Step 3: Start n8n
      await this.startN8n();

      // Step 4: Wait for n8n to be ready
      await this.waitForN8n();

      // Step 5: Open n8n in browser
      await this.openInBrowser();

      // Step 6: Setup initial workflows
      await this.setupInitialWorkflows();

      console.log('✅ n8n infrastructure built successfully!');

    } catch (error) {
      console.error('❌ Failed to build n8n:', error.message);
      throw error;
    }
  }

  /**
   * Generate docker-compose.yml dynamically
   */
  async generateDockerCompose() {
    const compose = {
      version: '3.8',
      services: {
        n8n: {
          image: 'n8nio/n8n:latest',
          container_name: 'nexus-n8n',
          restart: 'always',
          ports: [`${this.config.port}:5678`],
          environment: [
            'N8N_BASIC_AUTH_ACTIVE=true',
            'N8N_BASIC_AUTH_USER=admin',
            'N8N_BASIC_AUTH_PASSWORD=admin123',
            `N8N_HOST=${this.config.host}`,
            `N8N_PORT=${this.config.port}`,
            `N8N_PROTOCOL=${this.config.protocol}`,
            `WEBHOOK_URL=${this.config.protocol}://${this.config.host}:${this.config.port}/`,
            'GENERIC_TIMEZONE=Asia/Riyadh',
            'N8N_LOG_LEVEL=info',
            'EXECUTIONS_DATA_SAVE_ON_SUCCESS=all',
            'EXECUTIONS_DATA_SAVE_ON_ERROR=all',
            'N8N_METRICS=true'
          ],
          volumes: [
            `${this.config.dataDir}:/home/node/.n8n`,
            './workflows:/workflows'
          ],
          networks: ['nexus-network']
        }
      },
      networks: {
        'nexus-network': {
          driver: 'bridge'
        }
      }
    };

    // Convert to YAML-like format
    const yaml = this.objectToYaml(compose);
    await fs.writeFile('docker-compose-generated.yml', yaml);
    
    console.log('✅ docker-compose.yml generated');
  }

  /**
   * Generate n8n configuration
   */
  async generateN8nConfig() {
    const config = {
      database: {
        type: 'sqlite',
        tablePrefix: 'nexus_'
      },
      endpoints: {
        rest: 'rest',
        webhook: 'webhook',
        webhookTest: 'webhook-test'
      },
      executions: {
        saveDataOnSuccess: 'all',
        saveDataOnError: 'all',
        saveExecutionProgress: true
      },
      ai: {
        enabled: true,
        models: this.modelOrchestrator.getAllModels()
      }
    };

    await fs.writeFile(
      path.join(this.config.dataDir, 'config.json'),
      JSON.stringify(config, null, 2)
    );

    console.log('✅ n8n configuration generated');
  }

  /**
   * Start n8n using docker-compose
   */
  async startN8n() {
    console.log('🚀 Starting n8n...');

    try {
      const { stdout } = await execPromise('docker-compose -f docker-compose-generated.yml up -d');
      console.log(stdout);
      this.isRunning = true;
      console.log('✅ n8n started');
    } catch (error) {
      throw new Error(`Failed to start n8n: ${error.message}`);
    }
  }

  /**
   * Wait for n8n to be ready
   */
  async waitForN8n(maxAttempts = 30) {
    console.log('⏳ Waiting for n8n to be ready...');

    const axios = require('axios');
    const baseUrl = `${this.config.protocol}://${this.config.host}:${this.config.port}`;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        await axios.get(`${baseUrl}/healthz`);
        console.log('✅ n8n is ready!');
        return true;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    throw new Error('n8n failed to start within timeout');
  }

  /**
   * Open n8n in browser
   */
  async openInBrowser() {
    const url = `${this.config.protocol}://${this.config.host}:${this.config.port}`;
    console.log(`🌐 Opening n8n in browser: ${url}`);

    const { exec } = require('child_process');
    const platform = process.platform;

    try {
      if (platform === 'darwin') {
        // macOS
        exec(`open ${url}`);
      } else if (platform === 'win32') {
        // Windows
        exec(`start ${url}`);
      } else {
        // Linux
        exec(`xdg-open ${url} || gnome-open ${url} || kde-open ${url}`);
      }
      console.log('✅ Browser opened!');
    } catch (error) {
      console.log(`⚠️  Could not open browser automatically. Please open: ${url}`);
    }
  }

  /**
   * Setup initial workflows
   */
  async setupInitialWorkflows() {
    console.log('📋 Setting up initial workflows...');

    // Generate basic workflows using AI
    const workflows = await this.generateDefaultWorkflows();

    for (const workflow of workflows) {
      await this.deployWorkflow(workflow);
    }

    console.log('✅ Initial workflows deployed');
  }

  /**
   * Generate default workflows using AI
   */
  async generateDefaultWorkflows() {
    const workflowDescriptions = [
      'Create a workflow that monitors system health every 5 minutes',
      'Create a workflow that processes incoming webhooks and stores data',
      'Create a workflow that sends daily summary reports'
    ];

    const workflows = [];

    for (const description of workflowDescriptions) {
      try {
        const prompt = `Generate an n8n workflow JSON for: ${description}`;
        const response = await this.modelOrchestrator.call(prompt, {
          model: this.modelOrchestrator.getBestModelForTask('workflow_generation')
        });

        workflows.push(JSON.parse(response.response));
      } catch (error) {
        console.error(`Failed to generate workflow: ${error.message}`);
      }
    }

    return workflows;
  }

  /**
   * Deploy workflow to n8n
   */
  async deployWorkflow(workflow) {
    const axios = require('axios');
    const baseUrl = `${this.config.protocol}://${this.config.host}:${this.config.port}`;

    try {
      await axios.post(
        `${baseUrl}/api/v1/workflows`,
        workflow,
        {
          headers: {
            'X-N8N-API-KEY': process.env.N8N_API_KEY
          }
        }
      );
      console.log(`✅ Workflow deployed: ${workflow.name}`);
    } catch (error) {
      console.error(`Failed to deploy workflow: ${error.message}`);
    }
  }

  /**
   * Auto-scale n8n based on load
   */
  async autoScale(currentLoad) {
    if (currentLoad > 80) {
      console.log('📈 High load detected, scaling up...');
      await this.scaleUp();
    } else if (currentLoad < 20) {
      console.log('📉 Low load detected, scaling down...');
      await this.scaleDown();
    }
  }

  /**
   * Scale up n8n instances
   */
  async scaleUp() {
    try {
      await execPromise('docker-compose -f docker-compose-generated.yml up -d --scale n8n=2');
      console.log('✅ Scaled up');
    } catch (error) {
      console.error('Failed to scale up:', error.message);
    }
  }

  /**
   * Scale down n8n instances
   */
  async scaleDown() {
    try {
      await execPromise('docker-compose -f docker-compose-generated.yml up -d --scale n8n=1');
      console.log('✅ Scaled down');
    } catch (error) {
      console.error('Failed to scale down:', error.message);
    }
  }

  /**
   * Rebuild n8n with new configuration
   */
  async rebuild(newConfig = {}) {
    console.log('🔄 Rebuilding n8n...');

    // Update config
    this.config = { ...this.config, ...newConfig };

    // Stop current instance
    await this.stopN8n();

    // Build with new config
    await this.buildN8n();

    console.log('✅ n8n rebuilt successfully');
  }

  /**
   * Stop n8n
   */
  async stopN8n() {
    try {
      await execPromise('docker-compose -f docker-compose-generated.yml down');
      this.isRunning = false;
      console.log('✅ n8n stopped');
    } catch (error) {
      console.error('Failed to stop n8n:', error.message);
    }
  }

  /**
   * Get n8n status
   */
  async getStatus() {
    try {
      const { stdout } = await execPromise('docker-compose -f docker-compose-generated.yml ps');
      return {
        isRunning: this.isRunning,
        containers: stdout,
        config: this.config
      };
    } catch (error) {
      return {
        isRunning: false,
        error: error.message
      };
    }
  }

  /**
   * Convert object to YAML (simplified)
   */
  objectToYaml(obj, indent = 0) {
    let yaml = '';
    const spaces = '  '.repeat(indent);

    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach(item => {
          if (typeof item === 'object') {
            yaml += `${spaces}- ${this.objectToYaml(item, indent + 1).trim()}\n`;
          } else {
            yaml += `${spaces}- ${item}\n`;
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        yaml += `${spaces}${key}:\n${this.objectToYaml(value, indent + 1)}`;
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }

    return yaml;
  }
}

module.exports = N8nOrchestrator;
