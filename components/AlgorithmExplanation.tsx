import React from "react"

interface AlgorithmExplanationProps {
  algorithm: string
  route: string[]
  animationStep: number
  intermediateSteps: string[][]
}

export default function AlgorithmExplanation({
  algorithm,
  route,
  animationStep,
  intermediateSteps,
}: AlgorithmExplanationProps) {
  const explanations = {
    RL: "Reinforcement Learning (RL) finds the optimal path by learning from experience. It explores the network, receives rewards for efficient routes, and gradually improves its policy.",
    DQN: "Deep Q-Network (DQN) uses a neural network to estimate the value of actions in each state. It learns to choose actions that maximize long-term rewards, finding optimal routes in complex networks.",
  }

  const stepExplanations = {
    RL: [
      "Initialize Q-values for all state-action pairs",
      "Choose an action (exploration vs exploitation)",
      "Take the action and observe the reward",
      "Update Q-values based on the observed reward",
      "Repeat steps 2-4 until the goal is reached",
    ],
    DQN: [
      "Initialize the neural network",
      "Observe the current state",
      "Choose an action based on the network's output",
      "Take the action and observe the reward and next state",
      "Store the experience in replay memory",
      "Sample a batch from replay memory and train the network",
      "Repeat steps 2-6 until the goal is reached",
    ],
  }

  const intermediateStepExplanations = {
    RL: "RL explores different paths, sometimes taking suboptimal routes to learn. It gradually improves its policy based on rewards.",
    DQN: "DQN uses a neural network to estimate action values. It may explore suboptimal paths initially but converges to the optimal route over time.",
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{algorithm} Algorithm</h3>
      <p className="text-sm text-gray-600">{explanations[algorithm as keyof typeof explanations]}</p>
      <div className="mt-4">
        <h4 className="text-md font-semibold">Step-by-step process:</h4>
        <ol className="list-decimal list-inside space-y-2 mt-2">
          {stepExplanations[algorithm as keyof typeof stepExplanations].map((step, index) => (
            <li key={index} className={`text-sm ${index <= animationStep ? "text-black" : "text-gray-400"}`}>
              {step}
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-4">
        <h4 className="text-md font-semibold">Current route:</h4>
        <p className="text-sm">{route.slice(0, animationStep + 1).join(" -> ")}</p>
      </div>
      <div className="mt-4">
        <h4 className="text-md font-semibold">Intermediate steps:</h4>
        <p className="text-sm text-gray-600">
          {intermediateStepExplanations[algorithm as keyof typeof intermediateStepExplanations]}
        </p>
        <ol className="list-decimal list-inside space-y-2 mt-2">
          {intermediateSteps.map((step, index) => (
            <li key={index} className={`text-sm ${index <= animationStep ? "text-black" : "text-gray-400"}`}>
              {step.join(" -> ")}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

