import { RateLimiterMemory } from 'rate-limiter-flexible';

export const rateLimiter = {
  limiter: new RateLimiterMemory({
    points: 10, // 10 requests
    duration: 1, // per 1 second by default
  }),

  async checkLimit(userId: string) {
    try {
      await this.limiter.consume(userId);
      return false;
    } catch (rejRes) {
      return true;
    }
  }
};
