# 🚀 دليل الإعداد الشامل - Nexus v3.0 Complete Setup Guide

<div dir="rtl">

## 📋 المحتويات

1. [المتطلبات الأساسية](#المتطلبات-الأساسية)
2. [الإعداد السريع (موصى به)](#الإعداد-السريع)
3. [الإعداد اليدوي](#الإعداد-اليدوي)
4. [الحصول على المفاتيح المطلوبة](#الحصول-على-المفاتيح)
5. [استكشاف الأخطاء](#استكشاف-الأخطاء)
6. [الأسئلة الشائعة](#الأسئلة-الشائعة)

---

## 🔧 المتطلبات الأساسية

### 1. البرامج المطلوبة

| البرنامج | الإصدار المطلوب | إلزامي؟ | رابط التحميل |
|---------|----------------|---------|--------------|
| **Node.js** | v18 أو أحدث | ✅ نعم | [nodejs.org](https://nodejs.org) |
| **npm** | يأتي مع Node.js | ✅ نعم | - |
| **Docker** | أحدث إصدار | ⚠️ اختياري* | [docker.com](https://docs.docker.com/get-docker/) |
| **Git** | أي إصدار | ✅ نعم | [git-scm.com](https://git-scm.com) |

*Docker مطلوب فقط إذا كنت تريد تشغيل n8n محلياً. إذا كان لديك n8n على Hostinger فلا حاجة له.

### 2. المفاتيح والحسابات المطلوبة

- ✅ **Telegram Bot Token** - من @BotFather
- ✅ **Telegram User ID** - من @userinfobot  
- ✅ **OpenAI API Key** - من platform.openai.com
- ✅ **n8n API Key** - من إعدادات n8n
- ⚠️ **n8n URL** - إذا كان على Hostinger

---

## ⚡ الإعداد السريع (موصى به)

### خطوة واحدة فقط - كل شيء تلقائي! 🎉

```bash
# 1. استنسخ المشروع
git clone https://github.com/wasalstor-web/new-booty.git
cd new-booty

# 2. شغّل سكريبت الإعداد الموحد
bash setup.sh
```

### ماذا يحدث عند تشغيل `setup.sh`؟

السكريبت يقوم تلقائياً بـ:

1. ✅ **فحص النظام**
   - يتأكد من وجود Node.js (v18+)
   - يتأكد من وجود npm
   - يفحص Docker (إذا كنت تريد n8n محلي)

2. ✅ **تثبيت الحزم**
   - يثبت جميع المكتبات المطلوبة من package.json
   - يتم تلقائياً بدون تدخل منك

3. ✅ **الإعداد التفاعلي**
   - يسألك: n8n محلي أم على Hostinger؟
   - يطلب منك المفاتيح المطلوبة فقط
   - ينشئ ملف `.env` تلقائياً بالإعدادات الصحيحة

4. ✅ **تشغيل n8n**
   - إذا اخترت محلي: يشغّل n8n في Docker
   - إذا اخترت Hostinger: يتصل بـ n8n الخاص بك
   - ينتظر حتى يصبح n8n جاهزاً

5. ✅ **تشغيل Nexus**
   - يبدأ نظام Nexus كاملاً
   - يربط جميع المكونات بـ n8n
   - ينشئ workflows التطوير الذاتي

6. ✅ **فتح المتصفح**
   - يفتح n8n تلقائياً في المتصفح
   - يعرض لك واجهة n8n مباشرة

7. ✅ **إشعار تليجرام**
   - يرسل رسالة على تليجرام تخبرك أن النظام جاهز
   - تحتوي على إحصائيات النظام والمكونات المفعّلة

### مثال على التنفيذ

```bash
$ bash setup.sh

╔══════════════════════════════════════════════════════════════╗
║                   NEXUS v3.0                                 ║
║         Self-Developing AI Infrastructure                    ║
╚══════════════════════════════════════════════════════════════╝

🚀 Starting Nexus v3.0 Unified Setup...

[1/8] Checking system requirements...
✅ Node.js v18.17.0
✅ npm 9.8.1
✅ Docker 24.0.5

[2/8] Installing Node.js dependencies...
✅ Dependencies installed

[3/8] Configuring environment...
📝 Let's configure your environment...

Where is your n8n deployed?
1) Local (I want to run n8n on this machine)
2) Hostinger VPS (I already have n8n running on Hostinger)
Enter your choice (1 or 2): 1

Enter your Telegram Bot Token:
(Get it from @BotFather on Telegram)
Token: 7947973428:AAHgd5sQNbI9yj9G2ljGRDrMnRPca1jcMi0

Enter your Telegram User ID:
(Get it from @userinfobot on Telegram)
User ID: 123456789

Enter your OpenAI API Key:
(Get it from https://platform.openai.com/api-keys)
API Key: sk-proj-...

✅ Configuration saved to .env

[4/8] Starting local n8n...
🐳 Starting n8n with Docker...
✅ n8n started successfully

[5/8] Verifying configuration...
✅ Directories created
✅ All tests passed

[6/8] Starting Nexus system...
Process ID: 12345
✅ Nexus system started successfully

[7/8] Opening n8n interface...
🌐 URL: http://localhost:5678
✅ Browser opened

[8/8] Setup complete!

╔══════════════════════════════════════════════════════════════╗
║           🎉 Nexus v3.0 Setup Complete! 🎉                  ║
╚══════════════════════════════════════════════════════════════╝

📊 System Status:

  🌐 n8n (Local):        ✅ Running
     URL: http://localhost:5678
     Username: admin
     Password: admin123

  🤖 Nexus System:       ✅ Running
     PID: 12345
     Port: 3000
     API: http://localhost:3000/api

  📱 Telegram Bot:       ✅ Connected
     You should receive a notification soon!

🎯 What's Running:

  • AI Model Orchestrator (GPT-4, Llama, Mistral)
  • n8n Integration Bridge (all components connected)
  • Plugin System (E-commerce, Healthcare, Local Models)
  • Domain Adapter (adaptable to any industry)
  • Training Data Collector (for open-source models)
  • Self-Development Workflows (running in n8n)

✅ Everything is ready! Check your Telegram for notifications.

Happy automating! 🚀
```

---

## 🛠️ الإعداد اليدوي (للمتقدمين)

إذا كنت تفضل التحكم الكامل في كل خطوة:

### 1. استنساخ المشروع

```bash
git clone https://github.com/wasalstor-web/new-booty.git
cd new-booty
```

### 2. تثبيت الحزم

```bash
npm install
```

### 3. إنشاء ملف البيئة

```bash
cp .env.example .env
```

### 4. تعديل ملف `.env`

افتح الملف وعدّل القيم:

#### للاستخدام المحلي (n8n على جهازك):

```env
# n8n Configuration (Local)
N8N_EXTERNAL=false
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http
N8N_API_KEY=n8n_api_key_will_be_set

# Telegram Bot
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
ADMIN_TELEGRAM_ID=YOUR_TELEGRAM_ID

# OpenAI
OPENAI_API_KEY=YOUR_OPENAI_KEY
AI_MODEL=gpt-4

# Server
PORT=3000
NODE_ENV=production
```

#### للاستخدام مع Hostinger:

```env
# n8n Configuration (Hostinger VPS)
N8N_EXTERNAL=true
N8N_URL=https://n8n.yourdomain.com
N8N_API_KEY=YOUR_N8N_API_KEY

# Telegram Bot
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
ADMIN_TELEGRAM_ID=YOUR_TELEGRAM_ID

# OpenAI
OPENAI_API_KEY=YOUR_OPENAI_KEY
AI_MODEL=gpt-4

# Server
PORT=3000
NODE_ENV=production
```

### 5. تشغيل n8n

#### إذا كان محلياً:

```bash
bash scripts/start-n8n.sh
```

#### إذا كان على Hostinger:

لا حاجة لفعل شيء - n8n يعمل بالفعل على السيرفر

### 6. تشغيل Nexus

```bash
npm run start:v3
```

### 7. التحقق من التشغيل

```bash
# افتح متصفحك على
http://localhost:5678  # للوصول إلى n8n
http://localhost:3000  # API الخاص بـ Nexus
```

---

## 🔑 الحصول على المفاتيح المطلوبة

### 1. Telegram Bot Token

1. افتح تطبيق تليجرام
2. ابحث عن [@BotFather](https://t.me/BotFather)
3. أرسل `/newbot`
4. اتبع التعليمات واختر اسم للبوت
5. ستحصل على Token مثل:  
   `7947973428:AAHgd5sQNbI9yj9G2ljGRDrMnRPca1jcMi0`
6. انسخه وضعه في `.env` كـ `TELEGRAM_BOT_TOKEN`

**نصيحة:** احتفظ بالـ Token سرياً ولا تشاركه مع أحد!

### 2. Telegram User ID

1. افتح تطبيق تليجرام
2. ابحث عن [@userinfobot](https://t.me/userinfobot)
3. أرسل `/start`
4. سيرسل لك معلوماتك بما فيها User ID
5. انسخ الرقم (مثل: `123456789`)
6. ضعه في `.env` كـ `ADMIN_TELEGRAM_ID`

### 3. OpenAI API Key

1. اذهب إلى [platform.openai.com](https://platform.openai.com)
2. سجّل دخول أو أنشئ حساب
3. اذهب إلى [API Keys](https://platform.openai.com/api-keys)
4. اضغط "Create new secret key"
5. انسخ المفتاح (يبدأ بـ `sk-proj-...`)
6. ضعه في `.env` كـ `OPENAI_API_KEY`

**مهم:** أضف رصيد في حسابك (على الأقل $5) لتشغيل GPT-4

### 4. n8n API Key

#### إذا كان n8n محلياً:

1. افتح n8n في المتصفح (`http://localhost:5678`)
2. اذهب إلى Settings → API
3. اضغط "Create API Key"
4. انسخ المفتاح
5. ضعه في `.env` كـ `N8N_API_KEY`

#### إذا كان على Hostinger:

1. افتح n8n على الرابط الخاص بك
2. نفس الخطوات أعلاه
3. ضع الرابط في `.env` كـ `N8N_URL`
4. ضع المفتاح في `.env` كـ `N8N_API_KEY`

---

## 🔍 استكشاف الأخطاء

### المشكلة: "Node.js version must be 18 or higher"

**الحل:**

```bash
# تحديث Node.js على Linux/Mac
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# على Windows: حمّل من nodejs.org
```

### المشكلة: "Docker is not installed"

**الحل:**

- إذا كنت تريد n8n محلياً: ثبّت Docker من [docker.com](https://docs.docker.com/get-docker/)
- إذا كان n8n على Hostinger: غيّر `N8N_EXTERNAL=true` في `.env`

### المشكلة: "Failed to connect to n8n"

**الحل:**

```bash
# تأكد من أن n8n يعمل
docker ps | grep nexus-n8n

# شاهد logs
docker logs nexus-n8n

# تأكد من الرابط والمفتاح في .env
cat .env | grep N8N
```

### المشكلة: "Telegram notification not received"

**الحل:**

1. تأكد من `TELEGRAM_BOT_TOKEN` صحيح
2. تأكد من `ADMIN_TELEGRAM_ID` صحيح
3. تأكد أنك أرسلت `/start` للبوت على تليجرام
4. شاهد logs:

```bash
tail -f logs/nexus.log
```

### المشكلة: "OpenAI API error"

**الحل:**

1. تأكد من صحة المفتاح
2. تأكد من وجود رصيد في حسابك
3. تأكد من أن حسابك يدعم GPT-4
4. جرب استخدام `gpt-3.5-turbo` مؤقتاً:

```bash
# في .env
AI_MODEL=gpt-3.5-turbo
```

### المشكلة: "Port 3000 already in use"

**الحل:**

```bash
# غيّر البورت في .env
PORT=3001

# أو أوقف البرنامج الذي يستخدم البورت
lsof -ti:3000 | xargs kill -9
```

---

## ❓ الأسئلة الشائعة

### هل يمكن استخدام نماذج AI غير OpenAI؟

**نعم!** النظام يدعم:
- ✅ OpenAI (GPT-4, GPT-3.5)
- ✅ Llama 2 (محلي ومجاني)
- ✅ Mistral (محلي ومجاني)
- ✅ Claude (Anthropic)
- ✅ أي نموذج آخر يمكن إضافته

فقط فعّل الـ plugin المناسب:

```bash
# في Telegram أو عبر API
/plugins enable local-models
```

### هل يعمل النظام بدون Docker؟

- **n8n محلي:** لا - يحتاج Docker
- **n8n على Hostinger:** نعم - لا حاجة لـ Docker
- **Nexus نفسه:** نعم - يعمل بـ Node.js فقط

### كم يكلف تشغيل النظام؟

**التكاليف المحتملة:**

| الخدمة | التكلفة | بديل مجاني |
|--------|---------|-----------|
| **OpenAI GPT-4** | ~$0.03/1K tokens | استخدم Llama 2 محلياً |
| **n8n** | مجاني (self-hosted) | - |
| **Telegram Bot** | مجاني | - |
| **Hostinger VPS** | ~$4/شهر | استخدم محلياً |
| **Nexus** | مجاني ومفتوح المصدر | - |

**لتشغيل مجاني 100%:**
- استخدم Llama 2 أو Mistral محلياً
- شغّل n8n محلياً (Docker)
- شغّل Nexus محلياً

### هل يمكن استخدام النظام لمشاريع تجارية؟

**نعم!** النظام:
- ✅ مفتوح المصدر (MIT License)
- ✅ يدعم أي مجال (تجارة، صحة، تعليم، إلخ)
- ✅ قابل للتخصيص بالكامل
- ✅ Plugin system للإضافات

### كيف أضيف مجال عمل جديد؟

```javascript
// 1. أنشئ plugin جديد
// src/plugins/myDomain.plugin.js

module.exports = {
  name: 'my-domain',
  domain: 'MyDomain',
  workflows: [...],
  prompts: {...},
  hooks: {...}
};

// 2. فعّله
await pluginManager.registerPlugin(require('./plugins/myDomain.plugin'));
await domainAdapter.activateDomain('MyDomain');
```

### هل يجمع النظام بياناتي؟

**لا!** النظام:
- ✅ يعمل محلياً على جهازك أو سيرفرك
- ✅ لا يرسل بيانات لأي جهة ثالثة
- ✅ البيانات التي يجمعها (Training Data) تبقى عندك
- ✅ كود مفتوح المصدر - يمكنك مراجعته

الخدمات الخارجية الوحيدة:
- OpenAI (إذا استخدمته) - فقط للـ prompts
- Telegram - للتحكم في البوت

### كيف أوقف النظام؟

```bash
# إيقاف Nexus
kill $(cat logs/nexus.pid)

# إيقاف n8n
docker stop nexus-n8n

# إيقاف كل شيء
pkill -f "node src/index-v3.js"
docker stop nexus-n8n
```

### كيف أحدّث النظام؟

```bash
# سحب آخر التحديثات
git pull origin main

# تحديث الحزم
npm install

# إعادة التشغيل
bash setup.sh
```

---

## 📞 الدعم والمساعدة

### وثائق إضافية

- 📖 [ARCHITECTURE.md](./ARCHITECTURE.md) - المعمارية التقنية
- 🚀 [QUICKSTART.md](./QUICKSTART.md) - دليل سريع 5 دقائق
- 🗺️ [ROADMAP.md](./ROADMAP.md) - خطة التطوير المستقبلية
- 🏗️ [N8N_HOSTINGER.md](./N8N_HOSTINGER.md) - دليل Hostinger

### تقديم مشكلة (Issue)

إذا واجهت مشكلة:
1. تأكد من أنها ليست في [الأخطاء الشائعة](#استكشاف-الأخطاء)
2. افتح [Issue](https://github.com/wasalstor-web/new-booty/issues) جديد
3. أرفق:
   - رسالة الخطأ كاملة
   - محتوى `logs/nexus.log`
   - نظام التشغيل وإصدار Node.js

### المساهمة

نرحب بمساهماتك! 🎉
- Fork المشروع
- أضف ميزة أو إصلح خطأ
- أرسل Pull Request

---

## 🎉 خلاصة

**للبدء السريع (5 دقائق):**

```bash
git clone https://github.com/wasalstor-web/new-booty.git
cd new-booty
bash setup.sh
```

**هذا كل شيء! النظام سيعمل تلقائياً ويرسل لك إشعار على تليجرام. 🚀**

</div>
