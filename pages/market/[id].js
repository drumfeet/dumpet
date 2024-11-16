import { Link, useParams } from "arnext"
import { useEffect, useState } from "react"
import {
  Button,
  ChakraProvider,
  Divider,
  Flex,
  Input,
  useToast,
  Text,
  Heading,
  FormControl,
  FormHelperText,
  Spacer,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Skeleton,
  VStack,
  Stack,
  Spinner,
} from "@chakra-ui/react"
import {
  createDataItemSigner,
  spawn,
  message,
  result,
  results,
  dryrun,
} from "@permaweb/aoconnect"
import AppHeader from "@/components/AppHeader"
import { useAppContext } from "@/context/AppContext"
import { ExternalLinkIcon } from "@chakra-ui/icons"

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" }
}

const getID = async (id, pid) => `${pid ?? id}`

export async function getStaticProps({ params: { id } }) {
  return { props: { pid: await getID(id) } }
}

const DUMPET_TOKEN_TXID = "fzkhRptIvW3tJ7Dz7NFgt2DnZTJVKnwtzEOuURjfXrQ"

export default function Home({ _id = null }) {
  const toast = useToast()
  const { id } = useParams()
  const [pid, setPid] = useState(_id)
  const [tokenTxId, setTokenTxId] = useState("")
  const [jsonData, setJsonData] = useState()
  const [amount, setAmount] = useState(1)
  const [amountOfVote, setAmountOfVote] = useState(1)
  const [userBalance, setUserBalance] = useState(-1)
  const [walletBalance, setWalletBalance] = useState(-1)
  const [userBalanceVoteA, setUserBalanceVoteA] = useState(-1)
  const [userBalanceVoteB, setUserBalanceVoteB] = useState(-1)
  const [totalBalanceVoteA, setTotalBalanceVoteA] = useState(-1)
  const [totalBalanceVoteB, setTotalBalanceVoteB] = useState(-1)
  const [totalVotersBalance, setTotalVotersBalance] = useState(-1)

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
        // await getTotalBalanceVoteA()
        // await getTotalBalanceVoteB()
      })()
    }
  }, [pid])

  useEffect(() => {
    console.log("pid", pid)
    if (isConnected) {
      ;(async () => {
        // await getUserBalanceVoteA() and getUserBalanceVoteB()
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
      setTokenTxId(_jsonData?.TokenTxId)
      console.log("TokenTxId", _jsonData?.TokenTxId)
      updateBalances(_jsonData)
    } catch (error) {
      console.error(error)
    }
  }

  const updateBalances = async (jsonData = {}) => {
    setTotalBalanceVoteA(jsonData?.TotalBalanceVoteA || "0")
    setTotalBalanceVoteB(jsonData?.TotalBalanceVoteB || "0")

    console.log("updateBalances() jsonData", jsonData)
  }

  return (
    <ChakraProvider>
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
                      precision={2}
                      value={amountOfVote}
                      min={1}
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
                    Your Total VoteA: 0
                  </Text>
                  <Flex
                    cursor="pointer"
                    bg="#7023b6"
                    borderRadius="md"
                    justifyContent="center"
                    paddingY={4}
                    onClick={() => {
                      console.log("Vote")
                    }}
                  >
                    <Text fontWeight="bold">Vote</Text>
                  </Flex>
                  <Text
                    fontSize={{ base: "lg", md: "2xl" }}
                    textAlign="center"
                    fontWeight="bold"
                  >
                    {jsonData?.MarketInfo?.OptionA}
                  </Text>

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
                    Your Total VoteB: 0
                  </Text>
                  <Flex
                    cursor="pointer"
                    bg="#7023b6"
                    borderRadius="md"
                    justifyContent="center"
                    paddingY={4}
                    onClick={() => {
                      console.log("Vote")
                    }}
                  >
                    <Text fontWeight="bold">Vote</Text>
                  </Flex>

                  <Text
                    fontSize={{ base: "lg", md: "2xl" }}
                    textAlign="center"
                    fontWeight="bold"
                  >
                    {jsonData?.MarketInfo?.OptionB}
                  </Text>
                </Flex>
                <Flex paddingY={4}></Flex>
                <FormControl>
                  <FormHelperText fontSize="xs">Title</FormHelperText>
                  <Text maxW="lg" color="whiteAlpha.800">
                    {jsonData?.MarketInfo?.Title}
                  </Text>
                </FormControl>
                <FormControl>
                  <FormHelperText fontSize="xs">Expires on</FormHelperText>
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
                  <FormHelperText fontSize="xs">Token TxId</FormHelperText>
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
                  <FormHelperText fontSize="xs">Creator</FormHelperText>
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
                </FormControl>

                <FormControl>
                  <FormHelperText fontSize="xs">BlockHeight</FormHelperText>
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
                  <FormHelperText fontSize="xs">Block Timestamp</FormHelperText>
                  <Text maxW="lg" color="whiteAlpha.800">
                    {formatUnixTimestamp(jsonData?.MarketInfo?.Timestamp)}
                  </Text>
                </FormControl>
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
                <Flex
                  direction="column"
                  paddingX={{ base: "4", md: "8" }}
                  paddingTop={{ base: "4", md: "20" }}
                  paddingBottom={{ base: "4", md: "8" }}
                  mb="8"
                >
                  <Text fontSize="2xl" textAlign="center" fontWeight="bold">
                    {jsonData?.MarketInfo?.OptionA}
                  </Text>
                  <Text color="pink.400" textAlign="center">
                    TOTAL VOTES: {totalBalanceVoteA}
                  </Text>

                  <Flex paddingY={2}></Flex>
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

                  <Text fontSize="2xl" textAlign="center" fontWeight="bold">
                    {jsonData?.MarketInfo?.OptionB}
                  </Text>
                  <Text color="pink.400" textAlign="center">
                    TOTAL VOTES: {totalBalanceVoteB}
                  </Text>

                  {/* Deposit section */}
                  <Flex paddingY={{ base: "8", md: "20" }}></Flex>
                  <FormControl>
                    <FormHelperText fontSize="xs" color="gray.400">
                      Amount
                    </FormHelperText>
                    <NumberInput
                      focusBorderColor="#7023b6"
                      precision={2}
                      value={amountOfVote}
                      min={1}
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
                  <Button marginTop="4" colorScheme="purple">
                    Deposit
                  </Button>
                  <Button marginTop="4" colorScheme="purple">
                    Withdraw
                  </Button>
                  {/* Balances */}
                  <Flex paddingY={4}></Flex>
                  <FormControl>
                    <FormHelperText fontSize="xs">
                      Your Wallet Balance
                    </FormHelperText>
                    {userBalance >= 0 ? (
                      <Text maxW="lg">{userBalance}</Text>
                    ) : (
                      <Text maxW="lg">-</Text>
                    )}
                  </FormControl>
                  <FormControl>
                    <FormHelperText fontSize="xs">
                      Your Deposit Balance
                    </FormHelperText>
                    {userBalance >= 0 ? (
                      <Text maxW="lg">{userBalance}</Text>
                    ) : (
                      <Text maxW="lg">-</Text>
                    )}
                  </FormControl>

                  <Flex paddingY={4}></Flex>

                  <Flex paddingY={4}></Flex>
                  <Flex
                    cursor="pointer"
                    bg="#7023b6"
                    borderRadius="md"
                    justifyContent="center"
                    paddingY={4}
                    onClick={() => {
                      console.log("Vote")
                    }}
                  >
                    <Text fontWeight="bold">Cancel my votes</Text>
                  </Flex>

                  <Flex paddingY={4}></Flex>
                  <Flex
                    cursor="pointer"
                    bg="#d53f8c"
                    borderRadius="md"
                    justifyContent="center"
                    paddingY={4}
                    onClick={() => {
                      console.log("Vote")
                    }}
                  >
                    <Text fontWeight="bold">Conclude</Text>
                  </Flex>

                  {/* Withdraw Rewards */}
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
