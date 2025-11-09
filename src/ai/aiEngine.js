const OpenAI = require('openai');

/**
 * AI Engine - محرك الذكاء الاصطناعي
 * Handles all AI operations for workflow analysis and generation
 */
class AIEngine {
  constructor(config) {
    this.client = new OpenAI({
      apiKey: config.apiKey
    });
    this.model = config.model || 'gpt-4';
  }

  /**
   * Analyze workflow and provide insights
   */
  async analyzeWorkflow(workflow) {
    try {
      const prompt = `
قم بتحليل هذا الـ workflow من n8n وقدم تحليل شامل:

اسم الـ Workflow: ${workflow.name}
عدد العقد (Nodes): ${workflow.nodes?.length || 0}
الحالة: ${workflow.active ? 'نشط' : 'غير نشط'}

تفاصيل العقد:
${JSON.stringify(workflow.nodes, null, 2)}

قدم التحليل التالي:
1. الغرض الرئيسي من الـ workflow
2. نقاط القوة
3. نقاط الضعف أو المشاكل المحتملة
4. اقتراحات للتحسين
5. فرص الأتمتة الإضافية

أجب بصيغة JSON منظمة.
`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'أنت خبير في تحليل وتطوير أنظمة الأتمتة باستخدام n8n. You are an expert in analyzing and developing automation systems using n8n.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing workflow:', error.message);
      throw error;
    }
  }

  /**
   * Generate workflow based on description
   */
  async generateWorkflow(description) {
    try {
      const prompt = `
أنشئ workflow لـ n8n بناءً على الوصف التالي:

الوصف: ${description}

قم بإنشاء workflow كامل بصيغة JSON يتضمن:
1. اسم مناسب للـ workflow
2. العقد (nodes) المطلوبة مع الإعدادات
3. الروابط (connections) بين العقد
4. الإعدادات المناسبة لكل عقدة

تأكد أن الـ workflow قابل للتنفيذ مباشرة في n8n.
`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'أنت خبير في تصميم وإنشاء workflows لـ n8n. You are an expert in designing and creating n8n workflows.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error generating workflow:', error.message);
      throw error;
    }
  }

  /**
   * Suggest optimizations for workflow
   */
  async suggestOptimizations(workflow, executionData) {
    try {
      const prompt = `
قم بتحليل أداء هذا الـ workflow واقترح تحسينات:

الـ Workflow:
${JSON.stringify(workflow, null, 2)}

بيانات التنفيذ الأخيرة:
${JSON.stringify(executionData, null, 2)}

اقترح:
1. تحسينات في الأداء
2. تقليل استهلاك الموارد
3. تحسين موثوقية التنفيذ
4. إضافة معالجة للأخطاء
5. أفكار جديدة للأتمتة

قدم الاقتراحات بصيغة JSON قابلة للتطبيق.
`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'أنت خبير في تحسين أداء workflows وأتمتة العمليات. You are an expert in optimizing workflow performance and automation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error suggesting optimizations:', error.message);
      throw error;
    }
  }

  /**
   * Learn from execution patterns
   */
  async learnFromExecutions(executions) {
    try {
      const prompt = `
قم بتحليل أنماط التنفيذ التالية وتعلم منها:

${JSON.stringify(executions, null, 2)}

حدد:
1. الأنماط المتكررة
2. المشاكل الشائعة
3. فرص التحسين
4. توصيات للمستقبل

أجب بصيغة JSON.
`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'أنت نظام AI ذكي يتعلم من البيانات ويحسن نفسه. You are an intelligent AI system that learns from data and improves itself.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error learning from executions:', error.message);
      throw error;
    }
  }
}

module.exports = AIEngine;
