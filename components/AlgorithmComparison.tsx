import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import NetworkVisualization from "./NetworkVisualization"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AlgorithmComparisonProps {
  start: string
  end: string
  currentAlgorithm: string
  intermediateSteps: string[][]
}

const ALGORITHMS = ["RL", "DQN"]

export default function AlgorithmComparison({
  start,
  end,
  currentAlgorithm,
  intermediateSteps,
}: AlgorithmComparisonProps) {
  const [comparisonData, setComparisonData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentAlgorithm && intermediateSteps.length > 0) {
      setComparisonData((prev) => ({ ...prev, [currentAlgorithm]: { steps: intermediateSteps } }))
    }
  }, [currentAlgorithm, intermediateSteps])

  const fetchComparisonData = async () => {
    setLoading(true)
    for (const alg of ALGORITHMS) {
      if (alg !== currentAlgorithm) {
        try {
          const response = await fetch("/api/route", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ start, end, algorithm: alg }),
          })
          if (!response.ok) throw new Error(`Routing failed for ${alg}`)
          const data = await response.json()
          setComparisonData((prev) => ({ ...prev, [alg]: { steps: data.intermediateSteps, metrics: data.metrics } }))
        } catch (error) {
          console.error(`Error fetching data for ${alg}:`, error)
        }
      }
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <Button onClick={fetchComparisonData} disabled={loading}>
        {loading ? "Loading..." : "Compare RL and DQN"}
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ALGORITHMS.map((alg) => (
          <div key={alg} className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{alg}</h3>
            {comparisonData[alg] ? (
              <NetworkVisualization
                data={{
                  nodes: ["A", "B", "C", "D", "E", "F", "G", "H"].map((id) => ({ id, group: 0 })),
                  links: [
                    { source: "A", target: "B" },
                    { source: "B", target: "C" },
                    { source: "C", target: "D" },
                    { source: "D", target: "E" },
                    { source: "E", target: "F" },
                    { source: "F", target: "G" },
                    { source: "G", target: "H" },
                    { source: "H", target: "A" },
                    { source: "A", target: "D" },
                    { source: "B", target: "F" },
                    { source: "C", target: "G" },
                    { source: "D", target: "H" },
                  ],
                }}
                route={comparisonData[alg].steps[comparisonData[alg].steps.length - 1]}
                algorithm={alg}
                intermediateSteps={comparisonData[alg].steps}
              />
            ) : (
              <p>No data available</p>
            )}
          </div>
        ))}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metric</TableHead>
            <TableHead>RL</TableHead>
            <TableHead>DQN</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Number of Steps</TableCell>
            <TableCell>{comparisonData.RL?.steps.length || "N/A"}</TableCell>
            <TableCell>{comparisonData.DQN?.steps.length || "N/A"}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Execution Time (ms)</TableCell>
            <TableCell>{comparisonData.RL?.metrics?.time.toFixed(2) || "N/A"}</TableCell>
            <TableCell>{comparisonData.DQN?.metrics?.time.toFixed(2) || "N/A"}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Memory Usage (MB)</TableCell>
            <TableCell>{comparisonData.RL?.metrics?.memoryUsage.toFixed(2) || "N/A"}</TableCell>
            <TableCell>{comparisonData.DQN?.metrics?.memoryUsage.toFixed(2) || "N/A"}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Iterations</TableCell>
            <TableCell>{comparisonData.RL?.metrics?.iterations || "N/A"}</TableCell>
            <TableCell>{comparisonData.DQN?.metrics?.iterations || "N/A"}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

