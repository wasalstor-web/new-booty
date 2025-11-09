/**
 * E-Commerce Domain Plugin - إضافة مجال التجارة الإلكترونية
 * 
 * مثال على كيفية إضافة مجال جديد للنظام
 */
module.exports = {
  name: 'ecommerce',
  version: '1.0.0',
  description: 'E-commerce domain support with inventory, orders, and customer management',

  async initialize(config, pluginManager) {
    console.log('🛒 Initializing E-commerce plugin...');

    // Register hooks
    pluginManager.registerHook('workflow.after_create', async (data) => {
      console.log('E-commerce: New workflow created');
      return data;
    });

    // Register e-commerce specific workflows
    this.workflows = [
      {
        name: 'Process New Order',
        description: 'Automatically process incoming orders',
        nodes: [
          { type: 'webhook', name: 'Order Webhook' },
          { type: 'validate', name: 'Validate Order' },
          { type: 'inventory', name: 'Check Inventory' },
          { type: 'payment', name: 'Process Payment' },
          { type: 'notification', name: 'Send Confirmation' }
        ]
      },
      {
        name: 'Inventory Alert',
        description: 'Alert when inventory is low',
        nodes: [
          { type: 'schedule', name: 'Daily Check' },
          { type: 'database', name: 'Query Inventory' },
          { type: 'condition', name: 'Check Threshold' },
          { type: 'email', name: 'Send Alert' }
        ]
      }
    ];

    // AI prompts specific to e-commerce
    this.aiPrompts = {
      analyze: `تحليل workflow للتجارة الإلكترونية:
- تحقق من معالجة الطلبات
- تأكد من إدارة المخزون
- راجع تكامل الدفع
- تحقق من إشعارات العملاء`,
      
      generate: `أنشئ workflow للتجارة الإلكترونية يتضمن:
- استقبال الطلبات
- التحقق من المخزون
- معالجة الدفع
- إرسال إشعارات
- تحديث قاعدة البيانات`
    };

    console.log('✅ E-commerce plugin initialized');
  },

  async shutdown() {
    console.log('🛒 E-commerce plugin shutting down...');
  },

  getWorkflows() {
    return this.workflows;
  },

  getPrompts() {
    return this.aiPrompts;
  }
};
