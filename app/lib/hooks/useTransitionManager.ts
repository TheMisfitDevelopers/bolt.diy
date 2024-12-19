import { useRef } from 'react';
import { logStore } from '~/lib/stores/logs';
import { useAnimate } from 'framer-motion';

export function useTransitionManager() {
  const [scope, animate] = useAnimate();
  const workbenchRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);

  const handleTransition = async (from: string, to: string) => {
    if (isTransitioning.current) {
      return;
    }

    isTransitioning.current = true;

    try {
      // Fade out current chat
      await animate(from, { opacity: 0 }, { duration: 0.2 });

      // Pre-load workbench
      if (workbenchRef.current) {
        await animate(workbenchRef.current, { opacity: 1, scale: 1 }, { duration: 0.3 });
      }

      // Fade in new chat
      await animate(to, { opacity: 1 }, { duration: 0.2, delay: 0.1 });
    } catch (err) {
      logStore.logError('Transition failed', err);
    } finally {
      isTransitioning.current = false;
    }
  };

  return {
    scope,
    handleTransition,
    workbenchRef,
  };
}
