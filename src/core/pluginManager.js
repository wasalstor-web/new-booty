/**
 * Plugin Manager - مدير الإضافات
 * 
 * نظام إضافات مرن يسمح بإضافة مجالات ووظائف جديدة بسهولة
 * Flexible plugin system to add new domains and functionalities easily
 */
class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
    this.middleware = [];
    
    // Define available hook points
    this.availableHooks = [
      'workflow.before_create',
      'workflow.after_create',
      'workflow.before_update',
      'workflow.after_update',
      'workflow.before_execute',
      'workflow.after_execute',
      'ai.before_analyze',
      'ai.after_analyze',
      'ai.before_generate',
      'ai.after_generate',
      'model.before_switch',
      'model.after_switch',
      'system.startup',
      'system.shutdown'
    ];
    
    this.initializeHooks();
  }

  /**
   * Initialize all hooks
   */
  initializeHooks() {
    this.availableHooks.forEach(hook => {
      this.hooks.set(hook, []);
    });
  }

  /**
   * Register a new plugin
   */
  registerPlugin(name, plugin) {
    if (this.plugins.has(name)) {
      throw new Error(`Plugin ${name} is already registered`);
    }

    // Validate plugin structure
    if (!plugin.name || !plugin.version || !plugin.initialize) {
      throw new Error(`Plugin ${name} is missing required fields: name, version, initialize`);
    }

    this.plugins.set(name, {
      ...plugin,
      enabled: false,
      loadedAt: null
    });

    console.log(`✅ Plugin registered: ${name} v${plugin.version}`);
  }

  /**
   * Enable and initialize a plugin
   */
  async enablePlugin(name, config = {}) {
    const plugin = this.plugins.get(name);
    
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }

    if (plugin.enabled) {
      console.log(`⚠️  Plugin ${name} is already enabled`);
      return;
    }

    try {
      // Initialize plugin
      await plugin.initialize(config, this);
      
      plugin.enabled = true;
      plugin.loadedAt = new Date();
      plugin.config = config;

      console.log(`✅ Plugin enabled: ${name}`);
      
      // Trigger startup hook
      await this.executeHook('system.startup', { pluginName: name });
      
    } catch (error) {
      console.error(`❌ Error enabling plugin ${name}:`, error.message);
      throw error;
    }
  }

  /**
   * Disable a plugin
   */
  async disablePlugin(name) {
    const plugin = this.plugins.get(name);
    
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }

    if (!plugin.enabled) {
      console.log(`⚠️  Plugin ${name} is already disabled`);
      return;
    }

    try {
      // Call shutdown if available
      if (plugin.shutdown) {
        await plugin.shutdown();
      }

      plugin.enabled = false;
      plugin.loadedAt = null;

      console.log(`✅ Plugin disabled: ${name}`);
      
    } catch (error) {
      console.error(`❌ Error disabling plugin ${name}:`, error.message);
      throw error;
    }
  }

  /**
   * Register a hook callback
   */
  registerHook(hookName, callback, priority = 10) {
    if (!this.hooks.has(hookName)) {
      throw new Error(`Hook ${hookName} is not available`);
    }

    this.hooks.get(hookName).push({
      callback,
      priority
    });

    // Sort by priority (lower number = higher priority)
    this.hooks.get(hookName).sort((a, b) => a.priority - b.priority);

    console.log(`🔗 Hook registered: ${hookName}`);
  }

  /**
   * Execute a hook
   */
  async executeHook(hookName, data = {}) {
    if (!this.hooks.has(hookName)) {
      return data;
    }

    const callbacks = this.hooks.get(hookName);
    let result = data;

    for (const { callback } of callbacks) {
      try {
        result = await callback(result) || result;
      } catch (error) {
        console.error(`Error executing hook ${hookName}:`, error.message);
      }
    }

    return result;
  }

  /**
   * Add middleware
   */
  addMiddleware(middleware) {
    this.middleware.push(middleware);
    console.log(`🔧 Middleware added`);
  }

  /**
   * Get all enabled plugins
   */
  getEnabledPlugins() {
    const enabled = [];
    
    this.plugins.forEach((plugin, name) => {
      if (plugin.enabled) {
        enabled.push({
          name,
          version: plugin.version,
          description: plugin.description,
          loadedAt: plugin.loadedAt
        });
      }
    });

    return enabled;
  }

  /**
   * Get plugin by name
   */
  getPlugin(name) {
    return this.plugins.get(name);
  }

  /**
   * Check if plugin exists and is enabled
   */
  isPluginEnabled(name) {
    const plugin = this.plugins.get(name);
    return plugin && plugin.enabled;
  }

  /**
   * Get available hooks
   */
  getAvailableHooks() {
    return this.availableHooks;
  }

  /**
   * Export plugin configuration
   */
  exportConfig() {
    const config = {
      plugins: [],
      hooks: {}
    };

    this.plugins.forEach((plugin, name) => {
      if (plugin.enabled) {
        config.plugins.push({
          name,
          version: plugin.version,
          config: plugin.config
        });
      }
    });

    this.hooks.forEach((callbacks, hookName) => {
      config.hooks[hookName] = callbacks.length;
    });

    return config;
  }
}

module.exports = PluginManager;
