# ✅ دليل التشغيل السريع / Quick Start Guide

<div dir="rtl">

## 🚀 التشغيل السريع (5 دقائق)

### 1️⃣ التأكد من المتطلبات

```bash
# تشغيل الاختبار الشامل
node test-integration.js
```

**يجب أن ترى:**
- ✅ Node.js version
- ✅ Dependencies
- ✅ Core modules
- ✅ Docker

### 2️⃣ إعداد ملف البيئة

```bash
# نسخ ملف البيئة
cp .env.example .env

# تعديل المفاتيح في .env
nano .env
```

**أضف المفاتيح:**
```env
N8N_API_KEY=your_n8n_api_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 3️⃣ تشغيل n8n

```bash
# تشغيل n8n
bash scripts/start-n8n.sh
```

**انتظر حتى ترى:**
```
✅ n8n is running!
📍 Access n8n at: http://localhost:5678
👤 Username: admin
🔑 Password: admin123
```

### 4️⃣ الدخول إلى n8n

افتح المتصفح على: **http://localhost:5678**

**بيانات الدخول:**
- Username: `admin`
- Password: `admin123`

### 5️⃣ استيراد Workflow

في واجهة n8n:
1. اذهب إلى **Workflows**
2. اضغط **Import from File**
3. اختر: `workflows/nexus-self-development.json`
4. اضبط الـ credentials:
   - Telegram API
   - OpenAI API
   - n8n API Key
5. اضغط **Activate**

### 6️⃣ تشغيل النظام

```bash
# النظام v2.0 (المستقر)
npm start

# أو النظام v3.0 (البنية التحتية المتقدمة)
npm run start:v3
```

**يجب أن ترى:**
```
✅ Nexus جاهز! / Ready!
📊 Server: http://localhost:3000
🤖 Model Orchestrator - تبديل بين النماذج
🔌 Plugin System - نظام الإضافات
🌍 Domain Adapter - دعم أي مجال
```

### 7️⃣ اختبار النظام

```bash
# اختبار Health Check
curl http://localhost:3000/health

# اختبار API
curl -X POST http://localhost:3000/api/models \
  -H "Content-Type: application/json"
```

---

## 🧪 التحقق من التكامل

### ✅ n8n يعمل؟
```bash
# فحص حالة n8n
curl http://localhost:5678/healthz

# أو
docker logs nexus-n8n
```

### ✅ API يعمل؟
```bash
# فحص API
curl http://localhost:3000/health

# النتيجة المتوقعة:
{
  "status": "healthy",
  "version": "3.0.0",
  "features": {
    "modelOrchestration": true,
    "pluginSystem": true,
    ...
  }
}
```

### ✅ Telegram Bot يعمل؟
```
أرسل رسالة للبوت على التليجرام:
/start

يجب أن يرد بقائمة الأوامر
```

---

## 🔧 استكشاف الأخطاء

### ❌ n8n لا يبدأ

```bash
# فحص سجلات Docker
docker logs nexus-n8n

# إعادة التشغيل
docker restart nexus-n8n
```

### ❌ النظام لا يبدأ

```bash
# فحص المتطلبات
node test-integration.js

# تثبيت الحزم مرة أخرى
npm install

# مسح cache
rm -rf node_modules package-lock.json
npm install
```

### ❌ مشكلة في البيئة

```bash
# تأكد من وجود .env
ls -la .env

# تأكد من المفاتيح
cat .env | grep -E "API_KEY|TOKEN"
```

---

## 📚 الأوامر المفيدة

```bash
# تشغيل الاختبارات
node test-integration.js

# تشغيل النظام v2.0
npm start

# تشغيل النظام v3.0
npm run start:v3

# تطوير مع إعادة تشغيل تلقائي
npm run dev

# تشغيل n8n
bash scripts/start-n8n.sh

# إيقاف n8n
docker stop nexus-n8n

# إزالة n8n
docker rm -f nexus-n8n

# فحص سجلات n8n
docker logs -f nexus-n8n

# النشر على Hostinger
npm run deploy
```

---

## 📊 التحقق النهائي

قبل الاستخدام، تأكد من:

- [x] ✅ Node.js مثبت (>= 18.0.0)
- [x] ✅ Docker مثبت ويعمل
- [x] ✅ المفاتيح موجودة في .env
- [x] ✅ n8n يعمل على http://localhost:5678
- [x] ✅ API يعمل على http://localhost:3000
- [x] ✅ Telegram Bot يرد على الرسائل
- [x] ✅ Workflow مستورد ونشط

---

## 🎯 الخطوات التالية

1. **جرب الأوامر الأساسية** على Telegram:
   - `/workflows` - عرض workflows
   - `/status` - حالة النظام
   - `/generate أنشئ workflow لإدارة المهام`

2. **استكشف البنية الجديدة** (v3.0):
   - Model Orchestrator
   - Plugin System
   - Domain Adapter
   - Training Data Collector

3. **أضف مجال جديد**:
   - تفعيل إضافة (healthcare, ecommerce)
   - إنشاء إضافة مخصصة

4. **درب نموذج محلي**:
   - جمع البيانات
   - تصدير للتدريب
   - إضافة نموذج مدرب

---

## 🆘 الدعم

إذا واجهت مشكلة:

1. شغل الاختبار: `node test-integration.js`
2. افحص السجلات: `docker logs nexus-n8n`
3. اقرأ التوثيق: `README.md` و `ARCHITECTURE.md`
4. افتح Issue على GitHub

---

<div align="center">

**🎉 مبروك! النظام جاهز للاستخدام**

**Congratulations! System is Ready to Use**

</div>

</div>
