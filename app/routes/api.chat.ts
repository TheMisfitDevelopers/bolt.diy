import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { MAX_RESPONSE_SEGMENTS, MAX_TOKENS } from '~/lib/.server/llm/constants';
import { CONTINUE_PROMPT } from '~/lib/.server/llm/prompts';
import { streamText, type Messages, type StreamingOptions, type FileMap } from '~/lib/.server/llm/stream-text';
import SwitchableStream from '~/lib/.server/llm/switchable-stream';
import { logStore } from '~/lib/stores/logs';

export async function action(args: ActionFunctionArgs) {
  return chatAction(args);
}

function parseCookies(cookieHeader: string) {
  const cookies: any = {};

  // Split the cookie string by semicolons and spaces
  const items = cookieHeader.split(';').map((cookie) => cookie.trim());

  items.forEach((item) => {
    const [name, ...rest] = item.split('=');

    if (name && rest) {
      // Decode the name and value, and join value parts in case it contains '='
      const decodedName = decodeURIComponent(name.trim());
      const decodedValue = decodeURIComponent(rest.join('=').trim());
      cookies[decodedName] = decodedValue;
    }
  });

  return cookies;
}

async function chatAction({ context, request }: ActionFunctionArgs) {
  try {
    const { messages, files } = (await request.json()) as {
      messages: Messages;
      files: FileMap | undefined;
    };
    const cookieHeader = request.headers.get('Cookie');
    const apiKeys = JSON.parse(parseCookies(cookieHeader || '').apiKeys || '{}');
    const providerSettings = JSON.parse(parseCookies(cookieHeader || '').providers || '{}');

    // Add logging to debug API keys and providers
    logStore.logDebug('API configuration', {
      hasOpenRouterKey: !!apiKeys.OpenRouter,
      enabledProviders: providerSettings,
    });

    // Check if OpenRouter is enabled and has a key
    if (!apiKeys.OpenRouter && !context.cloudflare.env.OPEN_ROUTER_API_KEY) {
      throw new Error('OpenRouter API key is required');
    }

    /*
     * Remove Anthropic key requirement
     * if (!apiKeys.Anthropic && !context.cloudflare.env.ANTHROPIC_API_KEY) {
     *   throw new Error('Anthropic API key is required');
     * }
     */

    const stream = new SwitchableStream();

    const options: StreamingOptions = {
      toolChoice: 'none',
      onFinish: async ({ text: content, finishReason }) => {
        if (finishReason !== 'length') {
          return stream.close();
        }

        if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
          throw Error('Cannot continue message: Maximum segments reached');
        }

        const switchesLeft = MAX_RESPONSE_SEGMENTS - stream.switches;

        console.log(`Reached max token limit (${MAX_TOKENS}): Continuing message (${switchesLeft} switches left)`);

        messages.push({ role: 'assistant', content });
        messages.push({ role: 'user', content: CONTINUE_PROMPT });

        const result = await streamText({
          messages,
          env: context.cloudflare.env,
          options,
          apiKeys,
          files,
          providerSettings,
        });

        return stream.switchSource(result.toAIStream());
      },
    };

    const result = await streamText({
      messages,
      env: context.cloudflare.env,
      options,
      apiKeys,
      files,
      providerSettings,
    });

    stream.switchSource(result.toAIStream());

    return new Response(stream.readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    logStore.logError('Chat API Error', error);
    throw new Response(error.message || 'API Error', {
      status: error.message?.includes('API key') ? 401 : 500,
    });
  }
}

// Move to top of file with other exports
export async function handleOpenRouterRequest(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({
        error: { message: response.statusText },
      }))) as { error?: { message?: string } };

      throw new Error(`OpenRouter API error (${response.status}): ${errorData?.error?.message || response.statusText}`);
    }

    return response;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logStore.logError('OpenRouter API Error', error, {
        url,
        statusCode: (error as any).response?.status,
        errorMessage: error.message,
      });
    }

    throw error;
  }
}

// Add OPTIONS handler
export async function loader({ request }: LoaderFunctionArgs) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  return null;
}
