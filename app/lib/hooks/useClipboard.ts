import { useState, useCallback } from 'react';
import { logStore } from '~/lib/stores/logs';

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      logStore.logUserAction('Text copied to clipboard');

      return true;
    } catch (err) {
      logStore.logError('Failed to copy text', err);
      return false;
    }
  }, []);

  return { copied, copyToClipboard };
}
