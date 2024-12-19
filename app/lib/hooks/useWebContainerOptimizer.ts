import { useEffect } from 'react';
import { logStore } from '~/lib/stores/logs';

export function useWebContainerOptimizer() {
  useEffect(() => {
    const maxConcurrentOps = 3;
    let activeOps = 0;
    const opQueue: (() => Promise<void>)[] = [];

    const processQueue = async () => {
      if (activeOps >= maxConcurrentOps || opQueue.length === 0) {
        return;
      }

      const op = opQueue.shift();

      if (op) {
        activeOps++;

        try {
          await op();
        } catch (err) {
          logStore.logError('WebContainer operation failed', err);
        }
        activeOps--;
        processQueue();
      }
    };

    const cleanupInterval = setInterval(() => {
      const container = window.webcontainer;

      if (container?.fs) {
        opQueue.push(async () => {
          await container.fs.rm('.cache', { recursive: true }).catch(() => {
            // Ignore error if .cache directory doesn't exist
          });
        });
        processQueue();
      }
    }, 300000);

    return () => clearInterval(cleanupInterval);
  }, []);
}
