import React from "react"

interface PerformanceMetricsProps {
  metrics: {
    time: number
    iterations: number
    memoryUsage: number
  }
}

export default function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  return (
    <div className="space-y-2">
      <p>
        <strong>Execution Time:</strong> {metrics.time.toFixed(2)} ms
      </p>
      <p>
        <strong>Iterations:</strong> {metrics.iterations}
      </p>
      <p>
        <strong>Memory Usage:</strong> {metrics.memoryUsage.toFixed(2)} MB
      </p>
    </div>
  )
}

