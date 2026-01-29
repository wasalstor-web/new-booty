# التحليل العميق لآلية تشغيل مشروع BOLT-QQQ على الخادم

## الهدف
تشغيل تطبيق يعتمد على بيئات تشغيل متعددة تشمل **React**، **Supabase**، و**Node.js** مع إعداد خادم ويب فعال باستخدام **NGINX** وضمان بيئة إنتاجية مستقرة.

---

## 1. المتطلبات الأساسية

لتشغيل مشروعك بسلاسة على الخادم، تأكد من توفير:

### نظام التشغيل
- **Ubuntu** (يفضل الإصدارات الحديثة مثل 20.04 LTS أو 22.04 LTS لضمان دعم طويل)
- يجب تحديث النظام بشكل منتظم للحفاظ على الأمان

### Node.js
- **يتم تثبيته بواسطة NVM (Node Version Manager)** لضمان التحديث وحل مشاكل التوافق بين الإصدارات
- **لماذا Node.js؟** هو العصب الأساسي لتشغيل التطبيقات المبنية على JavaScript وTypeScript
- الإصدار الموصى به: Node.js 18.x أو أعلى

### pnpm
- مدير حزم خفيف وفعال لتحميل المكتبات
- **لماذا pnpm؟** أسرع وأكثر كفاءة في التعامل مع المساحات المشتركة مقارنة بـ npm
- يدعم workspaces للمشاريع متعددة الحزم

### Git
- لإدارة التحكم في الإصدار والحصول على المشروع من GitHub
- ضروري لتتبع التغييرات والتحديثات

### NGINX
- يعمل كـ Reverse Proxy ليضمن توزيع الطلبات وتحسين الأداء
- يوفر SSL/TLS للاتصالات الآمنة
- يحسن الأداء من خلال التخزين المؤقت وموازنة الحمل

### قاعدة بيانات PostgreSQL
- لتخزين البيانات الخاصة بالتطبيق
- يمكن استخدام Supabase كبديل مُدار في السحابة

### Docker و Docker Compose
- لإدارة الحاويات وتشغيل التطبيق بشكل معزول
- يضمن بيئة متسقة عبر مختلف الخوادم

---

## 2. تنزيل الكود المصدري

### الوصول إلى الخادم

#### 2.1 الاتصال بالخادم عبر SSH
```bash
ssh username@your-server-ip
```

#### 2.2 تحديث النظام
```bash
sudo apt update && sudo apt upgrade -y
```

#### 2.3 استنساخ المستودع
```bash
# إنشاء مجلد للمشروع
mkdir -p ~/projects
cd ~/projects

# استنساخ المستودع من GitHub
git clone https://github.com/wasalstor-web/new-booty.git
cd new-booty
```

---

## 3. تثبيت المتطلبات

### 3.1 تثبيت NVM و Node.js

```bash
# تثبيت NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# تحميل NVM في الجلسة الحالية
source ~/.bashrc

# تثبيت Node.js (الإصدار 18)
nvm install 18
nvm use 18
nvm alias default 18

# التحقق من التثبيت
node --version
npm --version
```

### 3.2 تثبيت pnpm

```bash
# تثبيت pnpm عبر npm
npm install -g pnpm

# التحقق من التثبيت
pnpm --version
```

### 3.3 تثبيت Docker و Docker Compose

```bash
# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# إضافة المستخدم الحالي إلى مجموعة docker
sudo usermod -aG docker $USER

# تسجيل خروج ودخول لتفعيل التغييرات
# أو استخدم:
newgrp docker

# تثبيت Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# التحقق من التثبيت
docker --version
docker-compose --version
```

### 3.4 تثبيت NGINX

```bash
sudo apt install nginx -y

# بدء NGINX وتفعيله عند الإقلاع
sudo systemctl start nginx
sudo systemctl enable nginx

# التحقق من الحالة
sudo systemctl status nginx
```

---

## 4. إعداد قاعدة البيانات

