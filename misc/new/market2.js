"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import {
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCcw,
  Share2,
} from "lucide-react"

const VoteCard = ({ title, votes, onVote, color }) => (
  <div
    className={`bg-[#232344] rounded-xl p-6 border-2 border-${color}/20 hover:border-${color}/40 transition-colors`}
  >
    <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>
    <p className="text-sm text-gray-300 mb-4">
      Your Total Vote: {votes.toFixed(12)} $DUMPET
    </p>
    <button
      onClick={onVote}
      className={`w-full bg-${color} hover:bg-${color}/90 py-4 rounded-lg flex items-center justify-center gap-2 transition-colors`}
    >
      Vote
    </button>
    <div className="mt-6 pt-6 border-t border-[#2f2f5a]">
      <p className="text-sm text-gray-300 flex items-center justify-center gap-2">
        <RefreshCcw size={16} />
        TOTAL VOTES: {votes.toFixed(12)} $DUMPET
      </p>
    </div>
  </div>
)

export default function Home() {
  const [aoVotes, setAoVotes] = useState(0)
  const [arVotes, setArVotes] = useState(0)
  const [voteAmount, setVoteAmount] = useState(1)

  const data = [
    { name: "ao", value: aoVotes || 1 },
    { name: "ar", value: arVotes || 1 },
  ]

  const COLORS = ["#ff6b6b", "#4d7cfe"]

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Voting Dashboard
          </h1>
          <p className="text-gray-300 mt-2">Cast your vote between ao and ar</p>
        </div>

        {/* Vote Amount Control */}
        <div className="bg-[#232344] p-4 rounded-lg max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Amount of Vote</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVoteAmount(Math.max(1, voteAmount - 1))}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <ArrowDownCircle size={20} />
              </button>
              <input
                type="number"
                value={voteAmount}
                onChange={(e) =>
                  setVoteAmount(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-20 bg-transparent text-center border border-[#2f2f5a] rounded-md p-1"
              />
              <button
                onClick={() => setVoteAmount(voteAmount + 1)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <ArrowUpCircle size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Voting Cards */}
          <div className="space-y-6">
            <VoteCard
              title="ao"
              votes={aoVotes}
              onVote={() => setAoVotes(aoVotes + voteAmount)}
              color="red-400"
            />

            <div className="text-center">
              <span className="px-6 py-2 bg-[#232344] rounded-full text-sm font-medium">
                versus
              </span>
            </div>

            <VoteCard
              title="ar"
              votes={arVotes}
              onVote={() => setArVotes(arVotes + voteAmount)}
              color="blue-400"
            />
          </div>

          {/* Right Column - Pie Chart */}
          <div className="bg-[#232344] rounded-xl p-6 relative min-h-[500px]">
            <button className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors">
              <Share2 size={20} />
            </button>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-6 left-6 flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#ff6b6b] rounded-sm"></div>
                <span className="text-sm font-medium">ao</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#4d7cfe] rounded-sm"></div>
                <span className="text-sm font-medium">ar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
