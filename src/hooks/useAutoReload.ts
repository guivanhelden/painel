import { useEffect, useRef } from 'react';

type UseAutoReloadOptions = {
  intervalMs?: number;
  enabled?: boolean;
  pauseWhenHidden?: boolean;
};

export function useAutoReload(options: UseAutoReloadOptions = {}) {
  const { intervalMs = 5 * 60 * 1000, enabled = true, pauseWhenHidden = true } = options;
  const intervalRef = useRef<number | null>(null);
  const visibilityHandlerRef = useRef<() => void>();

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const start = () => {
      if (intervalRef.current) return;
      intervalRef.current = window.setInterval(() => {
        // Evita reloads enquanto a aba estiver oculta se configurado
        if (pauseWhenHidden && document.hidden) return;
        // Log temporário para acompanhamento
        // eslint-disable-next-line no-console
        console.log('[AutoReload] Disparado – recarregando página agora');
        window.location.reload();
      }, intervalMs);
    };

    const stop = () => {
      if (!intervalRef.current) return;
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };

    // Controle por visibilidade
    if (pauseWhenHidden) {
      const onVisibilityChange = () => {
        if (document.hidden) {
          stop();
        } else {
          start();
        }
      };
      visibilityHandlerRef.current = onVisibilityChange;
      document.addEventListener('visibilitychange', onVisibilityChange);
    }

    start();

    return () => {
      stop();
      if (pauseWhenHidden && visibilityHandlerRef.current) {
        document.removeEventListener('visibilitychange', visibilityHandlerRef.current);
      }
    };
  }, [intervalMs, enabled, pauseWhenHidden]);
}


