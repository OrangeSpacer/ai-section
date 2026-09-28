import { useEffect, useRef, useState } from "react";
import { type Metric, subscribeToMetrics } from "./metricsMock";

const MAX_HISTORY = 1000;
const UI_UPDATE_INTERVAL = 100;

type MetricState = {
  current: Metric;
  previousValue?: number;
};

export function useLiveMetrics(eventsPerSecond = 10000) {
  const [metrics, setMetrics] = useState<Map<string, MetricState>>(
    () => new Map(),
  );

  const [history, setHistory] = useState<Metric[]>([]);

  // Сюда складываем входящие события, не вызывая render.
  const bufferRef = useRef<Metric[]>([]);

  useEffect(() => {
    const subscription = subscribeToMetrics((metric) => {
      bufferRef.current.push(metric);
    }, eventsPerSecond);

    const timer = setInterval(() => {
      if (bufferRef.current.length === 0) {
        return;
      }

      // Забираем текущий batch.
      const batch = bufferRef.current;
      bufferRef.current = [];

      setMetrics((previousMetrics) => {
        const nextMetrics = new Map(previousMetrics);

        for (const metric of batch) {
          const previous = nextMetrics.get(metric.id);

          nextMetrics.set(metric.id, {
            current: metric,
            previousValue: previous?.current.value,
          });
        }

        return nextMetrics;
      });

      setHistory((previousHistory) => {
        const nextHistory = [...previousHistory, ...batch];

        return nextHistory.slice(-MAX_HISTORY);
      });
    }, UI_UPDATE_INTERVAL);

    return () => {
      subscription.unsubscribe();
      clearInterval(timer);
    };
  }, [eventsPerSecond]);

  return {
    metrics,
    history,
  };
}