### 4.1 استخدام PostgreSQL المحلي

```bash
# تثبيت PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# بدء الخدمة
sudo systemctl start postgresql
sudo systemctl enable postgresql

# إنشاء قاعدة بيانات ومستخدم
sudo -u postgres psql
```

```sql
CREATE DATABASE ai_platform;
CREATE USER ai_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_platform TO ai_user;
\q
```

### 4.2 استخدام Supabase (موصى به)

1. انتقل إلى [Supabase](https://supabase.com)
2. أنشئ مشروعًا جديدًا
3. احصل على رابط قاعدة البيانات (Database URL)
4. استخدم الرابط في ملف `.env`

---

## 5. إعداد المتغيرات البيئية

### 5.1 Frontend Environment Variables

أنشئ ملف `.env.production` في مجلد `frontend`:

```bash
cd ~/projects/new-booty/frontend
nano .env.production
```

أضف المحتوى التالي:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# API Configuration
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Database Configuration (Supabase or PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database

# Sentry (optional for error tracking)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 5.2 Backend Environment Variables

أنشئ ملف `.env` في مجلد `backend`:

```bash
cd ~/projects/new-booty/backend
nano .env
```

أضف المحتوى التالي:

```env
# Database
DATABASE_URL=postgresql://ai_user:your_secure_password@localhost:5432/ai_platform

# Node Environment
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_very_long_and_secure_jwt_secret

# API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Frontend URL
FRONTEND_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com

# Redis (if using)
REDIS_URL=redis://localhost:6379
```

---

## 6. بناء المشروع

### 6.1 تثبيت التبعيات

```bash
# Frontend
cd ~/projects/new-booty/frontend
npm install

# Backend
cd ~/projects/new-booty/backend
npm install
```

### 6.2 إنشاء قاعدة البيانات

```bash
# Backend - Prisma Migrations
cd ~/projects/new-booty/backend
npx prisma generate
npx prisma migrate deploy
```

### 6.3 بناء التطبيقات

```bash
# Build Frontend
cd ~/projects/new-booty/frontend
npm run build

# Build Backend
cd ~/projects/new-booty/backend
npm run build
```

---

## 7. تشغيل المشروع باستخدام Docker Compose

### 7.1 تحديث ملف docker-compose.yml

تأكد من أن ملف `docker-compose.yml` يحتوي على الإعدادات الصحيحة:

```bash
cd ~/projects/new-booty
nano docker-compose.yml
```

### 7.2 بناء وتشغيل الحاويات

```bash
# بناء الحاويات
docker-compose build

# تشغيل الحاويات في الخلفية
docker-compose up -d

# التحقق من الحالة
docker-compose ps

# عرض السجلات
docker-compose logs -f
```

---

## 8. إعداد NGINX كـ Reverse Proxy

### 8.1 إنشاء ملف إعداد NGINX

```bash
sudo nano /etc/nginx/sites-available/bolt-qqq
```

أضف الإعداد التالي:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 8.2 تفعيل الموقع

```bash
# إنشاء رابط رمزي
sudo ln -s /etc/nginx/sites-available/bolt-qqq /etc/nginx/sites-enabled/

# اختبار الإعداد
sudo nginx -t

# إعادة تحميل NGINX
sudo systemctl reload nginx
```

---

## 9. إعداد SSL باستخدام Let's Encrypt

### 9.1 تثبيت Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 9.2 الحصول على شهادة SSL

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 9.3 التجديد التلقائي

```bash
# اختبار التجديد
sudo certbot renew --dry-run

# إعداد مهمة cron للتجديد التلقائي
sudo crontab -e
```

أضف السطر التالي:

```
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 10. المراقبة والصيانة

### 10.1 مراقبة السجلات

```bash
# سجلات Docker Compose
docker-compose logs -f

# سجلات NGINX
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# سجلات النظام
journalctl -u nginx -f
```

### 10.2 إعادة التشغيل

```bash
# إعادة تشغيل الحاويات
docker-compose restart

# إعادة تشغيل NGINX
sudo systemctl restart nginx
```

### 10.3 التحديثات

```bash
cd ~/projects/new-booty

# سحب التحديثات
git pull origin main

# إعادة بناء الحاويات
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 11. النسخ الاحتياطي

### 11.1 نسخ احتياطي لقاعدة البيانات

```bash
# PostgreSQL
docker-compose exec db pg_dump -U postgres ai_platform > backup_$(date +%Y%m%d).sql

# استعادة النسخة الاحتياطية
docker-compose exec -T db psql -U postgres ai_platform < backup_20240101.sql
```

### 11.2 نسخ احتياطي للملفات

```bash
# إنشاء أرشيف
tar -czf bolt-qqq-backup-$(date +%Y%m%d).tar.gz ~/projects/new-booty

# نسخ إلى موقع آمن
scp bolt-qqq-backup-$(date +%Y%m%d).tar.gz user@backup-server:/backups/
```

---

## 12. استكشاف الأخطاء وإصلاحها

### مشاكل شائعة وحلولها

#### 12.1 الحاويات لا تبدأ

```bash
# التحقق من السجلات
docker-compose logs

# التحقق من المنافذ المستخدمة
sudo netstat -tulpn | grep LISTEN

# إعادة بناء الحاويات
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

#### 12.2 NGINX لا يعمل

```bash
# التحقق من الإعداد
sudo nginx -t

# التحقق من الحالة
sudo systemctl status nginx

# إعادة التشغيل
sudo systemctl restart nginx
```

#### 12.3 مشاكل قاعدة البيانات

```bash
# الاتصال بقاعدة البيانات
docker-compose exec db psql -U postgres ai_platform

# التحقق من الجداول
\dt

# التحقق من الاتصالات
SELECT * FROM pg_stat_activity;
```

---

## 13. الأمان

### 13.1 جدار الحماية (UFW)

```bash
# تفعيل UFW
sudo ufw enable

# السماح بـ SSH
sudo ufw allow ssh

# السماح بـ HTTP و HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# التحقق من الحالة
sudo ufw status
```

### 13.2 تحديثات الأمان

```bash
# تحديثات تلقائية
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 13.3 حماية SSH

```bash
# تعديل إعدادات SSH
sudo nano /etc/ssh/sshd_config
```

التوصيات:
- تعطيل تسجيل الدخول كـ root: `PermitRootLogin no`
- استخدام مفاتيح SSH بدلاً من كلمات المرور
- تغيير المنفذ الافتراضي

---

## 14. تحسين الأداء

### 14.1 إعداد Redis للتخزين المؤقت

Redis مُضمّن بالفعل في `docker-compose.yml`. للاستفادة منه:

```javascript
// في التطبيق
import Redis from 'ioredis';

const redis = new Redis({
  host: 'redis',
  port: 6379
});
```

### 14.2 تحسين NGINX

```nginx
# إضافة إلى ملف الإعداد
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

# التخزين المؤقت للملفات الثابتة
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 15. خاتمة

تم إعداد مشروع BOLT-QQQ بنجاح على الخادم! للحصول على المساعدة:

- **الوثائق**: راجع ملفات README في المجلدات
- **المشاكل**: أنشئ issue على GitHub
- **الدعم**: تواصل مع فريق التطوير

### الخطوات التالية

1. **المراقبة**: إعداد أدوات المراقبة (Prometheus, Grafana)
2. **التحليلات**: دمج Google Analytics أو Plausible
3. **الأداء**: استخدام CDN لتسريع المحتوى الثابت
4. **النسخ الاحتياطي**: إعداد نسخ احتياطية تلقائية منتظمة
5. **التوسع**: التخطيط لتوسيع البنية التحتية عند الحاجة

---

**ملاحظة**: تأكد من تغيير جميع القيم الافتراضية (كلمات المرور، المفاتيح السرية، وأسماء النطاقات) بقيم خاصة بك وآمنة.
