"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import NetworkVisualization from "./NetworkVisualization"
import PerformanceMetrics from "./PerformanceMetrics"

import AlgorithmExplanation from "./AlgorithmExplanation"
import AlgorithmComparison from "./AlgorithmComparison"
import { toast } from "react-hot-toast"

const ALGORITHMS = ["RL", "DQN"]

const INITIAL_NETWORK = {
  nodes: ["A", "B", "C", "D", "E", "F", "G", "H"].map((id) => ({ id, group: 0 })),
  links: [
    { source: "A", target: "B", value: 1 },
    { source: "B", target: "C", value: 2 },
    { source: "C", target: "D", value: 1 },
    { source: "D", target: "E", value: 3 },
    { source: "E", target: "F", value: 1 },
    { source: "F", target: "G", value: 2 },
    { source: "G", target: "H", value: 1 },
    { source: "H", target: "A", value: 3 },
    { source: "A", target: "D", value: 4 },
    { source: "B", target: "F", value: 3 },
    { source: "C", target: "G", value: 2 },
    { source: "D", target: "H", value: 1 },
  ],
}

export default function NetworkRouting() {
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [algorithm, setAlgorithm] = useState("RL")
  const [route, setRoute] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [logs, setLogs] = useState<string[]>([])
  const [networkData, setNetworkData] = useState(INITIAL_NETWORK)
  const [metrics, setMetrics] = useState({ time: 0, iterations: 0, memoryUsage: 0 })
  const [dqnParams, setDqnParams] = useState({ learningRate: 0.001, discountFactor: 0.99, explorationRate: 0.1 })
  const [showExplanation, setShowExplanation] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)
  const [intermediateSteps, setIntermediateSteps] = useState<string[][]>([])

  const addLog = useCallback((log: string) => {
    setLogs((prevLogs) => [...prevLogs, log])
  }, [])

  useEffect(() => {
    setRoute([]) // Clear the route when algorithm changes
  }, [algorithm])

  const handleTrain = async () => {
    if (!start || !end) {
      toast.error("Please enter both start and end nodes")
      return
    }

    addLog("Starting training...")

    try {
      const response = await fetch("/api/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end, algorithm, dqnParams }),
      })

      if (!response.ok) throw new Error("Training failed")

      const data = await response.json()
      setMessage(data.message)
      setMetrics(data.metrics)

      addLog("Training completed successfully!")
      addLog(`${algorithm} model has been updated for the specified start and end nodes.`)
      toast.success("Training completed successfully!")
    } catch (error) {
      console.error("Error during training:", error)
      addLog("Error during training. Please check the logs for more details.")
      toast.error("Training failed. Please try again.")
    }
  }

  const handleRoute = async () => {
    if (!start || !end) {
      toast.error("Please enter both start and end nodes")
      return
    }

    addLog("Fetching the optimal route...")

    try {
      const response = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end, algorithm }),
      })

      if (!response.ok) throw new Error("Routing failed")

      const data = await response.json()
      setRoute(data.route)
      setIntermediateSteps(data.intermediateSteps)
      setMetrics(data.metrics)

      addLog("Optimal route fetched successfully!")
      addLog(`The computed route is: ${data.route.join(" -> ")}.`)
      toast.success("Optimal route computed!")
      setShowExplanation(true)
      setAnimationStep(0)
    } catch (error) {
      console.error("Error getting route:", error)
      addLog("Error fetching the optimal route. Please check the logs.")
      toast.error("Failed to compute route. Please try again.")
    }
  }

  useEffect(() => {
    if (route.length > 0 && animationStep < route.length - 1) {
      const timer = setTimeout(() => {
        setAnimationStep((prev) => prev + 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [route, animationStep])

  return (
    <div className="p-4 md:p-8"> {/* Added padding here */}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Network Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Input placeholder="Start Node (e.g., A)" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input placeholder="End Node (e.g., D)" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <Select value={algorithm} onValueChange={setAlgorithm}>
            <SelectTrigger>
              <SelectValue placeholder="Select Algorithm" />
            </SelectTrigger>
            <SelectContent>
              {ALGORITHMS.map((alg) => (
                <SelectItem key={alg} value={alg}>
                  {alg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {algorithm === "DQN" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Learning Rate: {dqnParams.learningRate}</label>
                <Slider
                  min={0.0001}
                  max={0.1}
                  step={0.0001}
                  value={[dqnParams.learningRate]}
                  onValueChange={(val: number[]) => setDqnParams((prev) => ({ ...prev, learningRate: val[0] as number }))}
                  />
              </div>
              <div>
                <label className="text-sm font-medium">Discount Factor: {dqnParams.discountFactor}</label>
                <Slider
                  min={0.8}
                  max={0.99}
                  step={0.01}
                  value={[dqnParams.discountFactor]}
                  onValueChange={(val: number[]) => setDqnParams((prev) => ({ ...prev, learningRate: val[0] as number }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Exploration Rate: {dqnParams.explorationRate}</label>
                <Slider
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  value={[dqnParams.explorationRate]}
                  onValueChange={(val: number[]) => setDqnParams((prev) => ({ ...prev, learningRate: val[0] as number }))}

                />
              </div>
            </div>
          )}
          <div className="flex space-x-4">
            <Button onClick={handleTrain}>Train Model</Button>
            <Button onClick={handleRoute}>Get Optimal Route</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Network Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <NetworkVisualization data={networkData} route={route.slice(0, animationStep + 1)} algorithm={algorithm} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceMetrics metrics={metrics} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
       
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Algorithm Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <AlgorithmComparison
            start={start}
            end={end}
            currentAlgorithm={algorithm}
            intermediateSteps={intermediateSteps}
          />
        </CardContent>
      </Card>

      {showExplanation && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Algorithm Explanation</CardTitle>
          </CardHeader>
          <CardContent>
            <AlgorithmExplanation
              algorithm={algorithm}
              route={route}
              animationStep={animationStep}
              intermediateSteps={intermediateSteps}
            />
          </CardContent>
        </Card>
      )}
    </div>
    </div>

  )
}
