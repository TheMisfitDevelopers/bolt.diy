import { useEffect } from 'react';

export function useChatOptimizer() {
  useEffect(() => {
    // Optimize for Qwen 2.5 7B
    const config = {
      maxTokens: 4096, // Adjust based on model
      temperature: 0.7,
      topP: 0.9,
      streamChunkSize: 20,
      maxConcurrentRequests: 1,
    };

    // Apply optimizations
    window.chatConfig = config;
  }, []);
}
