import { handleOpenRouterRequest } from '~/routes/api.chat';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

export async function streamOpenRouterChat(messages: Message, apiKey: string, model: string) {
  const response = await handleOpenRouterRequest(`${OPENROUTER_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/stackblitz-labs/bolt.diy',
      'X-Title': 'Bolt.diy',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  if (!response.body) {
    throw new Error('No response body from OpenRouter');
  }

  return response.body;
}
