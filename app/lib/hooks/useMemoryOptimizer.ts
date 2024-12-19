import { useEffect } from 'react';
import { logStore } from '~/lib/stores/logs';

interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export function useMemoryOptimizer() {
  useEffect(() => {
    const extendedPerformance = performance as ExtendedPerformance;

    const memoryInterval = setInterval(() => {
      if (extendedPerformance.memory) {
        const { usedJSHeapSize, jsHeapSizeLimit } = extendedPerformance.memory;
        const usagePercentage = (usedJSHeapSize / jsHeapSizeLimit) * 100;

        if (usagePercentage > 80) {
          logStore.logWarning('High memory usage detected', {
            usage: `${usagePercentage.toFixed(2)}%`,
            used: `${(usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          });
        }
      }
    }, 10000);

    return () => clearInterval(memoryInterval);
  }, []);
}
