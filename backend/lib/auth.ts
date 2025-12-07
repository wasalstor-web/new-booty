export async function validateApiKey(apiKey: string) {
  // In a real app, check DB for API key
  if (apiKey === 'valid-key') {
    return { isValid: true, userId: 'user-123', userTier: 'pro' };
  }
  return { isValid: false, userId: null, userTier: null };
}
