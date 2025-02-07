"use client"

import React, { useRef, useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import type { ForceGraphMethods } from "react-force-graph-2d"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

interface NetworkVisualizationProps {
  data: {
    nodes: { id: string; group?: number; x?: number; y?: number }[]
    links: { source: string; target: string; value?: number }[]
  }
  route: string[]
  algorithm: string
  intermediateSteps?: string[][]
}

const NODE_R = 5
const COLORS = {
  RL: "#4285F4",
  DQN: "#EA4335",
}

export default function NetworkVisualization({ data, route, algorithm, intermediateSteps }: NetworkVisualizationProps) {
  const fgRef = useRef<ForceGraphMethods>()
  const nodesWithPositions = useRef(new Map())
  const [currentStep, setCurrentStep] = useState(0)

  const highlightNodes = useMemo(() => {
    if (intermediateSteps && intermediateSteps.length > 0) {
      return new Set(intermediateSteps[currentStep])
    }
    return new Set(route)
  }, [route, intermediateSteps, currentStep])

  const highlightLinks = useMemo(() => {
    const links = new Set()
    const currentRoute = intermediateSteps && intermediateSteps.length > 0 ? intermediateSteps[currentStep] : route
    for (let i = 0; i < currentRoute.length - 1; i++) {
      links.add(`${currentRoute[i]}_${currentRoute[i + 1]}`)
    }
    return links
  }, [route, intermediateSteps, currentStep])

  useEffect(() => {
    fgRef.current?.d3Force("charge")?.strength(-300)
    fgRef.current?.d3Force("link")?.distance(100)
  }, [])

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400)
    }
  }, [data])

  useEffect(() => {
    if (intermediateSteps && intermediateSteps.length > 0) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % intermediateSteps.length)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [intermediateSteps])

  const paintNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.id
    const fontSize = 12 / globalScale
    ctx.font = `${fontSize}px Inter, sans-serif`
    const textWidth = ctx.measureText(label).width
    const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.2)

    ctx.fillStyle = highlightNodes.has(node.id) ? "#FF5722" : COLORS[algorithm as keyof typeof COLORS]
    ctx.beginPath()
    ctx.arc(node.x, node.y, NODE_R, 0, 2 * Math.PI, false)
    ctx.fill()

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions)

    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#000"
    ctx.fillText(label, node.x, node.y)

    // Store node positions
    nodesWithPositions.current.set(node.id, { x: node.x, y: node.y })
  }

  const paintLink = (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const start = link.source
    const end = link.target

    const isHighlighted = highlightLinks.has(`${start.id}_${end.id}`) || highlightLinks.has(`${end.id}_${start.id}`)
    ctx.strokeStyle = isHighlighted ? "#FF5722" : "#999"
    ctx.lineWidth = isHighlighted ? 3 / globalScale : 1 / globalScale
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()

    if (isHighlighted) {
      const particlePos = link.__particlePos || 0
      const dx = end.x - start.x
      const dy = end.y - start.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist) {
        const x = start.x + dx * particlePos
        const y = start.y + dy * particlePos

        ctx.fillStyle = "#FF5722"
        ctx.beginPath()
        ctx.arc(x, y, 3 / globalScale, 0, 2 * Math.PI, false)
        ctx.fill()
      }

      link.__particlePos = (particlePos + 0.01) % 1
    }
  }

  return (
    <div>
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeRelSize={NODE_R}
        nodeCanvasObject={paintNode}
        linkCanvasObject={paintLink}
        linkDirectionalParticles={4}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.01}
        d3VelocityDecay={0.3}
        cooldownTime={3000}
        onEngineStop={() => fgRef.current?.zoomToFit(400)}
        nodePositionUpdate={(node, x, y) => {
          const oldPos = nodesWithPositions.current.get(node.id)
          if (oldPos) {
            return { x: oldPos.x, y: oldPos.y }
          }
          return undefined // use new position
        }}
        width={600}
        height={400}
      />
      {intermediateSteps && (
        <div className="mt-2 text-sm text-gray-600">
          Step {currentStep + 1} of {intermediateSteps.length}
        </div>
      )}
    </div>
  )
}

