import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import {
  ArrowUpCircle,
  RefreshCcw,
  Vote,
  Activity,
  MessageCircle,
  Wallet,
  Clock,
  Hash,
  User,
  Layers,
  Calendar,
  XCircle,
  CheckCircle,
  CopyIcon,
  ExternalLink,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

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
        <div className="w-full">
          <input
            type="number"
            value={voteAmount}
            onChange={(e) =>
              setVoteAmount(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-full bg-transparent text-center border border-[#3a3a6a] rounded-md p-1 text-lg min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent hover:border-blue-400 transition-colors"
          />
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
            stroke="none"
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

const ChatSection = () => {
  const [chats, setChats] = useState([
    {
      id: 1,
      author: "0x1234...5678",
      content: "Great initiative!",
      timestamp: "Tue, Jan 07, 2025, 18:08",
    },
    {
      id: 2,
      author: "0x8765...4321",
      content: "I think ar will win.",
      timestamp: "Tue, Jan 07, 2025, 18:09",
    },
  ])
  const [newChat, setNewChat] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newChat.trim()) {
      const newChatObj = {
        id: chats.length + 1,
        author: "0xYOUR...WALLET", // Replace with actual wallet address
        content: newChat.trim(),
        timestamp: new Date().toLocaleString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      }
      setChats([...chats, newChatObj])
      setNewChat("")
    }
  }

  return (
    <div className="space-y-4 pt-6 text-gray-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Type your message..."
          value={newChat}
          onChange={(e) => setNewChat(e.target.value)}
          className="w-full bg-[#1e1e38] text-gray-100 border-[#3a3a6a] focus:border-indigo-400"
        />
        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 text-gray-100 font-semibold py-2 px-4 rounded-md shadow-md hover:shadow-lg"
        >
          Send chat
        </Button>
      </form>
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="py-2 border-b border-[#3a3a6a] last:border-b-0"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">{chat.author}</span>
              <span className="text-xs text-gray-400">{chat.timestamp}</span>
            </div>
            <p className="text-gray-200 break-words">{chat.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const InfoContent = ({ title }) => {
  const [showBalances, setShowBalances] = useState(false)

  const userBalances = [
    {
      address: "0x1234...5678",
      balance: 10001000100010001000,
      vote: "Option A",
    },
    {
      address: "0x8765...4321",
      balance: 7501000100010001000,
      vote: "Option B",
    },
    { address: "0x2468...1357", balance: 500, vote: "Option A" },
    { address: "0x1357...2468", balance: 250, vote: "Option B" },
  ]

  return (
    <div className="bg-gradient-to-br from-[#232344] to-[#2a2a5a] p-6 rounded-lg space-y-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-center text-gray-200 mb-4">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoItem
          icon={Clock}
          label="Expires on"
          value="Tue, Jan 07, 2025, 18:08"
        />
        <InfoItem
          icon={Hash}
          label="Market ProcessId"
          value="process_1234567890"
          copyable={true}
          link="https://ao.link/#/entity/replacethisprocessid"
        />
        <InfoItem
          icon={Hash}
          label="Bet Token ProcessId"
          value="token_9876543210"
          copyable={true}
          link="https://ao.link/#/entity/replacethisprocessid"
        />
        <InfoItem
          icon={User}
          label="Creator"
          value="0x1234...5678"
          copyable={true}
          link="https://ao.link/#/entity/replacethisprocessid"
        />
        <InfoItem icon={Layers} label="BlockHeight" value="1234567" />
        <InfoItem
          icon={Calendar}
          label="Block Timestamp"
          value="Tue, Jan 08, 2025, 14:12"
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
        <ActionButton
          text="Withdraw AO"
          color="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200"
          icon={ArrowUpCircle}
        />
        <ActionButton
          text="Cancel my votes"
          color="bg-amber-600/20 hover:bg-amber-600/30 text-amber-200"
          icon={XCircle}
        />
        <ActionButton
          text="Conclude"
          color="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200"
          icon={CheckCircle}
        />
      </div>
      <div className="mt-8">
        <button
          onClick={() => setShowBalances(!showBalances)}
          className="w-full bg-[#3a3a6a] text-gray-200 px-4 py-2 rounded-md hover:bg-[#4a4a7a] transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
        >
          <Wallet size={16} />
          {showBalances ? "Hide" : "Show"} User Balances
        </button>
        {showBalances && (
          <div className="mt-4 bg-[#2a2a4a] rounded-md p-3 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Option A", "Option B"].map((option, index) => (
                <div key={option} className="space-y-2">
                  <h3
                    className={`text-sm font-medium mb-2 ${
                      index === 0 ? "text-red-400" : "text-blue-400"
                    }`}
                  >
                    {option} Votes
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-400">
                          <th className="pb-2 pr-4 font-normal">
                            Wallet Address
                          </th>
                          <th className="pb-2 font-normal">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userBalances
                          .filter((user) => user.vote === option)
                          .map((user, userIndex) => (
                            <tr
                              key={userIndex}
                              className="border-t border-gray-700"
                            >
                              <td className="py-2 pr-4 text-gray-300">
                                {user.address}
                              </td>
                              <td className="py-2 text-gray-300">
                                {user.balance} $DUMPET
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const InfoItem = ({
  icon: Icon,
  label,
  value,
  copyable = false,
  link = "",
}) => {
  const handleCopy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(value)
    // You might want to add a toast notification here to inform the user that the value has been copied
  }

  const handleLink = (e) => {
    e.stopPropagation()
    if (link) {
      window.open(link, "_blank")
    }
  }

  return (
    <div className="bg-[#1e1e38] p-3 rounded-md flex items-center space-x-3 border border-[#3a3a6a]">
      <Icon size={20} className="text-gray-300 flex-shrink-0" />
      <div className="flex-grow min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-200 truncate">{value}</p>
      </div>
      <div className="flex-shrink-0 flex space-x-2">
        {copyable && (
          <CopyIcon
            size={16}
            className="text-gray-400 cursor-pointer hover:text-gray-200 transition-colors"
            onClick={handleCopy}
          />
        )}
        {link && (
          <ExternalLink
            size={16}
            className="text-gray-400 cursor-pointer hover:text-gray-200 transition-colors"
            onClick={handleLink}
          />
        )}
      </div>
    </div>
  )
}

const ActionButton = ({ text, color, icon: Icon }) => (
  <button
    className={`${color} px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 text-sm`}
  >
    <Icon size={16} />
    {text}
  </button>
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
            <InfoContent title="Market Information" />
          </TabsContent>
          <TabsContent value="chat">
            <ChatSection />
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
