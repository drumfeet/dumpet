import { Link, useParams } from "arnext"
import { useEffect, useState } from "react"
import {
  ChakraProvider,
  Flex,
  useToast,
} from "@chakra-ui/react"
import {
  createDataItemSigner,
  message,
  result,
  dryrun,
} from "@permaweb/aoconnect"
import AppHeader from "@/components/AppHeader"
import { useAppContext } from "@/context/AppContext"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
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
    isConnected,
    multiplyByPower,
    handleMessageResultError,
  } = useAppContext()

  const toast = useToast()
  const { id } = useParams()
  const [pid, setPid] = useState(_id)
  const [tokenProcessId, setTokenProcessId] = useState("")
  const [amount, setAmount] = useState(1)
  const [amountOfVote, setAmountOfVote] = useState(1)
  const [userDepositBalance, setUserDepositBalance] = useState(null) // must be a number
  const [userBalanceVoteA, setUserBalanceVoteA] = useState(0)
  const [userBalanceVoteB, setUserBalanceVoteB] = useState(0)

  useEffect(() => {
    ;(async () => {
      _id ?? setPid(await getID(id, _id))
    })()
  }, [])

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
      <MarketPage pid={pid}/>
    </ChakraProvider>
  )
}
