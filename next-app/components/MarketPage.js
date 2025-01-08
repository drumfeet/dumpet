import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import {
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCcw,
  Vote,
  Activity,
  MessageCircle,
  Wallet,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const VoteCard = ({ title, votes, onVote, color }) => (
  <div
    className={`bg-[#232344] rounded-xl p-6 border-2 ${color.border} ${color.hoverBorder} transition-colors`}
  >
    <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>
    <p className="text-sm text-gray-300 mb-4">
      Your Total Vote: {votes.toFixed(12)} $DUMPET
    </p>
    <button
      onClick={onVote}
      className={`w-full ${color.bg} ${color.hoverBg} py-4 rounded-lg flex items-center justify-center gap-2 transition-colors`}
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

const VoteContent = ({
  aoVotes,
  arVotes,
  voteAmount,
  setAoVotes,
  setArVotes,
  setVoteAmount,
}) => (
  <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-8 px-4 sm:px-0">
    <h1 className="text-2xl sm:text-3xl font-bold text-center text-white break-words">
      Which token will pump in 2025?
    </h1>
    <div className="bg-[#232344] p-4 sm:p-6 rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <span className="text-sm text-gray-300">Set Voting Amount</span>
        <div className="flex items-center gap-2 w-full">
          <input
            type="number"
            value={voteAmount}
            onChange={(e) =>
              setVoteAmount(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="flex-grow bg-transparent text-center border border-[#3a3a6a] rounded-md p-1 text-lg min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent hover:border-blue-400 transition-colors"
          />
          <button
            onClick={() => setVoteAmount(Math.max(1, voteAmount - 1))}
            className="bg-[#2f2f5a] hover:bg-[#3a3a6a] text-white p-2 rounded-full transition-colors flex-shrink-0"
          >
            <ArrowDownCircle size={20} />
          </button>
          <button
            onClick={() => setVoteAmount(voteAmount + 1)}
            className="bg-[#2f2f5a] hover:bg-[#3a3a6a] text-white p-2 rounded-full transition-colors flex-shrink-0"
          >
            <ArrowUpCircle size={20} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <VoteCard
          title="ao"
          votes={aoVotes}
          onVote={() => setAoVotes(aoVotes + voteAmount)}
          color={{
            border: "border-red-400/20",
            hoverBorder: "hover:border-red-400/40",
            bg: "bg-red-400",
            hoverBg: "hover:bg-red-400/90",
          }}
        />
        <VoteCard
          title="ar"
          votes={arVotes}
          onVote={() => setArVotes(arVotes + voteAmount)}
          color={{
            border: "border-blue-400/20",
            hoverBorder: "hover:border-blue-400/40",
            bg: "bg-blue-400",
            hoverBg: "hover:bg-blue-400/90",
          }}
        />
      </div>
    </div>
    <div className="bg-[#232344] rounded-xl p-6 relative h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[
              { name: "ao", value: aoVotes || 1 },
              { name: "ar", value: arVotes || 1 },
            ]}
            cx="50%"
            cy="50%"
            innerRadius={0}
            outerRadius="80%"
            fill="#8884d8"
            dataKey="value"
            startAngle={90}
            endAngle={450}
          >
            {["#ff6b6b", "#4d7cfe"].map((color, index) => (
              <Cell key={`cell-${index}`} fill={color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-4 left-4 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#ff6b6b] rounded-sm"></div>
          <span className="text-xs font-medium">ao</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#4d7cfe] rounded-sm"></div>
          <span className="text-xs font-medium">ar</span>
        </div>
      </div>
    </div>
  </div>
)

const PlaceholderContent = ({ title }) => (
  <div className="h-[200px] flex items-center justify-center">
    <p className="text-gray-400">Coming soon: {title}</p>
  </div>
)

export default function MarketPage() {
  const [aoVotes, setAoVotes] = useState(0)
  const [arVotes, setArVotes] = useState(0)
  const [voteAmount, setVoteAmount] = useState(1)

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Tabs defaultValue="vote" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#232344]">
            <TabsTrigger
              value="vote"
              className="data-[state=active]:bg-[#2f2f5a]"
            >
              <Vote className="mr-2 h-4 w-4" />
              Vote
            </TabsTrigger>
            <TabsTrigger
              value="info"
              className="data-[state=active]:bg-[#2f2f5a]"
            >
              <Activity className="mr-2 h-4 w-4" />
              Info
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-[#2f2f5a]"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="balance"
              className="data-[state=active]:bg-[#2f2f5a]"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Balance
            </TabsTrigger>
          </TabsList>
          <TabsContent value="vote">
            <VoteContent
              aoVotes={aoVotes}
              arVotes={arVotes}
              voteAmount={voteAmount}
              setAoVotes={setAoVotes}
              setArVotes={setArVotes}
              setVoteAmount={setVoteAmount}
            />
          </TabsContent>
          <TabsContent value="info">
            <PlaceholderContent title="Info Feed" />
          </TabsContent>
          <TabsContent value="chat">
            <PlaceholderContent title="Chat Interface" />
          </TabsContent>
          <TabsContent value="balance">
            <div className="bg-[#232344] p-4 sm:p-6 rounded-lg space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="bg-[#2f2f5a] p-4 rounded-lg flex-1">
                  <p className="text-sm text-gray-400 mb-1">
                    Market Deposit Balance
                  </p>
                  <p className="text-lg sm:text-xl font-bold truncate">
                    500 $DUMPET
                  </p>
                </div>
                <div className="bg-[#2f2f5a] p-4 rounded-lg flex-1">
                  <p className="text-sm text-gray-400 mb-1">
                    Your Wallet Balance
                  </p>
                  <p className="text-lg sm:text-xl font-bold truncate">
                    500 $DUMPET
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="number"
                  placeholder="Amount"
                  className="flex-grow bg-transparent text-center border border-[#3a3a6a] rounded-md p-1 text-lg min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent hover:border-blue-400 transition-colors"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                    Deposit
                  </button>
                  <button className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
