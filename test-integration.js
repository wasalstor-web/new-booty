#!/usr/bin/env node
/**
 * Integration Test - اختبار التكامل الشامل
 * 
 * يختبر جميع المكونات للتأكد من أن النظام يعمل بشكل صحيح
 */

require('dotenv').config();

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🧪 Nexus Integration Test                              ║
║   اختبار التكامل الشامل                                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

async function runTests() {
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  // Test 1: Check Node.js version
  console.log('\n📋 Test 1: Node.js Version');
  try {
    const version = process.version;
    const major = parseInt(version.split('.')[0].substring(1));
    
    if (major >= 18) {
      console.log(`✅ Node.js ${version} (OK)`);
      results.passed.push('Node.js version');
    } else {
      console.log(`❌ Node.js ${version} (Need >= 18.0.0)`);
      results.failed.push('Node.js version');
    }
  } catch (error) {
    console.log(`❌ Error checking Node.js: ${error.message}`);
    results.failed.push('Node.js version');
  }

  // Test 2: Check dependencies
  console.log('\n📦 Test 2: Dependencies');
  try {
    require('express');
    require('axios');
    require('dotenv');
    require('openai');
    console.log('✅ All core dependencies installed');
    results.passed.push('Dependencies');
  } catch (error) {
    console.log(`❌ Missing dependencies: ${error.message}`);
    results.failed.push('Dependencies');
  }

  // Test 3: Check environment variables
  console.log('\n🔑 Test 3: Environment Variables');
  const requiredEnvVars = [
    'N8N_API_KEY',
    'TELEGRAM_BOT_TOKEN',
    'OPENAI_API_KEY'
  ];

  let envOK = true;
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: Set`);
    } else {
      console.log(`⚠️  ${envVar}: Not set`);
      results.warnings.push(`${envVar} not set`);
      envOK = false;
    }
  }

  if (envOK) {
    results.passed.push('Environment variables');
  } else {
    results.warnings.push('Some environment variables missing');
  }

  // Test 4: Check core modules
  console.log('\n🧩 Test 4: Core Modules');
  const modules = [
    './src/core/pluginManager',
    './src/core/domainAdapter',
    './src/core/trainingDataCollector',
    './src/orchestrator/modelOrchestrator',
    './src/orchestrator/n8nOrchestrator',
    './src/n8n/n8nClient',
    './src/ai/aiEngine',
    './src/utils/versionControl',
    './src/utils/permissionManager'
  ];

  let modulesOK = true;
  for (const mod of modules) {
    try {
      require(mod);
      console.log(`✅ ${mod.split('/').pop()}`);
    } catch (error) {
      console.log(`❌ ${mod.split('/').pop()}: ${error.message}`);
      results.failed.push(mod);
      modulesOK = false;
    }
  }

  if (modulesOK) {
    results.passed.push('Core modules');
  } else {
    results.failed.push('Core modules');
  }

  // Test 5: Check plugins
  console.log('\n🔌 Test 5: Plugins');
  const plugins = [
    './src/plugins/ecommerce.plugin',
    './src/plugins/healthcare.plugin',
    './src/plugins/localModels.plugin'
  ];

  let pluginsOK = true;
  for (const plugin of plugins) {
    try {
      const p = require(plugin);
      if (p.name && p.version && p.initialize) {
        console.log(`✅ ${p.name} v${p.version}`);
      } else {
        console.log(`⚠️  ${plugin}: Missing required fields`);
        pluginsOK = false;
      }
    } catch (error) {
      console.log(`❌ ${plugin}: ${error.message}`);
      results.failed.push(plugin);
      pluginsOK = false;
    }
  }

  if (pluginsOK) {
    results.passed.push('Plugins');
  } else {
    results.warnings.push('Some plugins have issues');
  }

  // Test 6: Test ModelOrchestrator
  console.log('\n🤖 Test 6: Model Orchestrator');
  try {
    const ModelOrchestrator = require('./src/orchestrator/modelOrchestrator');
    const orchestrator = new ModelOrchestrator();
    
    // Register a test model
    orchestrator.registerModel({
      name: 'test-model',
      provider: 'test',
      type: 'api',
      endpoint: 'http://localhost',
      capabilities: ['test'],
      priority: 10,
      costPerToken: 0
    });

    const models = orchestrator.getAllModels();
    if (models.length > 0) {
      console.log(`✅ Model Orchestrator working (${models.length} model registered)`);
      results.passed.push('Model Orchestrator');
    } else {
      console.log('⚠️  Model Orchestrator: No models registered');
      results.warnings.push('Model Orchestrator');
    }
  } catch (error) {
    console.log(`❌ Model Orchestrator: ${error.message}`);
    results.failed.push('Model Orchestrator');
  }

  // Test 7: Test PluginManager
  console.log('\n🔌 Test 7: Plugin Manager');
  try {
    const PluginManager = require('./src/core/pluginManager');
    const manager = new PluginManager();
    
    const testPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
      initialize: async () => {}
    };

    manager.registerPlugin('test', testPlugin);
    
    if (manager.getPlugin('test')) {
      console.log('✅ Plugin Manager working');
      results.passed.push('Plugin Manager');
    } else {
      console.log('❌ Plugin Manager: Failed to register plugin');
      results.failed.push('Plugin Manager');
    }
  } catch (error) {
    console.log(`❌ Plugin Manager: ${error.message}`);
    results.failed.push('Plugin Manager');
  }

  // Test 8: Test DomainAdapter
  console.log('\n🌍 Test 8: Domain Adapter');
  try {
    const DomainAdapter = require('./src/core/domainAdapter');
    const adapter = new DomainAdapter();
    
    adapter.registerDomain({
      name: 'test-domain',
      displayName: 'Test Domain'
    });

    const domains = adapter.getAllDomains();
    if (domains.length > 0) {
      console.log(`✅ Domain Adapter working (${domains.length} domain registered)`);
      results.passed.push('Domain Adapter');
    } else {
      console.log('❌ Domain Adapter: Failed to register domain');
      results.failed.push('Domain Adapter');
    }
  } catch (error) {
    console.log(`❌ Domain Adapter: ${error.message}`);
    results.failed.push('Domain Adapter');
  }

  // Test 9: Check Docker
  console.log('\n🐳 Test 9: Docker');
  try {
    const { execSync } = require('child_process');
    const dockerVersion = execSync('docker --version', { encoding: 'utf-8' });
    console.log(`✅ Docker installed: ${dockerVersion.trim()}`);
    results.passed.push('Docker');
  } catch (error) {
    console.log('⚠️  Docker not found (needed for n8n)');
    results.warnings.push('Docker not installed');
  }

  // Test 10: Check docker-compose
  console.log('\n🐳 Test 10: Docker Compose');
  try {
    const { execSync } = require('child_process');
    const composeVersion = execSync('docker-compose --version', { encoding: 'utf-8' });
    console.log(`✅ Docker Compose installed: ${composeVersion.trim()}`);
    results.passed.push('Docker Compose');
  } catch (error) {
    console.log('⚠️  Docker Compose not found (needed for n8n)');
    results.warnings.push('Docker Compose not installed');
  }

  // Print summary
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   📊 Test Summary / ملخص الاختبار                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

✅ Passed: ${results.passed.length}
${results.passed.map(t => `   • ${t}`).join('\n')}

${results.warnings.length > 0 ? `
⚠️  Warnings: ${results.warnings.length}
${results.warnings.map(t => `   • ${t}`).join('\n')}
` : ''}

${results.failed.length > 0 ? `
❌ Failed: ${results.failed.length}
${results.failed.map(t => `   • ${t}`).join('\n')}
` : ''}

${results.failed.length === 0 ? `
🎉 All critical tests passed!
   النظام جاهز للاستخدام!
` : `
⚠️  Some tests failed. Please fix the issues above.
   يرجى إصلاح المشاكل أعلاه.
`}
  `);

  return results.failed.length === 0;
}

// Run tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
