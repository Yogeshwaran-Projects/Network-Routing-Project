import { NextResponse } from "next/server"

function generateIntermediateSteps(algorithm: string, start: string, end: string) {
  const allNodes = ["A", "B", "C", "D", "E", "F", "G", "H"]
  const steps: string[][] = []

  switch (algorithm) {
    case "RL":
      // Simulate RL exploration
      steps.push([start])
      for (let i = 0; i < 3; i++) {
        const lastStep = steps[steps.length - 1]
        const randomNode = allNodes[Math.floor(Math.random() * allNodes.length)]
        steps.push([...lastStep, randomNode])
      }
      steps.push([...steps[steps.length - 1], end])
      break
    case "DQN":
      // Simulate DQN's Q-value updates
      steps.push([start])
      for (let i = 0; i < 3; i++) {
        const lastStep = steps[steps.length - 1]
        const nextNode = allNodes[(allNodes.indexOf(lastStep[lastStep.length - 1]) + 1) % allNodes.length]
        steps.push([...lastStep, nextNode])
      }
      steps.push([...steps[steps.length - 1], end])
      break
    case "Dijkstra":
      // Simulate Dijkstra's systematic exploration
      steps.push([start])
      const path = allNodes.slice(allNodes.indexOf(start), allNodes.indexOf(end) + 1)
      for (const node of path) {
        steps.push([...steps[steps.length - 1], node])
      }
      break
    case "A*":
      // Simulate A*'s heuristic-guided search
      steps.push([start])
      const directPath = allNodes.slice(
        Math.min(allNodes.indexOf(start), allNodes.indexOf(end)),
        Math.max(allNodes.indexOf(start), allNodes.indexOf(end)) + 1,
      )
      for (const node of directPath) {
        steps.push([...steps[steps.length - 1], node])
      }
      break
  }

  return steps
}

export async function POST(req: Request) {
  const { start, end, algorithm } = await req.json()

  // Simulate routing process
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const intermediateSteps = generateIntermediateSteps(algorithm, start, end)
  const route = intermediateSteps[intermediateSteps.length - 1]

  // Generate mock metrics
  const metrics = {
    time: Math.random() * 100,
    iterations: Math.floor(Math.random() * 20),
    memoryUsage: Math.random() * 5,
  }

  return NextResponse.json({ route, intermediateSteps, metrics })
}

