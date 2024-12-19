import { useEffect, useRef } from 'react';
import { logStore } from '~/lib/stores/logs';

interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
  };
}

interface ResourceMetrics {
  cpu: number;
  memory: number;
  timestamp: number;
}

export function useResourceMonitor(threshold = 80) {
  const metricsRef = useRef<ResourceMetrics[]>([]);
  const warningThrottleRef = useRef<number>(0);

  useEffect(() => {
    const monitor = setInterval(() => {
      // Memory monitoring
      const extendedPerformance = performance as ExtendedPerformance;

      if (extendedPerformance.memory) {
        const { usedJSHeapSize, jsHeapSizeLimit } = extendedPerformance.memory;
        const memoryUsage = (usedJSHeapSize / jsHeapSizeLimit) * 100;

        // Store metrics
        metricsRef.current.push({
          cpu: 0, // CPU usage not directly available in browser
          memory: memoryUsage,
          timestamp: Date.now(),
        });

        // Keep last 10 minutes of metrics
        metricsRef.current = metricsRef.current.filter((m) => Date.now() - m.timestamp < 600000);

        // Check for sustained high usage
        const recentMetrics = metricsRef.current.slice(-5);
        const avgMemory = recentMetrics.reduce((acc, m) => acc + m.memory, 0) / recentMetrics.length;

        if (avgMemory > threshold && Date.now() - warningThrottleRef.current > 300000) {
          logStore.logWarning('Sustained high memory usage detected', {
            averageUsage: `${avgMemory.toFixed(2)}%`,
            samples: recentMetrics.length,
            timeWindow: '5 minutes',
          });
          warningThrottleRef.current = Date.now();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(monitor);
  }, [threshold]);

  return metricsRef.current;
}
