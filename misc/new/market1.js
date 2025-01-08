"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { RefreshCcw } from "lucide-react"

const VoteCard = ({ title, votes, onVote, color }) => (
  <div
    className={`relative bg-gradient-to-b from-[#232344] to-[#1e1e38] rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
  >
    <div
      className={`absolute inset-0 bg-gradient-to-r from-${color}/10 to-transparent opacity-50 rounded-xl pointer-events-none`}
    />
    <h2
      className={`text-4xl font-bold mb-6 text-center bg-gradient-to-r from-${color} to-white bg-clip-text text-transparent`}
    >
      {title}
    </h2>
    <p className="text-sm text-gray-300 mb-4 text-center">
      Your Total Vote: {votes.toFixed(12)} $DUMPET
    </p>
    <button
      onClick={onVote}
      className={`w-full bg-gradient-to-r from-${color} to-${color}/80 hover:to-${color} py-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] group shadow-lg hover:shadow-${color}/20`}
    >
      <RefreshCcw className="w-5 h-5 transition-transform group-hover:rotate-180 duration-700" />
      <span className="font-semibold text-lg">Vote</span>
    </button>
    <div className="mt-6 pt-6 border-t border-[#2f2f5a]/30">
      <p className="text-sm text-gray-300 flex items-center justify-center gap-2">
        <RefreshCcw size={16} className="opacity-50" />
        <span className="opacity-75">TOTAL VOTES:</span>
        <span className="font-medium">{votes.toFixed(12)} $DUMPET</span>
      </p>
    </div>
  </div>
)

export default function Home() {
  const [voteA, setVoteA] = useState(0)
  const [voteB, setVoteB] = useState(1)

  const data = [
    { name: "ao", value: voteA },
    { name: "ar", value: voteB },
  ]

  const COLORS = ["#FF6B6B", "#4D96FF"]

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Voting Dashboard
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <VoteCard
              title="ao"
              votes={voteA}
              onVote={() => setVoteA(voteA + 1)}
              color="rose-500"
            />
            <div className="text-center text-sm text-gray-400">versus</div>
            <VoteCard
              title="ar"
              votes={voteB}
              onVote={() => setVoteB(voteB + 1)}
              color="blue-500"
            />
          </div>

          <div className="bg-[#232344] rounded-xl p-6 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
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
          </div>
        </div>
      </div>
    </div>
  )
}
