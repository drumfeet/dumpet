import React from "react"
import VoteCard from "./VoteCard"
import { Share2, Link } from "lucide-react"
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useAppContext } from "@/context/AppContext"
import { useToast } from "@chakra-ui/react"
import {
  createDataItemSigner,
  message,
  result,
  dryrun,
} from "@permaweb/aoconnect"

const VoteInput = ({ voteAmount, setVoteAmount }) => (
  <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
    <span className="text-sm text-gray-300">Set Voting Amount</span>
    <div className="w-full">
      <input
        type="number"
        value={voteAmount}
        onChange={(e) =>
          setVoteAmount(Math.max(1, parseInt(e.target.value) || 1))
        }
        className="w-full bg-transparent text-center border border-gray-600 rounded-md p-1 text-lg min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent hover:border-blue-400 transition-colors"
      />
    </div>
  </div>
)

const ShareButtons = () => {
  const handleTweetShare = () => {
    const text = `Check out this market on dumpet.fun - `
    const url = window.location.href
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, "_blank")
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
  }

  return (
    <div className="flex justify-end gap-4">
      <button
        className="p-2 rounded-md hover:bg-gray-700 transition-colors"
        onClick={handleTweetShare}
      >
        <Share2 className="w-5 h-5 text-gray-300" />
      </button>
      <button
        className="p-2 rounded-md hover:bg-gray-700 transition-colors"
        onClick={handleCopyLink}
      >
        <Link className="w-5 h-5 text-gray-300" />
      </button>
    </div>
  )
}

const ChartLegend = ({ optionA, optionB }) => (
  <div className="flex gap-4">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
      <span className="text-xs font-medium">{optionA}</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
      <span className="text-xs font-medium">{optionB}</span>
    </div>
  </div>
)

const VoteContent = ({
  totalBalanceVoteA = 0,
  totalBalanceVoteB = 0,
  userBalanceVoteA = 0,
  userBalanceVoteB = 0,
  voteAmount = 1,
  setUserBalanceVoteA,
  setUserBalanceVoteB,
  setTotalBalanceVoteA,
  setTotalBalanceVoteB,
  setUserDepositBalance,
  setVoteAmount,
  marketInfo = {},
  tokenSymbol = "DUMPET",
  tokenDenomination,
  pid,
}) => {
  const {
    connectWallet,
    divideByPower,
    multiplyByPower,
    handleMessageResultError,
  } = useAppContext()

  const toast = useToast()

  const handleVoteA = async () => {
    await voteA()
  }

  const handleVoteB = async () => {
    await voteB()
  }

  const voteA = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }

    const _amount = multiplyByPower(voteAmount)
    console.log("_amount", _amount)

    try {
      const messageId = await message({
        process: pid,
        tags: [
          {
            name: "Action",
            value: "VoteA",
          },
          {
            name: "Quantity",
            value: _amount.toString(),
          },
        ],
        signer: createDataItemSigner(globalThis.arweaveWallet),
      })
      console.log("messageId", messageId)

      const _result = await result({
        message: messageId,
        process: pid,
      })
      console.log("_result", _result)
      if (handleMessageResultError(_result)) return

      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      console.log("jsonData", jsonData)

      setTotalBalanceVoteA(jsonData?.TotalBalanceVoteA)
      setUserBalanceVoteA(jsonData?.BalanceVoteA)
      setUserDepositBalance(Number(jsonData?.NewBalance))

      toast({
        description: "Vote A success",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    } catch (error) {
      toast({
        description: error.toString(),
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
      console.error(error)
    }
  }

  const voteB = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }

    const _amount = multiplyByPower(voteAmount)
    console.log("_amount", _amount)

    try {
      const messageId = await message({
        process: pid,
        tags: [
          {
            name: "Action",
            value: "VoteB",
          },
          {
            name: "Quantity",
            value: _amount.toString(),
          },
        ],
        signer: createDataItemSigner(globalThis.arweaveWallet),
      })
      console.log("messageId", messageId)

      const _result = await result({
        message: messageId,
        process: pid,
      })
      console.log("_result", _result)
      if (handleMessageResultError(_result)) return

      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      console.log("jsonData", jsonData)

      setTotalBalanceVoteB(jsonData?.TotalBalanceVoteB)
      setUserBalanceVoteB(jsonData?.BalanceVoteB)
      setUserDepositBalance(Number(jsonData?.NewBalance))

      toast({
        description: "Vote B success",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    } catch (error) {
      toast({
        description: error.toString(),
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
      console.error(error)
    }
  }

  const chartData =
    totalBalanceVoteA <= 0 && totalBalanceVoteB <= 0
      ? [
          { name: marketInfo?.OptionA, value: 1 },
          { name: marketInfo?.OptionB, value: 1 },
        ]
      : [
          {
            name: marketInfo?.OptionA,
            value: Number(divideByPower(totalBalanceVoteA, tokenDenomination)),
          },
          {
            name: marketInfo?.OptionB,
            value: Number(divideByPower(totalBalanceVoteB, tokenDenomination)),
          },
        ]

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-8 px-4 sm:px-0 pt-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-white break-words">
        {marketInfo?.Title}
      </h1>

      <div className="bg-slate-900 p-4 sm:p-6 rounded-lg">
        <VoteInput voteAmount={voteAmount} setVoteAmount={setVoteAmount} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <VoteCard
            title={marketInfo?.OptionA}
            tokenSymbol={tokenSymbol}
            votes={userBalanceVoteA}
            totalVotes={totalBalanceVoteA}
            tokenDenomination={tokenDenomination}
            onVote={handleVoteA}
            color={{
              border: "border-red-400/20",
              hoverBorder: "hover:border-red-400/40",
              bg: "bg-red-400",
              hoverBg: "hover:bg-red-400/90",
            }}
          />
          <VoteCard
            title={marketInfo?.OptionB}
            tokenSymbol={tokenSymbol}
            votes={userBalanceVoteB}
            totalVotes={totalBalanceVoteB}
            tokenDenomination={tokenDenomination}
            onVote={handleVoteB}
            color={{
              border: "border-blue-400/20",
              hoverBorder: "hover:border-blue-400/40",
              bg: "bg-blue-400",
              hoverBg: "hover:bg-blue-400/90",
            }}
          />
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 flex flex-col h-96">
        <ShareButtons />

        <div className="flex-grow relative">
          <ResponsiveContainer width="100%" height="100%" className="flex-grow">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius="90%"
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
        </div>

        <ChartLegend
          optionA={marketInfo?.OptionA}
          optionB={marketInfo?.OptionB}
        />
      </div>
    </div>
  )
}

export default VoteContent
