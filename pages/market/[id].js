import { Link, useParams } from "arnext"
import { useEffect, useState } from "react"
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
import { ExternalLinkIcon, RepeatIcon, UpDownIcon } from "@chakra-ui/icons"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import ShareIcon from "@/components/icons/ShareIcon"
import Head from "next/head"
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
  const [jsonData, setJsonData] = useState()
  const [tokenProcessId, setTokenProcessId] = useState("")
  const [amount, setAmount] = useState(1)
  const [amountOfVote, setAmountOfVote] = useState(1)
  const [userDepositBalance, setUserDepositBalance] = useState(null) // must be a number
  const [userBalanceVoteA, setUserBalanceVoteA] = useState(0)
  const [userBalanceVoteB, setUserBalanceVoteB] = useState(0)
  const [totalBalanceVoteA, setTotalBalanceVoteA] = useState(0)
  const [totalBalanceVoteB, setTotalBalanceVoteB] = useState(0)
  const [optionA, setOptionA] = useState("")
  const [optionB, setOptionB] = useState("")

  const adjustedData =
    totalBalanceVoteA <= 0 && totalBalanceVoteB <= 0
      ? [1, 1]
      : [divideByPower(totalBalanceVoteA), divideByPower(totalBalanceVoteB)]

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

  const getMarketInfo = async () => {
    console.log("getMarketInfo pid", pid)
    try {
      const result = await dryrun({
        process: pid,
        tags: [{ name: "Action", value: "GetMarketInfo" }],
      })

      console.log("result", result)
      const _jsonData = JSON.parse(result?.Messages[0]?.Data)
      console.log("_jsonData", _jsonData)
      setJsonData(_jsonData)
      setOptionA(_jsonData?.MarketInfo?.OptionA)
      setOptionB(_jsonData?.MarketInfo?.OptionB)
      setTokenProcessId(_jsonData?.MarketInfo?.TokenTxId)
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

      console.log("userDepositBalance", userDepositBalance)
      console.log("_amount", _amount)
      const _updatedBalance = userDepositBalance + _amount
      console.log("_updatedBalance", _updatedBalance)
      setUserDepositBalance(_updatedBalance)

      toast({
        description: "Deposit success",
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
    description: "Populartiy contest duel platform",
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
        p={4}
        bg="#1a1a2e"
        minHeight="100vh"
        color="white"
        flex={1}
      >
        <AppHeader />
        <Flex paddingY={8}></Flex>
        <Flex
          direction={{ base: "column", md: "row" }}
          flex={1}
          maxW="1200px"
          align="stretch"
          justify="center"
          padding="4"
          p={4}
          bg="#1a1a2e"
          minHeight="100vh"
          color="white"
          width="100%"
        >
          {jsonData ? (
            <>
              {/* Left Pane Section */}
              <Flex
                direction="column"
                width={{ base: "100%", md: "50%" }}
                paddingX="4"
              >
                <Flex direction="column">
                  <FormControl>
                    <FormHelperText fontSize="xs" color="gray.400">
                      Amount of Vote
                    </FormHelperText>
                    <NumberInput
                      focusBorderColor="#7023b6"
                      precision={DEFAULT_PRECISION}
                      value={amountOfVote}
                      min={0.000000000001}
                      onChange={(e) => {
                        setAmountOfVote(e)
                      }}
                    >
                      <NumberInputField
                        bg="#2d2d44"
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
                  </FormControl>

                  <Flex paddingY={2}></Flex>
                  <Text fontSize="xs" color="gray.400">
                    Your Total VoteA: {divideByPower(userBalanceVoteA)}
                  </Text>
                  <Button
                    cursor="pointer"
                    colorScheme="purple"
                    // bg="#7023b6"
                    borderRadius="md"
                    justifyContent="center"
                    paddingY={8}
                    onClick={async (event) => {
                      const button = event.target
                      button.disabled = true
                      await voteA()
                      button.disabled = false
                    }}
                  >
                    <Text fontWeight="bold">Vote</Text>
                  </Button>
                  <Text
                    fontSize={{ base: "lg", md: "2xl" }}
                    textAlign="center"
                    fontWeight="bold"
                  >
                    {jsonData?.MarketInfo?.OptionA}
                  </Text>
                  <Flex gap={2} alignItems="center">
                    <Flex onClick={getTotalBalanceAllVotes} cursor="pointer">
                      <RepeatIcon color="whiteAlpha.500" boxSize={4} />
                    </Flex>

                    <Text color="pink.400" textAlign="center">
                      TOTAL VOTES: {divideByPower(totalBalanceVoteA)}
                    </Text>
                  </Flex>

                  <Flex justifyContent="center" paddingY={4} marginBottom={2}>
                    <Text
                      fontSize="sm"
                      color="gray.400"
                      border="1px solid"
                      borderColor="purple"
                      borderRadius="md"
                      paddingX={4}
                    >
                      versus
                    </Text>
                  </Flex>
                  <Text fontSize="xs" color="gray.400">
                    Your Total VoteB: {divideByPower(userBalanceVoteB)}
                  </Text>
                  <Button
                    cursor="pointer"
                    colorScheme="purple"
                    // bg="#7023b6"
                    borderRadius="md"
                    justifyContent="center"
                    paddingY={8}
                    onClick={async (event) => {
                      const button = event.target
                      button.disabled = true
                      await voteB()
                      button.disabled = false
                    }}
                  >
                    <Text fontWeight="bold">Vote</Text>
                  </Button>

                  <Text
                    fontSize={{ base: "lg", md: "2xl" }}
                    textAlign="center"
                    fontWeight="bold"
                  >
                    {jsonData?.MarketInfo?.OptionB}
                  </Text>
                  <Flex gap={2} alignItems="center">
                    <Flex onClick={getTotalBalanceAllVotes} cursor="pointer">
                      <RepeatIcon color="whiteAlpha.500" boxSize={4} />
                    </Flex>
                    <Text color="pink.400" textAlign="center">
                      TOTAL VOTES: {divideByPower(totalBalanceVoteB)}
                    </Text>
                  </Flex>
                </Flex>
                <Flex paddingY={4}></Flex>

                <Accordion allowToggle>
                  <AccordionItem
                    borderTop="1px solid"
                    borderBottom="2px solid"
                    borderColor="gray.400"
                  >
                    {({ isExpanded }) => (
                      <>
                        <AccordionButton>
                          <Flex
                            flex={1}
                            alignItems="center"
                            justifyContent="space-between"
                            paddingY={2}
                          >
                            {!isExpanded ? ( // Conditionally render the text
                              <Text
                                textAlign="left"
                                fontSize="xs"
                                color="gray.400"
                              >
                                More Info
                              </Text>
                            ) : (
                              <Spacer />
                            )}
                            <UpDownIcon color="gray.400" boxSize={3} />
                          </Flex>
                        </AccordionButton>

                        <AccordionPanel paddingBottom={8}>
                          <FormControl>
                            <FormHelperText fontSize="xs">Title</FormHelperText>
                            <Text maxW="lg" color="whiteAlpha.800">
                              {jsonData?.MarketInfo?.Title}
                            </Text>
                          </FormControl>
                          <FormControl>
                            <FormHelperText fontSize="xs">
                              Expires on
                            </FormHelperText>
                            <Text maxW="lg" color="whiteAlpha.800">
                              {formatUnixTimestamp(
                                jsonData?.MarketInfo?.Duration
                              ).toString()}
                            </Text>
                          </FormControl>
                          <FormControl>
                            <FormHelperText fontSize="xs">
                              Market ProcessId
                            </FormHelperText>
                            <Link
                              target="_blank"
                              rel="noopener noreferrer"
                              href={`https://www.ao.link/#/entity/${pid}`}
                            >
                              <Flex
                                alignItems="center"
                                color="whiteAlpha.800"
                                maxW="100%"
                                wrap="wrap"
                              >
                                <ExternalLinkIcon
                                  marginRight={4}
                                  display={{ base: "none", md: "block" }}
                                />
                                <Box wordBreak="break-word" whiteSpace="normal">
                                  {pid}
                                </Box>
                              </Flex>
                            </Link>
                          </FormControl>
                          <FormControl>
                            <FormHelperText fontSize="xs">
                              Bet Token ProcessId
                            </FormHelperText>
                            <Link
                              target="_blank"
                              rel="noopener noreferrer"
                              href={`https://www.ao.link/#/token/${jsonData?.MarketInfo?.TokenTxId}`}
                            >
                              <Flex
                                alignItems="center"
                                color="whiteAlpha.800"
                                maxW="100%"
                                wrap="wrap"
                              >
                                <ExternalLinkIcon
                                  marginRight={4}
                                  display={{ base: "none", md: "block" }}
                                />
                                <Box wordBreak="break-word" whiteSpace="normal">
                                  {jsonData?.MarketInfo?.TokenTxId}
                                </Box>
                              </Flex>
                            </Link>
                          </FormControl>
                          <FormControl>
                            <FormHelperText fontSize="xs">
                              Creator
                            </FormHelperText>
                            <Link
                              target="_blank"
                              rel="noopener noreferrer"
                              href={`https://www.ao.link/#/entity/${jsonData?.Creator}`}
                            >
                              <Flex
                                alignItems="center"
                                color="whiteAlpha.800"
                                maxW="100%"
                                wrap="wrap"
                              >
                                <ExternalLinkIcon
                                  marginRight={4}
                                  display={{ base: "none", md: "block" }}
                                />
                                <Box wordBreak="break-word" whiteSpace="normal">
                                  {jsonData?.Creator}
                                </Box>
                              </Flex>
                            </Link>
                            <Flex paddingY={1}></Flex>
                            <Button
                              w="100%"
                              colorScheme="purple"
                              onClick={async (event) => {
                                const button = event.target
                                button.disabled = true
                                await withdrawRewards()
                                button.disabled = false
                              }}
                            >
                              <Text fontWeight="bold">Withdraw AO</Text>
                            </Button>
                          </FormControl>
                          <FormControl>
                            <FormHelperText fontSize="xs">
                              BlockHeight
                            </FormHelperText>
                            <Link
                              target="_blank"
                              rel="noopener noreferrer"
                              href={`https://viewblock.io/arweave/block/${jsonData?.MarketInfo?.BlockHeight}`}
                            >
                              <Flex
                                alignItems="center"
                                color="whiteAlpha.800"
                                maxW="100%"
                                wrap="wrap"
                              >
                                <ExternalLinkIcon
                                  marginRight={4}
                                  display={{ base: "none", md: "block" }}
                                />
                                <Box wordBreak="break-word" whiteSpace="normal">
                                  {jsonData?.MarketInfo?.BlockHeight}
                                </Box>
                              </Flex>
                            </Link>
                          </FormControl>
                          <FormControl>
                            <FormHelperText fontSize="xs">
                              Block Timestamp
                            </FormHelperText>
                            <Text maxW="lg" color="whiteAlpha.800">
                              {formatUnixTimestamp(
                                jsonData?.MarketInfo?.Timestamp
                              )}
                            </Text>
                          </FormControl>
                        </AccordionPanel>
                      </>
                    )}
                  </AccordionItem>
                </Accordion>
              </Flex>

              {/* Right Pane Section */}
              <Flex
                marginTop={{ base: "20", md: "0" }}
                direction="column"
                width={{ base: "100%", md: "50%" }}
                padding="4"
                bgColor="purple.800"
                borderRadius={{ base: "md", md: "small" }}
              >
                <Flex justifyContent="flex-end">
                  <IconButton
                    icon={<ShareIcon strokeColor="#FFFFFF7A" size={24} />}
                    colorScheme="whiteAlpha"
                    variant="ghost"
                    aria-label="Share"
                    onClick={() => {
                      const text = `Check out this market on dumpet.fun - `
                      const url = window.location.href
                      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        text
                      )}&url=${encodeURIComponent(url)}`
                      window.open(twitterUrl, "_blank")
                    }}
                  />
                </Flex>

                <Flex
                  direction="column"
                  paddingX={{ base: "4", md: "8" }}
                  paddingTop={{ base: "4", md: "0" }}
                  paddingBottom={{ base: "4", md: "8" }}
                  mb="8"
                >
                  <Flex justifyContent="center">
                    <Flex
                      w={{ base: 250, md: 400 }}
                      h={{ base: 250, md: 400 }}
                      // bgGradient="linear(to-r, red, teal.700)"
                      borderRadius="small"
                      mb={6}
                      color="gray.400"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="2xs"
                    >
                      <Pie
                        data={data}
                        options={{
                          plugins: {
                            tooltip: {
                              enabled: false, // This will disable the tooltip on hover
                            },
                          },
                        }}
                      />
                    </Flex>
                  </Flex>

                  {/* Deposit section */}
                  <Flex paddingY={{ base: "8", md: "4" }}></Flex>
                  <FormControl>
                    <FormHelperText fontSize="xs" color="gray.400">
                      Amount
                    </FormHelperText>
                    <NumberInput
                      focusBorderColor="#7023b6"
                      precision={DEFAULT_PRECISION}
                      value={amount}
                      min={0.000000000001}
                      onChange={(e) => {
                        console.log("e", e)
                        setAmount(e)
                      }}
                    >
                      <NumberInputField
                        bg="#2d2d44"
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
                  </FormControl>
                  <Button
                    marginTop="4"
                    colorScheme="purple"
                    onClick={async (event) => {
                      const button = event.target
                      button.disabled = true
                      await deposit()
                      button.disabled = false
                    }}
                  >
                    Deposit
                  </Button>
                  <Flex paddingY={2}></Flex>
                  <Button
                    variant="outline"
                    border="2px solid"
                    borderColor="purple.700"
                    color="white"
                    _hover={{ bg: "purple.700" }}
                    colorScheme="purple"
                    onClick={async (event) => {
                      const button = event.target
                      button.disabled = true
                      await withdraw()
                      button.disabled = false
                    }}
                  >
                    Withdraw
                  </Button>

                  <FormControl>
                    <FormHelperText fontSize="xs" color="gray.400">
                      Your Deposit Balance
                    </FormHelperText>
                    <Text maxW="lg" color="whiteAlpha.800">
                      {divideByPower(userDepositBalance) ?? "-"}
                    </Text>
                  </FormControl>

                  <Flex paddingY={8}></Flex>
                  <Button
                    colorScheme="purple"
                    onClick={async (event) => {
                      const button = event.target
                      button.disabled = true
                      await cancelVote()
                      button.disabled = false
                    }}
                  >
                    <Text fontWeight="bold">Cancel my votes</Text>
                  </Button>

                  <Flex paddingY={4}></Flex>
                  <Button
                    variant="outline"
                    border="2px solid"
                    borderColor="purple.700"
                    color="white"
                    _hover={{ bg: "purple.700" }}
                    colorScheme="purple"
                    onClick={async (event) => {
                      const button = event.target
                      button.disabled = true
                      await conclude()
                      button.disabled = false
                    }}
                  >
                    <Text fontWeight="bold">Conclude</Text>
                  </Button>

                  {/* <Flex paddingY={4}></Flex>
                  <FormControl>
                    <FormHelperText fontSize="xs" color="gray.400">
                      *Creator only
                    </FormHelperText>
                    <Button
                      w="100%"
                      colorScheme="purple"
                      onClick={async (event) => {
                        const button = event.target
                        button.disabled = true
                        await withdrawRewards()
                        button.disabled = false
                      }}
                    >
                      <Text fontWeight="bold">Withdraw AO</Text>
                    </Button>
                  </FormControl> */}
                </Flex>
              </Flex>
            </>
          ) : (
            <Flex justifyContent="center">
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="purple.500"
                size="xl"
              />
            </Flex>
          )}
        </Flex>
      </Flex>
    </ChakraProvider>
  )
}
