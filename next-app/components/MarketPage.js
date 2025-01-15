import { useState, useEffect } from "react"
import { useAppContext } from "@/context/AppContext"
import { Spinner, ChakraProvider } from "@chakra-ui/react"
import ChatBox from "@/components/ChatBox"
import VoteContent from "./VoteContent"
import InfoContent from "./InfoContent"
import {
  createDataItemSigner,
  message,
  result,
  dryrun,
} from "@permaweb/aoconnect"
import {
  Vote,
  Activity,
  MessageCircle,
  Wallet,
  ExternalLink,
  Copy,
  SendHorizontal,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function MarketPage({ pid }) {
  const {
    connectWallet,
    isConnected,
    handleMessageResultError,
  } = useAppContext()

  const [activeIndex, setActiveIndex] = useState(0)
  const [totalBalanceVoteA, setTotalBalanceVoteA] = useState(0)
  const [totalBalanceVoteB, setTotalBalanceVoteB] = useState(0)
  const [voteAmount, setVoteAmount] = useState(1)
  const [showChatBox, setShowChatBox] = useState(false)
  const [marketData, setMarketData] = useState()
  const [optionA, setOptionA] = useState("")
  const [optionB, setOptionB] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tokenProcessId, setTokenProcessId] = useState("")
  const [tokenDenomination, setTokenDenomination] = useState(0)
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [tokenLogo, setTokenLogo] = useState("")
  const [tokenName, setTokenName] = useState("")
  const [userDepositBalance, setUserDepositBalance] = useState(null) // must be a number
  const [userBalanceVoteA, setUserBalanceVoteA] = useState(0)
  const [userBalanceVoteB, setUserBalanceVoteB] = useState(0)

  const updateUserBalances = async (jsonData) => {
    setUserDepositBalance(Number(jsonData?.UserDepositBalance))
    setUserBalanceVoteA(jsonData?.BalanceVoteA)
    setUserBalanceVoteB(jsonData?.BalanceVoteB)
    console.log("updateUserBalances() jsonData", jsonData)
  }

  const getUserBalancesAllVotes = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }
    const _userAddress = _connected.userAddress

    try {
      console.log("UserBalancesAllVotes pid", pid)
      const _result = await dryrun({
        process: pid,
        tags: [
          { name: "Action", value: "UserBalancesAllVotes" },
          { name: "Recipient", value: _userAddress },
        ],
      })
      console.log("UserBalancesAllVotes _result", _result)
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      console.log("UserBalancesAllVotes jsonData", jsonData)
      updateUserBalances(jsonData)
    } catch (error) {
      console.error(error)
    } finally {
      //setIsFetchingData(false)
    }
  }

  const getMarketInfo = async () => {
    console.log("getMarketInfo pid", pid)
    try {
      const result = await dryrun({
        process: pid,
        tags: [{ name: "Action", value: "GetMarketInfo" }],
      })

      console.log("result", result)
      const _jsonData = JSON.parse(result?.Messages[0]?.Data)
      setShowChatBox(_jsonData.ChatEnabled ? true : false)
      console.log("_jsonData", _jsonData)
      setMarketData(_jsonData)
      setOptionA(_jsonData?.MarketInfo?.OptionA)
      setOptionB(_jsonData?.MarketInfo?.OptionB)
      setTokenProcessId(_jsonData?.MarketInfo?.TokenTxId)
      setTokenDenomination(_jsonData?.MarketInfo?.Denomination)
      setTokenSymbol(_jsonData?.MarketInfo?.Ticker)
      setTokenLogo(_jsonData?.MarketInfo?.Logo)
      setTokenName(_jsonData?.MarketInfo?.TokenName)
      updateBalances(_jsonData)
    } catch (error) {
      console.error(error)
    }
  }

  const getTokenInfo = async () => {
    try {
      const _result = await dryrun({
        process: tokenProcessId,
        tags: [{ name: "Action", value: "Info" }],
      })
      console.log("_result", _result)

      const denominationTag = _result?.Messages?.[0]?.Tags.find(
        (tag) => tag.name === "Denomination"
      )
      setTokenDenomination(
        isNaN(Number(denominationTag?.value))
          ? DEFAULT_PRECISION
          : Number(denominationTag?.value)
      )

      const tickerTag = _result?.Messages?.[0]?.Tags.find(
        (tag) => tag.name === "Ticker"
      )
      setTokenSymbol(tickerTag?.value ?? "")

      const logoTag = _result?.Messages?.[0]?.Tags.find(
        (tag) => tag.name === "Logo"
      )
      setTokenLogo(logoTag?.value ?? "")

      const nameTag = _result?.Messages?.[0]?.Tags.find(
        (tag) => tag.name === "Name"
      )
      setTokenName(nameTag?.value ?? "")
    } catch (error) {
      console.error(error)
    }
  }

  const updateBalances = async (jsonData) => {
    setTotalBalanceVoteA(parseInt(jsonData?.TotalBalanceVoteA))
    setTotalBalanceVoteB(parseInt(jsonData?.TotalBalanceVoteB))
    console.log("updateBalances() jsonData", jsonData)
  }

  const handleTabChange = async (value) => {
    setActiveIndex(value);
    if (value === "vote" || value === "info") {
      if (!marketData && pid) {
        setIsLoading(true)
        await getMarketInfo()
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    console.log("pid", pid)
    if (pid) {
      ;(async () => {
        await getMarketInfo()
      })()
    }
  }, [pid])

  useEffect(() => {
    if (tokenProcessId) {
      ;(async () => {
        if (!tokenSymbol) {
          await getTokenInfo()
        }
      })()
    }
  }, [tokenProcessId])

  useEffect(() => {
    console.log("pid", pid)
    if (isConnected) {
      ;(async () => {
        await getUserBalancesAllVotes()
      })()
    }
  }, [isConnected])

  return (
    <ChakraProvider>
      <div className="min-h-screen bg-[#1a1a2e] text-white p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <Tabs defaultValue="vote" className="w-full" onValueChange={handleTabChange}>
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
              {isLoading ? (
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="purple.500"
                  size="xl"
                />
              ) : (
                <VoteContent
                  totalBalanceVoteB={totalBalanceVoteB}
                  totalBalanceVoteA={totalBalanceVoteA}
                  userBalanceVoteA={userBalanceVoteA}
                  userBalanceVoteB={userBalanceVoteB}
                  setUserBalanceVoteA={setUserBalanceVoteA}
                  setUserBalanceVoteB={setUserBalanceVoteB}
                  setUserDepositBalance={setUserDepositBalance}
                  voteAmount={voteAmount}
                  tokenDenomination={tokenDenomination}
                  setTotalBalanceVoteA={setTotalBalanceVoteA}
                  setTotalBalanceVoteB={setTotalBalanceVoteB}
                  setVoteAmount={setVoteAmount}
                  marketInfo={marketData?.MarketInfo}
                  tokenSymbol={tokenSymbol}
                  pid={pid}
                />
              )}
            </TabsContent>
            <TabsContent value="info">
              <InfoContent
                title="Market Information"
                duration={marketData?.MarketInfo?.Duration}
                pid={pid}
                betTokenId={marketData?.MarketInfo?.TokenTxId}
                creator={marketData?.Creator}
                blockHeight={marketData?.MarketInfo?.BlockHeight}
                timestamp={marketData?.MarketInfo?.Timestamp}
              />
            </TabsContent>
            <TabsContent value="chat">
              { showChatBox ? <ChatBox pid={pid}/> : <p>Chat is not enabled for this market</p>}
            </TabsContent>
            <TabsContent value="balance">
              <div className="mt-8 bg-[#232344] p-4 sm:p-4 rounded-lg space-y-8">
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
                    <button className="w-full bg-emerald-600/20 px-4 py-2 rounded-md transition-colors hover:bg-emerald-600/30 text-emerald-200">
                      Deposit
                    </button>
                    <button className="w-full bg-rose-600/20 px-4 py-2 rounded-md transition-colors hover:bg-rose-600/30 text-rose-200">
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ChakraProvider>
  )
}
