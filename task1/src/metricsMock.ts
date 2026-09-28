export type Metric = {
  id: string;
  name: string;
  value: number;
  timestamp: number;
};

type MetricDefinition = {
  id: string;
  name: string;
  initialValue: number;
  volatility: number;
};

const METRICS: MetricDefinition[] = [
  {
    id: "cpu",
    name: "CPU Usage",
    initialValue: 35,
    volatility: 8,
  },
  {
    id: "memory",
    name: "Memory Usage",
    initialValue: 62,
    volatility: 5,
  },
  {
    id: "requests",
    name: "Requests / sec",
    initialValue: 1200,
    volatility: 150,
  },
  {
    id: "latency",
    name: "Response Time",
    initialValue: 120,
    volatility: 30,
  },
  {
    id: "errors",
    name: "Error Rate",
    initialValue: 2,
    volatility: 1,
  },
];

const currentValues = new Map(
  METRICS.map((metric) => [metric.id, metric.initialValue]),
);

function generateMetric(): Metric {
  const definition = METRICS[Math.floor(Math.random() * METRICS.length)];

  const previousValue =
    currentValues.get(definition.id) ?? definition.initialValue;

  const change = (Math.random() - 0.5) * 2 * definition.volatility;

  const value = Math.max(0, previousValue + change);

  currentValues.set(definition.id, value);

  return {
    id: definition.id,
    name: definition.name,
    value: Number(value.toFixed(2)),
    timestamp: Date.now(),
  };
}

export type MetricsSubscription = {
  unsubscribe(): void;
};

export function subscribeToMetrics(
  callback: (metric: Metric) => void,
  eventsPerSecond = 1,
): MetricsSubscription {
  let active = true;

  const interval = 100;

  const eventsPerTick = Math.max(
    1,
    Math.round(eventsPerSecond / (1000 / interval)),
  );

  const timer = setInterval(() => {
    if (!active) {
      return;
    }

    for (let i = 0; i < eventsPerTick; i++) {
      callback(generateMetric());
    }
  }, interval);

  return {
    unsubscribe() {
      active = false;
      clearInterval(timer);
    },
  };
}
