import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIGateway {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private googleAI: GoogleGenerativeAI;
  
  constructor() {
    // Initialize with dummy keys if not present (for build time)
    // The actual keys will be provided at runtime
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build'
    });
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key-for-build'
    });
    
    this.googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'dummy-key-for-build');
  }

  async generateText(prompt: string, model: string = 'gpt-4') {
    try {
      // توجيه الطلب للنموذج المناسب
      switch(model) {
        case 'gpt-4':
        case 'gpt-3.5-turbo':
          return await this.generateWithOpenAI(prompt, model);
          
        case 'claude-3':
          return await this.generateWithClaude(prompt);
          
        case 'gemini-pro':
          return await this.generateWithGemini(prompt);
          
        default:
          return await this.generateWithOpenAI(prompt, 'gpt-3.5-turbo');
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw new Error('Failed to generate content');
    }
  }

  private async generateWithOpenAI(prompt: string, model: string) {
    const completion = await this.openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return {
      content: completion.choices[0].message.content,
      model: model,
      tokens: completion.usage?.total_tokens,
      provider: 'openai'
    };
  }

  private async generateWithClaude(prompt: string) {
    const message = await this.anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    return {
      content: message.content[0].text,
      model: 'claude-3',
      tokens: message.usage.input_tokens + message.usage.output_tokens,
      provider: 'anthropic'
    };
  }

  private async generateWithGemini(prompt: string) {
    const model = this.googleAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      content: response.text(),
      model: 'gemini-pro',
      tokens: 0, // Gemini لا يعيد عدد التوكينز
      provider: 'google'
    };
  }

  async generateImage(prompt: string, size: string = '1024x1024') {
    const response = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: size as any,
      quality: 'standard'
    });

    if (!response.data || !response.data[0]) {
      throw new Error('Failed to generate image');
    }

    return {
      url: response.data[0].url,
      revised_prompt: response.data[0].revised_prompt,
      model: 'dall-e-3',
      provider: 'openai'
    };
  }

  async analyzeContent(content: string, analysisType: string) {
    // تحليل المحتوى باستخدام AI
    const analysisPrompt = `Analyze this ${analysisType} content: ${content}`;
    
    return await this.generateText(analysisPrompt, 'gpt-4');
  }
}

export const aiGateway = new AIGateway();
