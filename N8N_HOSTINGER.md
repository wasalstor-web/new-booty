# 🔗 ربط Nexus بـ n8n على Hostinger VPS

## إذا كان n8n مرفوع مسبقاً على Hostinger

### 1. إعداد ملف .env

```bash
# n8n Configuration (External - على Hostinger)
N8N_EXTERNAL=true
N8N_URL=https://your-domain.com
N8N_API_KEY=your_n8n_api_key

# أو إذا كان IP مباشر
N8N_URL=http://your-vps-ip:5678
N8N_API_KEY=your_n8n_api_key

# باقي الإعدادات
TELEGRAM_BOT_TOKEN=your_token
OPENAI_API_KEY=your_key
```

### 2. الحصول على N8N API Key

في n8n على Hostinger:
1. افتح n8n: `https://your-domain.com`
2. اذهب إلى **Settings** → **API**
3. انسخ الـ **API Key**
4. ضعه في `.env` كـ `N8N_API_KEY`

### 3. تشغيل النظام

```bash
# تشغيل Nexus
npm run start:v3

# سيتصل تلقائياً بـ n8n على Hostinger
```

### 4. التحقق من الاتصال

```bash
# اختبار الاتصال
curl http://localhost:3000/api/n8n/ui-url

# النتيجة:
{
  "success": true,
  "url": "https://your-domain.com",
  "isExternal": true
}
```

---

## ماذا يحدث تلقائياً؟

### عند التشغيل:

1. **يتصل بـ n8n** على Hostinger
2. **يربط جميع النماذج** - كل نموذج AI يصبح workflow في n8n
3. **يربط جميع الإضافات** - workflows للتجارة، الصحة، إلخ
4. **ينشئ workflows للتطوير الذاتي**:
   - تحليل وتحسين workflows كل 6 ساعات
   - إنشاء workflows جديدة تلقائياً
   - مراقبة الأداء وتبديل النماذج كل 30 دقيقة

### Workflows التي تُنشأ في n8n:

#### 1. لكل نموذج AI:
```
Webhook → Execute Model → Respond
```
- **URL**: `https://your-domain.com/webhook/ai-model-gpt-4`
- **يستقبل**: `{ "prompt": "your prompt", "options": {} }`
- **يُرجع**: نتيجة النموذج

#### 2. للمجالات:
```
Webhook → Activate Domain → Respond
```
- **URL**: `https://your-domain.com/webhook/domain-ecommerce`
- **يفعل**: مجال التجارة الإلكترونية

#### 3. التطوير الذاتي:
```
🧠 Self-Analysis & Optimization
Schedule (كل 6 ساعات) → Get All Workflows → Analyze → Apply Optimizations
```

```
🚀 Auto-Create New Workflows
Webhook → Generate with AI → Create in n8n
```

```
📊 Monitor & Switch Models
Schedule (كل 30 دقيقة) → Analyze Performance → Switch to Best Model
```

---

## استخدام عبر Telegram

```
/workflows - عرض جميع workflows في n8n
/analyze 123 - تحليل workflow بالـ AI
/generate أنشئ workflow للمبيعات - إنشاء workflow جديد
/optimize 123 - تحسين workflow
```

---

## استخدام عبر API

### 1. الحصول على قائمة التكاملات

```bash
curl http://localhost:3000/api/n8n/integrations
```

**النتيجة:**
```json
{
  "success": true,
  "integrations": [
    {
      "key": "model-gpt-4",
      "type": "model",
      "workflowId": "1",
      "webhookUrl": "https://your-domain.com/webhook/ai-model-gpt-4"
    },
    {
      "key": "model-llama-2-7b",
      "type": "model",
      "workflowId": "2",
      "webhookUrl": "https://your-domain.com/webhook/ai-model-llama-2-7b"
    }
  ],
  "n8nUrl": "https://your-domain.com"
}
```

### 2. استدعاء نموذج عبر n8n

```bash
curl -X POST https://your-domain.com/webhook/ai-model-gpt-4 \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "اشرح لي الذكاء الاصطناعي",
    "options": {
      "temperature": 0.7
    }
  }'
```

### 3. إنشاء workflow جديد تلقائياً

```bash
curl -X POST https://your-domain.com/webhook/auto-create-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "description": "أنشئ workflow لإرسال إشعارات يومية"
  }'
```

---

## المميزات

### ✅ n8n يطور نفسه:
- يحلل workflows الموجودة كل 6 ساعات
- يطبق تحسينات تلقائية
- ينشئ workflows جديدة حسب الحاجة

### ✅ جميع النماذج في n8n:
- GPT-4 → webhook في n8n
- Llama 2 → webhook في n8n  
- Mistral → webhook في n8n

### ✅ جميع الإضافات في n8n:
- E-commerce workflows
- Healthcare workflows
- Custom domain workflows

### ✅ تبديل ذكي:
- يراقب أداء النماذج
- يختار الأفضل تلقائياً
- يبدل كل 30 دقيقة

---

## مثال عملي

### السيناريو: نظام تجارة إلكترونية

```bash
# 1. تفعيل مجال التجارة
curl -X POST https://your-domain.com/webhook/domain-ecommerce \
  -d '{"userId": "admin"}'

# 2. إنشاء workflow لمعالجة الطلبات
curl -X POST https://your-domain.com/webhook/auto-create-workflow \
  -d '{
    "description": "معالجة الطلبات الجديدة: التحقق من المخزون → معالجة الدفع → إرسال تأكيد"
  }'

# 3. النظام ينشئ workflow تلقائياً في n8n
# 4. workflow يعمل فوراً
# 5. يتحسن تلقائياً كل 6 ساعات
```

---

## استكشاف الأخطاء

### ❌ لا يتصل بـ n8n

```bash
# تأكد من الإعدادات
cat .env | grep N8N

# اختبر الاتصال يدوياً
curl -H "X-N8N-API-KEY: your_key" \
  https://your-domain.com/api/v1/workflows
```

### ❌ API Key غير صحيح

1. افتح n8n
2. Settings → API
3. انسخ key جديد
4. حدّث `.env`

### ❌ workflows لا تُنشأ

```bash
# تحقق من السجلات
npm run start:v3

# ابحث عن:
# ✅ Connected to n8n successfully!
# 🔗 Connecting all components to n8n...
```

---

## الخلاصة

### قبل:
```
Nexus → OpenAI API
      → Llama Local
      → Mistral Local
```

### بعد:
```
Nexus → n8n (على Hostinger VPS)
          ↓
        [كل النماذج workflows]
        [كل الإضافات workflows]  
        [التطوير الذاتي workflows]
          ↓
        يعمل ويتطور تلقائياً!
```

**n8n الآن هو المركز الأساسي للنظام! 🎯**
