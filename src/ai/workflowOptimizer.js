/**
 * Workflow Optimizer - محسن الـ Workflows
 * Automatically analyzes, optimizes and improves workflows
 */
class WorkflowOptimizer {
  constructor(n8nClient, aiEngine) {
    this.n8nClient = n8nClient;
    this.aiEngine = aiEngine;
    this.optimizationInterval = null;
    this.learningData = [];
  }

  /**
   * Analyze a specific workflow
   */
  async analyzeWorkflow(workflowId) {
    console.log(`📊 Analyzing workflow: ${workflowId}`);
    
    try {
      // Get workflow data
      const workflow = await this.n8nClient.getWorkflow(workflowId);
      
      // Get execution history
      const executions = await this.n8nClient.getExecutions(workflowId);
      
      // Analyze with AI
      const analysis = await this.aiEngine.analyzeWorkflow(workflow);
      
      // Store learning data
      this.learningData.push({
        workflowId,
        timestamp: new Date(),
        analysis,
        executionCount: executions.length
      });
      
      console.log(`✅ Analysis complete for workflow: ${workflow.name}`);
      
      return {
        workflow: workflow.name,
        analysis,
        executionStats: {
          total: executions.length,
          lastExecution: executions[0]?.startedAt || 'Never'
        }
      };
    } catch (error) {
      console.error(`❌ Error analyzing workflow ${workflowId}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate new workflow from description
   */
  async generateWorkflow(description) {
    console.log(`🎨 Generating workflow from description...`);
    
    try {
      // Generate workflow with AI
      const workflowSpec = await this.aiEngine.generateWorkflow(description);
      
      // Create workflow in n8n
      const createdWorkflow = await this.n8nClient.createWorkflow(workflowSpec);
      
      console.log(`✅ Workflow created: ${createdWorkflow.name}`);
      
      return {
        success: true,
        workflow: createdWorkflow,
        message: `تم إنشاء workflow جديد: ${createdWorkflow.name}`
      };
    } catch (error) {
      console.error(`❌ Error generating workflow:`, error.message);
      throw error;
    }
  }

  /**
   * Optimize existing workflow
   */
  async optimizeWorkflow(workflowId) {
    console.log(`⚡ Optimizing workflow: ${workflowId}`);
    
    try {
      // Get current workflow
      const workflow = await this.n8nClient.getWorkflow(workflowId);
      
      // Get execution data
      const executions = await this.n8nClient.getExecutions(workflowId);
      
      // Get AI suggestions
      const optimizations = await this.aiEngine.suggestOptimizations(
        workflow,
        executions.slice(0, 10) // Last 10 executions
      );
      
      console.log(`📝 Optimization suggestions received`);
      console.log(`Suggestions:`, JSON.stringify(optimizations, null, 2));
      
      // Apply optimizations if auto-apply is enabled
      // For now, just return suggestions
      return {
        workflowId,
        workflowName: workflow.name,
        optimizations,
        message: 'تم تحليل الـ workflow وإنشاء اقتراحات التحسين'
      };
    } catch (error) {
      console.error(`❌ Error optimizing workflow:`, error.message);
      throw error;
    }
  }

  /**
   * Start automatic optimization service
   */
  startAutoOptimization(intervalMinutes = 60) {
    console.log(`🤖 Starting auto-optimization service (every ${intervalMinutes} minutes)...`);
    
    if (this.optimizationInterval) {
      console.log(`⚠️  Auto-optimization already running`);
      return;
    }

    this.optimizationInterval = setInterval(async () => {
      try {
        console.log(`\n🔄 Running automatic optimization cycle...`);
        
        // Get all workflows
        const workflows = await this.n8nClient.getWorkflows();
        console.log(`📋 Found ${workflows.length} workflows to analyze`);
        
        // Analyze each workflow
        for (const workflow of workflows) {
          if (workflow.active) {
            try {
              await this.analyzeWorkflow(workflow.id);
              
              // Get executions
              const executions = await this.n8nClient.getExecutions(workflow.id);
              
              // Learn from execution patterns
              if (executions.length > 0) {
                const insights = await this.aiEngine.learnFromExecutions(executions.slice(0, 20));
                console.log(`🧠 Learned insights from ${workflow.name}:`, insights);
              }
            } catch (error) {
              console.error(`⚠️  Error processing workflow ${workflow.name}:`, error.message);
            }
          }
        }
        
        console.log(`✅ Auto-optimization cycle complete\n`);
      } catch (error) {
        console.error(`❌ Error in auto-optimization cycle:`, error.message);
      }
    }, intervalMinutes * 60 * 1000);
    
    console.log(`✅ Auto-optimization service started`);
  }

  /**
   * Stop automatic optimization service
   */
  stopAutoOptimization() {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
      console.log(`🛑 Auto-optimization service stopped`);
    }
  }

  /**
   * Get learning data
   */
  getLearningData() {
    return this.learningData;
  }

  /**
   * Clear learning data
   */
  clearLearningData() {
    this.learningData = [];
    console.log(`🗑️  Learning data cleared`);
  }
}

module.exports = WorkflowOptimizer;
