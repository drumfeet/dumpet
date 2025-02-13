import { useState, useEffect } from "react"
import { useAppContext } from "@/context/AppContext"
import {
  Spinner,
  ChakraProvider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
} from "@chakra-ui/react"
import ChatTab from "@/components/ChatTab"
import VoteContent from "./VoteContent"
import InfoContent from "./InfoContent"
import {
  createDataItemSigner,
  message,
  result,
  dryrun,
} from "@permaweb/aoconnect"
import { Vote, Activity, MessageCircle, Wallet } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const DEFAULT_PRECISION = 12

export default function MarketPage({ pid }) {
  const {
    connectWallet,
    isConnected,
    multiplyByPower,
    handleMessageResultError,
    divideByPower,
  } = useAppContext()

  const toast = useToast()

  const [activeIndex, setActiveIndex] = useState(0)
  const [totalBalanceVoteA, setTotalBalanceVoteA] = useState(0)
  const [totalBalanceVoteB, setTotalBalanceVoteB] = useState(0)
  const [voteAmount, setVoteAmount] = useState(1)
  const [amount, setAmount] = useState(1)
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
  const [userWalletBalance, setUserWalletBalance] = useState(0)
  const [userDepositBalance, setUserDepositBalance] = useState(null) // must be a number
  const [userBalanceVoteA, setUserBalanceVoteA] = useState(0)
  const [userBalanceVoteB, setUserBalanceVoteB] = useState(0)
  const [allVotesBalances, setAllVotesBalances] = useState([])

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
      toast({
        description: "Error getting market info",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      })
      console.error(error)
    }
  }

  const deposit = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }

    const _amount = multiplyByPower(amount)
    console.log("_amount", _amount)

    try {
      const messageId = await message({
        process: tokenProcessId,
        tags: [
          {
            name: "Action",
            value: "Transfer",
          },
          {
            name: "Quantity",
            value: _amount.toString(),
          },
          {
            name: "Recipient",
            value: pid,
          },
        ],
        signer: createDataItemSigner(globalThis.arweaveWallet),
      })
      console.log("messageId", messageId)

      const _result = await result({
        message: messageId,
        process: tokenProcessId,
      })
      console.log("_result", _result)
      if (handleMessageResultError(_result)) return

      await getUserBalancesAllVotes()
      await getUserWalletBalance()
      console.log("userDepositBalance", userDepositBalance)
      console.log("_amount", _amount)
      toast({
        description: "Transaction completed",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    } catch (error) {
      console.error(error)
    }
  }

  const withdraw = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }

    const _amount = multiplyByPower(amount)
    console.log("_amount", _amount)

    try {
      const messageId = await message({
        process: pid,
        tags: [
          {
            name: "Action",
            value: "Withdraw",
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

      console.log("userDepositBalance", userDepositBalance)
      console.log("_amount", _amount)
      const _updatedBalance = userDepositBalance - _amount
      console.log("_updatedBalance", _updatedBalance)
      setUserDepositBalance(_updatedBalance)

      toast({
        description: "Withdraw success",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
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

  const getAllVoteBalances = async () => {
    try {
      const _connected = await connectWallet()
      if (_connected.success === false) {
        return
      }
      const _result = await dryrun({
        process: pid,
        tags: [{ name: "Action", value: "AllVotesBalances" }],
      })
      const data = JSON.parse(_result?.Messages?.[0]?.Data)
      const allData = []
      Object.keys(data.BalancesVoteA).forEach((key) => {
        allData.push({
          address: key,
          balance: data.BalancesVoteA[key],
          vote: optionA,
        })
      })
      Object.keys(data.BalancesVoteB).forEach((key) => {
        allData.push({
          address: key,
          balance: data.BalancesVoteB[key],
          vote: optionB,
        })
      })
      setAllVotesBalances(allData)
    } catch (error) {
      toast({
        description: "Error getting all vote balances",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    }
  }

  const getUserWalletBalance = async () => {
    try {
      const _connected = await connectWallet()
      if (_connected.success === false) {
        return
      }
      const _userAddress = _connected.userAddress
      const _result = await dryrun({
        process: tokenProcessId,
        tags: [
          { name: "Action", value: "Balance" },
          { name: "Recipient", value: _userAddress },
        ],
      })
      console.log("_result", _result)
      if (_result.error) {
        throw new Error(_result.error)
      }
      setUserWalletBalance(_result?.Messages?.[0]?.Data || 0)
    } catch (error) {
      toast({
        description: "Error getting user wallet balance",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    }
  }

  const updateBalances = async (jsonData) => {
    setTotalBalanceVoteA(parseInt(jsonData?.TotalBalanceVoteA))
    setTotalBalanceVoteB(parseInt(jsonData?.TotalBalanceVoteB))
    console.log("updateBalances() jsonData", jsonData)
  }

  const handleTabChange = async (value) => {
    setActiveIndex(value)
    if (value === "vote" || value === "info") {
      if (!marketData && pid) {
        setIsLoading(true)
        await getMarketInfo()
        setIsLoading(false)
      }
    }
  }

  const cancelVote = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }

    try {
      const messageId = await message({
        process: pid,
        tags: [{ name: "Action", value: "CancelVote" }],
        signer: createDataItemSigner(globalThis.arweaveWallet),
      })
      console.log("messageId", messageId)

      const _result = await result({
        message: messageId,
        process: pid, // market processId
      })
      console.log("_result", _result)
      if (handleMessageResultError(_result)) return

      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      console.log("jsonData", jsonData)

      setTotalBalanceVoteA(jsonData?.TotalBalanceVoteA)
      setTotalBalanceVoteB(jsonData?.TotalBalanceVoteB)
      setUserBalanceVoteA(0)
      setUserBalanceVoteB(0)
      setUserDepositBalance(Number(jsonData?.NewBalance))

      toast({
        description: "Cancel Vote success",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    } catch (error) {
      console.error(error)
    }
  }

  const conclude = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }

    try {
      console.log("conclude pid", pid)
      const messageId = await message({
        process: pid,
        tags: [{ name: "Action", value: "Conclude" }],
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
      toast({
        description: jsonData.Message,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    } catch (error) {
      console.error(error)
    }
  }

  const withdrawRewards = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }

    try {
      const messageId = await message({
        process: pid,
        tags: [{ name: "Action", value: "WithdrawRewards" }],
        signer: createDataItemSigner(globalThis.arweaveWallet),
      })
      console.log("messageId", messageId)

      const _result = await result({
        message: messageId,
        process: pid,
      })
      console.log("_result", _result)
      if (handleMessageResultError(_result)) return

      toast({
        description: "Withdraw AO success",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    } catch (error) {
      console.error(error)
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
    const fetchUserVoteBalances = async () => {
      if (!isConnected || !pid) {
        console.log("Missing required data:", {
          isConnected,
          pid,
        })
        return
      }

      try {
        await getUserBalancesAllVotes()
      } catch (error) {
        console.error("fetchUserVoteBalances() error:", error)
      }
    }

    fetchUserVoteBalances()
  }, [isConnected, pid])

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!isConnected || !tokenProcessId) {
        console.log("Missing required data:", {
          isConnected,
          tokenProcessId,
        })
        return
      }

      try {
        await getUserWalletBalance()
      } catch (error) {
        console.error("fetchWalletBalance() error:", error)
      }
    }

    fetchWalletBalance()
  }, [isConnected, tokenProcessId])

  return (
    <ChakraProvider>
      <div className="min-h-screen bg-[#1a1a2e] text-white p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <Tabs
            defaultValue="vote"
            className="w-full"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-4 bg-[#232344]">
              <TabsTrigger
                value="vote"
                className="data-[state=active]:bg-[#393963]"
              >
                <Vote className="mr-2 h-4 w-4" />
                Vote
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="data-[state=active]:bg-[#393963]"
              >
                <Activity className="mr-2 h-4 w-4" />
                Info
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-[#393963]"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="balance"
                className="data-[state=active]:bg-[#393963]"
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
                allVotesBalances={allVotesBalances}
                getAllVoteBalances={getAllVoteBalances}
                cancelVote={cancelVote}
                withdrawRewards={withdrawRewards}
                conclude={conclude}
                options={[optionA, optionB]}
                tokenSymbol={tokenSymbol}
                tokenDenomination={tokenDenomination}
              />
            </TabsContent>
            <TabsContent value="chat">
              {showChatBox ? (
                <ChatTab pid={pid} />
              ) : (
                <p>Chat is not enabled for this market</p>
              )}
            </TabsContent>
            <TabsContent value="balance">
              <div className="mt-8 bg-[#232344] p-4 sm:p-4 rounded-lg space-y-8">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="bg-[#2f2f5a] p-4 rounded-lg flex-1">
                    <p className="text-sm text-gray-400 mb-1">
                      Market Deposit Balance
                    </p>
                    <p className="text-lg sm:text-xl font-bold truncate">
                      {divideByPower(userDepositBalance, tokenDenomination)}
                      {` $${tokenSymbol}`}
                    </p>
                  </div>
                  <div className="bg-[#2f2f5a] p-4 rounded-lg flex-1">
                    <p className="text-sm text-gray-400 mb-1">
                      Your Wallet Balance
                    </p>
                    <p className="text-lg sm:text-xl font-bold truncate">
                      {divideByPower(userWalletBalance, tokenDenomination)}
                      {` $${tokenSymbol}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <NumberInput
                    precision={DEFAULT_PRECISION}
                    value={amount}
                    min={0.000000000001}
                    onChange={(e) => {
                      console.log("e", e)
                      setAmount(e)
                    }}
                  >
                    <NumberInputField
                      borderColor="#2d2d44"
                      borderRadius="none"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper
                        borderColor="#2d2d44"
                        color="gray.200"
                      />
                      <NumberDecrementStepper
                        borderColor="#2d2d44"
                        color="gray.200"
                      />
                    </NumberInputStepper>
                  </NumberInput>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      className="w-full bg-emerald-600/20 px-4 py-2 rounded-md transition-colors hover:bg-emerald-600/30 text-emerald-200"
                      onClick={async (event) => {
                        const button = event.target
                        button.disabled = true
                        await deposit()
                        button.disabled = false
                      }}
                    >
                      Deposit
                    </button>
                    <button
                      className="w-full bg-rose-600/20 px-4 py-2 rounded-md transition-colors hover:bg-rose-600/30 text-rose-200"
                      onClick={async (event) => {
                        const button = event.target
                        button.disabled = true
                        await withdraw()
                        button.disabled = false
                      }}
                    >
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
