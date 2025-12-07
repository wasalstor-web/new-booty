const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = {
  generate: async (prompt: string, model: string) => {
    const response = await fetch(`${BASE_URL}/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth headers here if needed
      },
      body: JSON.stringify({ prompt, model }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate content');
    }

    return response.json();
  },

  // Add other API methods here
};
