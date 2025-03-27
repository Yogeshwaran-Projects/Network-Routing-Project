"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import NetworkVisualization from "./NetworkVisualization"
import PerformanceMetrics from "./PerformanceMetrics"
import AlgorithmExplanation from "./AlgorithmExplanation"
import AlgorithmComparison from "./AlgorithmComparison"
import { toast } from "react-hot-toast"
import { ModeToggle } from "./mode"
import { 
  CheckCircle2, 
  XCircle, 
  Info, 
  AlertTriangle 
} from "lucide-react"

// Enum for log types
enum LogType {
  INFO = "info",
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning"
}

// Enhanced log interface
interface Log {
  id: number;
  message: string;
  type: LogType;
  timestamp: Date;
}

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
  const [logs, setLogs] = useState<Log[]>([])
  const [networkData, setNetworkData] = useState(INITIAL_NETWORK)
  const [metrics, setMetrics] = useState({ time: 0, iterations: 0, memoryUsage: 0 })
  const [dqnParams, setDqnParams] = useState({ learningRate: 0.001, discountFactor: 0.99, explorationRate: 0.1 })
  const [showExplanation, setShowExplanation] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)
  const [intermediateSteps, setIntermediateSteps] = useState<string[][]>([])

  // Enhanced logging function
  const addLog = useCallback((message: string, type: LogType = LogType.INFO) => {
    const newLog: Log = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    }
    setLogs((prevLogs) => [...prevLogs, newLog])
  }, [])

  // Log rendering function
  const renderLogIcon = (type: LogType) => {
    switch (type) {
      case LogType.SUCCESS:
        return <CheckCircle2 className="text-green-500 w-5 h-5" />
      case LogType.ERROR:
        return <XCircle className="text-red-500 w-5 h-5" />
      case LogType.WARNING:
        return <AlertTriangle className="text-yellow-500 w-5 h-5" />
      default:
        return <Info className="text-blue-500 w-5 h-5" />
    }
  }

  // Clear logs function
  const clearLogs = () => {
    setLogs([])
  }

  useEffect(() => {
    setRoute([]) // Clear the route when algorithm changes
  }, [algorithm])

  const handleTrain = async () => {
    if (!start || !end) {
      toast.error("Please enter both start and end nodes")
      addLog("Training failed: Missing start or end node", LogType.ERROR)
      return
    }

    addLog("Starting model training...", LogType.INFO)

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

      addLog(`Training completed successfully for ${algorithm} model`, LogType.SUCCESS)
      addLog(`Model updated for nodes: ${start} -> ${end}`, LogType.INFO)
      toast.success("Training completed successfully!")
    } catch (error) {
      console.error("Error during training:", error)
      addLog("Training failed. Please check network configuration.", LogType.ERROR)
      toast.error("Training failed. Please try again.")
    }
  }

  const handleRoute = async () => {
    if (!start || !end) {
      toast.error("Please enter both start and end nodes")
      addLog("Route computation failed: Missing start or end node", LogType.ERROR)
      return
    }

    addLog(`Computing optimal route between ${start} and ${end}...`, LogType.INFO)

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

      addLog(`Optimal route found: ${data.route.join(" -> ")}`, LogType.SUCCESS)
      toast.success("Optimal route computed!")
      setShowExplanation(true)
      setAnimationStep(0)
    } catch (error) {
      console.error("Error getting route:", error)
      addLog("Route computation failed. Please verify network configuration.", LogType.ERROR)
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
    <div className="p-4 md:p-8">
      <ModeToggle />
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">RL-Based Network Routing</h1>

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
              <SelectContent className="z-50 bg-black text-white">
                {ALGORITHMS.map((alg) => (
                  <SelectItem key={alg} value={alg}>
                    {alg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {algorithm === "DQN" && (
              <div className="space-y-4 bg-black p-4 rounded-lg shadow-lg">
                {/* DQN Parameters Sliders (same as before) */}
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
            <NetworkVisualization 
              data={networkData} 
              route={route.slice(0, animationStep + 1)} 
              algorithm={algorithm} 
            />
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
            <CardTitle className="flex justify-between items-center">
              Logs
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearLogs}
                className="text-xs"
              >
                Clear Logs
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 w-full">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center space-x-2 mb-2 p-2 rounded-lg"
                >
                  {renderLogIcon(log.type)}
                  <div className="flex-grow">
                    <p className="text-sm">{log.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant={log.type === LogType.ERROR ? "destructive" : "secondary"}>
                    {log.type}
                  </Badge>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
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