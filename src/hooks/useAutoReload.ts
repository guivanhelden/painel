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
  const lastReloadAtRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Normaliza o intervalo: evita NaN/0/negativo e impõe mínimo de 10s
    const DEFAULT_INTERVAL = 10 * 60 * 1000; // 10 min
    const MIN_INTERVAL = 10 * 1000; // 10s
    const resolvedInterval = Number.isFinite(intervalMs) && intervalMs >= MIN_INTERVAL
      ? intervalMs
      : DEFAULT_INTERVAL;

    const start = () => {
      if (intervalRef.current) return;
      // eslint-disable-next-line no-console
      console.log(`[AutoReload] Iniciado com intervalo ${resolvedInterval}ms`);
      intervalRef.current = window.setInterval(() => {
        // Evita reloads enquanto a aba estiver oculta se configurado
        if (pauseWhenHidden && document.hidden) return;
        // Trava de segurança: nunca recarregar mais de 1x em 5s
        const now = Date.now();
        if (now - lastReloadAtRef.current < 5000) return;
        lastReloadAtRef.current = now;
        // Log temporário para acompanhamento
        // eslint-disable-next-line no-console
        console.log('[AutoReload] Disparado – recarregando página agora');
        window.location.reload();
      }, resolvedInterval);
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


