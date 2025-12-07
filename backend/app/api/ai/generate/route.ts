import { NextRequest, NextResponse } from 'next/server';
import { aiGateway } from '@/lib/ai';
import { rateLimiter } from '@/lib/rate-limiter';
import { validateApiKey } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // التحقق من API Key
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { isValid, userId, userTier } = await validateApiKey(apiKey || '');
    
    if (!isValid || !userId) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // التحقق من معدل الطلبات
    const isRateLimited = await rateLimiter.checkLimit(userId);
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // قراءة البيانات
    const { prompt, model, options } = await request.json();
    
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // التحقق من حدود الباقة
    const canUseModel = await checkModelAccess(userTier, model);
    if (!canUseModel) {
      return NextResponse.json(
        { error: 'This model is not available for your subscription tier' },
        { status: 403 }
      );
    }

    // توليد المحتوى
    const startTime = Date.now();
    const result = await aiGateway.generateText(prompt, model);
    const generationTime = Date.now() - startTime;

    // تحديث استخدام المستخدم
    await updateUserUsage(userId, result.tokens || 100, model);

    // تسجيل النشاط
    await logActivity(userId, 'text_generation', {
      promptLength: prompt.length,
      model,
      tokens: result.tokens,
      generationTime
    });

    // إرجاع النتيجة
    return NextResponse.json({
      success: true,
      content: result.content,
      model: result.model,
      provider: result.provider,
      tokens: result.tokens,
      generationTime,
      remainingCredits: await getUserCredits(userId)
    });

  } catch (error) {
    console.error('Generation API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// وظائف مساعدة
async function checkModelAccess(tier: string, model: string): Promise<boolean> {
  const tierModels: Record<string, string[]> = {
    free: ['gpt-3.5-turbo'],
    basic: ['gpt-3.5-turbo', 'gpt-4'],
    pro: ['gpt-3.5-turbo', 'gpt-4', 'claude-3'],
    enterprise: ['gpt-3.5-turbo', 'gpt-4', 'claude-3', 'gemini-pro']
  };
  
  return tierModels[tier]?.includes(model) || false;
}

async function updateUserUsage(userId: string, tokens: number, model: string) {
  // تحديث استخدام المستخدم في قاعدة البيانات
  // تنفيذ حقيقي يعتمد على نظام قاعدة البيانات
}

async function logActivity(userId: string, action: string, metadata: any) {
  // تسجيل النشاط في قاعدة البيانات
}

async function getUserCredits(userId: string): Promise<number> {
  // جلب الرصيد المتبقي للمستخدم
  return 1000; // قيمة افتراضية
}
