import { Link, useParams } from "arnext"
import { useEffect, useState } from "react"
import ChatBox from "@/components/ChatBox"
import {
  Button,
  ChakraProvider,
  Flex,
  useToast,
  Text,
  FormControl,
  FormHelperText,
  Spacer,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  IconButton,
} from "@chakra-ui/react"
import {
  createDataItemSigner,
  message,
  result,
  dryrun,
} from "@permaweb/aoconnect"
import AppHeader from "@/components/AppHeader"
import { useAppContext } from "@/context/AppContext"
import {
  CheckCircleIcon,
  CheckIcon,
  ExternalLinkIcon,
  RepeatIcon,
  TimeIcon,
  UpDownIcon,
} from "@chakra-ui/icons"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import ShareIcon from "@/components/icons/ShareIcon"
import Head from "next/head"
import MarketPage from "@/components/MarketPage"
ChartJS.register(ArcElement, Tooltip, Legend) // Register the required components

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" }
}

const getID = async (id, pid) => `${pid ?? id}`

export async function getStaticProps({ params: { id } }) {
  return { props: { pid: await getID(id) } }
}

const DEFAULT_PRECISION = 12

export default function Home({ _id = null }) {
  const {
    connectWallet,
    disconnectWallet,
    isConnected,
    setIsConnected,
    userAddress,
    setUserAddress,
    multiplyByPower,
    divideByPower,
    handleMessageResultError,
  } = useAppContext()

  const toast = useToast()
  const { id } = useParams()
  const [pid, setPid] = useState(_id)
  const [showChatBox, setShowChatBox] = useState(false)
  const [jsonData, setJsonData] = useState()
  const [tokenProcessId, setTokenProcessId] = useState("")
  const [tokenDenomination, setTokenDenomination] = useState(0)
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [tokenLogo, setTokenLogo] = useState("")
  const [tokenName, setTokenName] = useState("")
  const [amount, setAmount] = useState(1)
  const [amountOfVote, setAmountOfVote] = useState(1)
  const [userDepositBalance, setUserDepositBalance] = useState(null) // must be a number
  const [userBalanceVoteA, setUserBalanceVoteA] = useState(0)
  const [userBalanceVoteB, setUserBalanceVoteB] = useState(0)
  const [totalBalanceVoteA, setTotalBalanceVoteA] = useState(0)
  const [totalBalanceVoteB, setTotalBalanceVoteB] = useState(0)
  const [optionA, setOptionA] = useState("")
  const [optionB, setOptionB] = useState("")
  const [isFetchingData, setIsFetchingData] = useState(false)

  const adjustedData =
    totalBalanceVoteA <= 0 && totalBalanceVoteB <= 0
      ? [1, 1]
      : [
          divideByPower(totalBalanceVoteA, tokenDenomination),
          divideByPower(totalBalanceVoteB, tokenDenomination),
        ]

  const data = {
    labels: [optionA, optionB],
    datasets: [
      {
        data: adjustedData,
        backgroundColor: ["#dc2625", "#2463eb"], // red, blue
        hoverBackgroundColor: ["#dc2625", "#2463eb"],
        borderWidth: 0,
      },
    ],
  }

  useEffect(() => {
    ;(async () => {
      _id ?? setPid(await getID(id, _id))
    })()
  }, [])

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

  function formatUnixTimestamp(timestamp) {
    try {
      // Ensure the timestamp is a number or a numeric string
      const parsedTimestamp = Number(timestamp)
      if (isNaN(parsedTimestamp)) {
        throw new Error("Invalid timestamp: Not a number.")
      }

      // Create a date object
      const date = new Date(parsedTimestamp)
      if (isNaN(date.getTime())) {
        throw new Error("Invalid timestamp: Unable to parse into a valid date.")
      }

      // Formatting options
      const options = {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use the local timezone
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // 24-hour format
      }

      // Format the date
      return new Intl.DateTimeFormat("en-US", options).format(date)
    } catch (error) {
      console.error("Error formatting timestamp:", error.message)
      return "" // Default error message for invalid input
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
      setJsonData(_jsonData)
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

  const updateBalances = async (jsonData = {}) => {
    setTotalBalanceVoteA(jsonData?.TotalBalanceVoteA)
    setTotalBalanceVoteB(jsonData?.TotalBalanceVoteB)
    console.log("updateBalances() jsonData", jsonData)
  }

  const updateUserBalances = async (jsonData = {}) => {
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

    setIsFetchingData(true)
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
      setIsFetchingData(false)
    }
  }

  const getTotalBalanceAllVotes = async () => {
    try {
      console.log("getTotalBalanceAllVotes pid", pid)
      const _result = await dryrun({
        process: pid,
        tags: [{ name: "Action", value: "TotalBalanceAllVotes" }],
      })
      console.log("getTotalBalanceAllVotes _result", _result)

      if (_result?.Messages[0]?.Data) {
        const jsonData = JSON.parse(_result?.Messages[0]?.Data)
        console.log("getTotalBalanceAllVotes jsonData", jsonData)
        updateBalances(jsonData)
      }

      toast({
        description: "Total votes updated",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    } catch (error) {
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

  const voteA = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }

    const _amount = multiplyByPower(amountOfVote)
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
      console.error(error)
    }
  }

  const voteB = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }

    const _amount = multiplyByPower(amountOfVote)
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
      console.error(error)
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

  const meta = {
    title: "dumpet.fun",
    description: "Popularity contest duel platform",
    image: "T2q7IO67TYEhuk1CIPVxHX9MdEmzTUocZjScmdWTHK0",
  }

  return (
    <ChakraProvider>
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${meta.title}`} />
        <meta name="twitter:description" content={meta.description} />
        <meta
          name="twitter:image"
          content={`https://arweave.net/${meta.image}`}
        />
        <meta property="og:title" content={`${meta.title}`} />
        <meta name="og:description" content={meta.description} />
        <meta name="og:image" content={`https://arweave.net/${meta.image}`} />
        <link rel="icon" href=".././favicon.ico" />
      </Head>
      <Flex
        direction="column"
        align="center"
        paddingX={4}
        bg="#1a1a2e"
        color="white"
        flex={1}
      >
        <AppHeader />
        <Flex paddingY={8}></Flex>
      </Flex>
      <MarketPage />
    </ChakraProvider>
  )
}
