const TelegramBot = require('node-telegram-bot-api');

/**
 * Telegram Bot Integration - تكامل بوت تليجرام
 * Allows control of the system via Telegram
 */
class TelegramBotService {
  constructor(token, n8nClient, aiEngine, workflowOptimizer, versionControl, permissionManager) {
    this.bot = new TelegramBot(token, { polling: true });
    this.n8nClient = n8nClient;
    this.aiEngine = aiEngine;
    this.workflowOptimizer = workflowOptimizer;
    this.versionControl = versionControl;
    this.permissionManager = permissionManager;
    
    this.setupCommands();
  }

  /**
   * Setup bot commands
   */
  setupCommands() {
    // Start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      
      // Auto-add first user as admin
      if (this.permissionManager.getAllUsers().length === 0) {
        this.permissionManager.addUser(userId, 'admin', {
          name: msg.from.first_name + ' ' + (msg.from.last_name || ''),
          username: msg.from.username
        });
      }
      
      this.bot.sendMessage(chatId, `
🤖 مرحباً بك في Nexus v2.0!
نظام الأتمتة الذكي ذاتي التطوير

👤 دورك: ${this.getUserRole(userId)}

الأوامر المتاحة:
━━━━━━━━━━━━━━━━━
📋 إدارة Workflows:
/workflows - عرض جميع الـ workflows
/analyze [id] - تحليل workflow معين
/generate [وصف] - إنشاء workflow جديد
/optimize [id] - تحسين workflow

🔄 التحكم في الإصدارات:
/history [id] - عرض تاريخ التعديلات
/rollback [id] [steps] - الرجوع لإصدار سابق
/compare [id] [v1] [v2] - مقارنة إصدارين

🔐 إدارة الصلاحيات (للمدراء):
/users - عرض المستخدمين
/adduser [id] [role] - إضافة مستخدم
/myrole - عرض صلاحياتك

📊 النظام:
/status - حالة النظام
/help - المساعدة
      `);
    });

    // Help command
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, `
📚 دليل الاستخدام التفصيلي:

🎯 أوامر Workflows:
• /workflows - يعرض قائمة بجميع الـ workflows
• /analyze 123 - يحلل الـ workflow رقم 123
• /generate إنشاء workflow لإرسال بريد يومي
• /optimize 123 - يحسن الـ workflow رقم 123

🔄 أوامر Version Control:
• /history 123 - يعرض سجل تعديلات workflow 123
• /rollback 123 - يرجع لآخر إصدار
• /rollback 123 3 - يرجع 3 إصدارات للوراء
• /compare 123 1 2 - يقارن بين إصدارين

🔐 أوامر الصلاحيات:
• /myrole - يعرض صلاحياتك الحالية
• /users - يعرض جميع المستخدمين (للمدراء)
• /adduser 123456 developer - يضيف مستخدم بدور developer

الأدوار المتاحة:
• admin - صلاحيات كاملة
• developer - إنشاء وتعديل workflows
• operator - تشغيل workflows فقط
• viewer - مشاهدة فقط
      `);
    });

    // Workflows command
    this.bot.onText(/\/workflows/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      
      try {
        this.permissionManager.requirePermission(userId, 'workflow.read');
        
        const workflows = await this.n8nClient.getWorkflows();
        let message = `📋 الـ Workflows (${workflows.length}):\n\n`;
        
        workflows.forEach(workflow => {
          const status = workflow.active ? '✅' : '⭕';
          message += `${status} ${workflow.name} (ID: ${workflow.id})\n`;
        });
        
        this.bot.sendMessage(chatId, message);
      } catch (error) {
        this.bot.sendMessage(chatId, `❌ ${error.message}`);
      }
    });

    // Analyze command
    this.bot.onText(/\/analyze (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      const workflowId = match[1];
      
      try {
        this.permissionManager.requirePermission(userId, 'ai.analyze');
        
        this.bot.sendMessage(chatId, '🔍 جاري التحليل...');
        const analysis = await this.workflowOptimizer.analyzeWorkflow(workflowId);
        
        this.bot.sendMessage(chatId, `
📊 تحليل الـ Workflow: ${analysis.workflow}

${JSON.stringify(analysis.analysis, null, 2)}

📈 إحصائيات التنفيذ:
- إجمالي التنفيذات: ${analysis.executionStats.total}
- آخر تنفيذ: ${analysis.executionStats.lastExecution}
        `);
      } catch (error) {
        this.bot.sendMessage(chatId, `❌ ${error.message}`);
      }
    });

    // Generate command
    this.bot.onText(/\/generate (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      const description = match[1];
      
      try {
        this.permissionManager.requirePermission(userId, 'workflow.create');
        
        this.bot.sendMessage(chatId, '🎨 جاري إنشاء الـ workflow...');
        const result = await this.workflowOptimizer.generateWorkflow(description);
        
        // Save version
        if (result.workflow && result.workflow.id) {
          await this.versionControl.saveVersion(
            result.workflow.id,
            result.workflow,
            { userId, description: 'Created via Telegram' }
          );
        }
        
        this.bot.sendMessage(chatId, `
✅ ${result.message}

ID: ${result.workflow.id}
الاسم: ${result.workflow.name}
        `);
      } catch (error) {
        this.bot.sendMessage(chatId, `❌ ${error.message}`);
      }
    });

    // History command
    this.bot.onText(/\/history (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      const workflowId = match[1];
      
      try {
        this.permissionManager.requirePermission(userId, 'workflow.read');
        
        const history = await this.versionControl.getHistory(workflowId);
        
        let message = `📜 سجل التعديلات - Workflow ${workflowId}\n\n`;
        
        history.forEach(v => {
          const current = v.isCurrent ? ' 👈 الحالي' : '';
          message += `📌 الإصدار ${v.version}${current}\n`;
          message += `   📅 ${new Date(v.timestamp).toLocaleString('ar-SA')}\n`;
          message += `   📝 ${v.description}\n`;
          message += `   👤 ${v.userId}\n\n`;
        });
        
        this.bot.sendMessage(chatId, message);
      } catch (error) {
        this.bot.sendMessage(chatId, `❌ ${error.message}`);
      }
    });

    // Rollback command
    this.bot.onText(/\/rollback (\S+)\s*(\d*)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      const workflowId = match[1];
      const steps = parseInt(match[2] || '1');
      
      try {
        this.permissionManager.requirePermission(userId, 'workflow.update');
        
        this.bot.sendMessage(chatId, '🔄 جاري التراجع...');
        
        const result = await this.versionControl.rollback(workflowId, steps);
        
        // Apply to n8n
        await this.n8nClient.updateWorkflow(workflowId, result.workflowData);
        
        this.bot.sendMessage(chatId, `
✅ ${result.message}

🔙 تم الرجوع ${steps} إصدار للوراء
📝 الوصف: ${result.version.metadata.description}
        `);
      } catch (error) {
        this.bot.sendMessage(chatId, `❌ ${error.message}`);
      }
    });

    // My role command
    this.bot.onText(/\/myrole/, (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      
      const userInfo = this.permissionManager.getUserInfo(userId);
      
      if (!userInfo) {
        this.bot.sendMessage(chatId, `
⛔ أنت غير مصرح لاستخدام هذا النظام

يرجى التواصل مع المدير للحصول على صلاحيات.
        `);
        return;
      }
      
      let message = `
👤 معلوماتك في النظام:

🆔 ID: ${userInfo.userId}
👔 الدور: ${userInfo.roleName}
📅 تاريخ الإضافة: ${new Date(userInfo.addedAt).toLocaleString('ar-SA')}

📋 صلاحياتك:
`;
      
      userInfo.permissions.forEach(p => {
        message += `  ✓ ${p}\n`;
      });
      
      this.bot.sendMessage(chatId, message);
    });

    // Users command (admin only)
    this.bot.onText(/\/users/, (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      
      try {
        this.permissionManager.requirePermission(userId, '*');
        
        const users = this.permissionManager.getAllUsers();
        
        let message = `👥 المستخدمون (${users.length}):\n\n`;
        
        users.forEach(user => {
          message += `━━━━━━━━━━━━━━━━━\n`;
          message += `🆔 ${user.userId}\n`;
          message += `👔 ${user.roleName}\n`;
          message += `📅 ${new Date(user.addedAt).toLocaleString('ar-SA')}\n\n`;
        });
        
        this.bot.sendMessage(chatId, message);
      } catch (error) {
        this.bot.sendMessage(chatId, `❌ ${error.message}`);
      }
    });

    // Status command
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      
      try {
        this.permissionManager.requirePermission(userId, 'workflow.read');
        
        const workflows = await this.n8nClient.getWorkflows();
        const activeWorkflows = workflows.filter(w => w.active).length;
        const learningData = this.workflowOptimizer.getLearningData();
        const users = this.permissionManager.getAllUsers();
        
        this.bot.sendMessage(chatId, `
📊 حالة النظام - Nexus v2.0:

✅ النظام يعمل بشكل طبيعي

📈 الإحصائيات:
━━━━━━━━━━━━━━━━━
• إجمالي الـ Workflows: ${workflows.length}
• الـ Workflows النشطة: ${activeWorkflows}
• عمليات التحليل: ${learningData.length}
• المستخدمون: ${users.length}

⚙️ الإعدادات:
━━━━━━━━━━━━━━━━━
• 🤖 AI Model: ${process.env.AI_MODEL}
• ⚡ n8n: ${process.env.N8N_PROTOCOL}://${process.env.N8N_HOST}:${process.env.N8N_PORT}
• 🔐 Permission System: ✅
• 📝 Version Control: ✅
• 🔙 Rollback Support: ✅
        `);
      } catch (error) {
        this.bot.sendMessage(chatId, `❌ ${error.message}`);
      }
    });

    console.log('✅ Telegram Bot commands setup complete');
  }

  /**
   * Get user role name
   */
  getUserRole(userId) {
    const userInfo = this.permissionManager.getUserInfo(userId);
    return userInfo ? userInfo.roleName : 'غير مصرح';
  }

  /**
   * Send notification
   */
  async sendNotification(chatId, message) {
    try {
      await this.bot.sendMessage(chatId, message);
    } catch (error) {
      console.error('Error sending notification:', error.message);
    }
  }
}

module.exports = TelegramBotService;
