import AppHeader from "@/components/AppHeader"
import ShareIcon from "@/components/icons/ShareIcon"
import SubHeader from "@/components/SubHeader"
import { useAppContext } from "@/context/AppContext"
import {
  Button,
  ChakraProvider,
  Flex,
  useToast,
  Text,
  IconButton,
  Spinner,
} from "@chakra-ui/react"
import { dryrun } from "@permaweb/aoconnect"
import { Link } from "arnext"
import { useEffect, useState } from "react"
import { MAIN_PROCESS_ID } from "@/context/AppContext"
import { StarIcon } from "@chakra-ui/icons"
import localforage from "localforage"

const CACHE_KEYS = {
  RANDOM_MARKET: "randomMarket",
  MARKETS_LIST: "marketsList",
  CACHE_TIMESTAMP: "marketsTimestamp",
}

export default function Home() {
  const toast = useToast()
  const [markets, setMarkets] = useState([])
  const [randomMarket, setRandomMarket] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [nextPage, setNextPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasCachedMarkets, setHasCachedMarkets] = useState(true)
  const [hasCachedRandomMarket, setHasCachedRandomMarket] = useState(true)
  const [isCachedDataStale, setIsCachedDataStale] = useState(false)

  const { handleMessageResultError } = useAppContext()

  useEffect(() => {
    ;(async () => {
      console.log("useEffect getCachedData")
      await getCachedData()
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!hasCachedRandomMarket) {
        setIsLoading(true)
        console.log("useEffect fetching random market")
        await fetchRandomMarket()
        setIsLoading(false)
      }
    })()
  }, [hasCachedRandomMarket])

  useEffect(() => {
    ;(async () => {
      if (!hasCachedMarkets) {
        setIsLoading(true)
        console.log("useEffect fetching markets")
        await fetchMarkets()
        setIsLoading(false)
      }
    })()
  }, [hasCachedMarkets])

  useEffect(() => {
    ;(async () => {
      if (isCachedDataStale) {
        console.log("useEffect isCachedDataStale")
        fetchRandomMarket()
        fetchMarkets()
      }
    })()
  }, [isCachedDataStale])

  const getCachedData = async () => {
    const _randomMarket = await localforage.getItem(
      `${MAIN_PROCESS_ID}-${CACHE_KEYS.RANDOM_MARKET}`
    )
    const _markets = await localforage.getItem(
      `${MAIN_PROCESS_ID}-${CACHE_KEYS.MARKETS_LIST}`
    )
    console.log("_randomMarket", _randomMarket)
    console.log("_markets", _markets)
    const hasRandomMarket = !!_randomMarket
    const hasMarkets = !!_markets

    if (_randomMarket) {
      setRandomMarket(_randomMarket)
      setHasCachedRandomMarket(true)
    } else {
      setHasCachedRandomMarket(false)
    }

    if (_markets) {
      setMarkets(_markets)
      setHasCachedMarkets(true)
    } else {
      setHasCachedMarkets(false)
    }

    setIsCachedDataStale(hasRandomMarket || hasMarkets)
  }

  const fetchMarkets = async (nextPage = 1) => {
    try {
      const _result = await dryrun({
        process: MAIN_PROCESS_ID,
        tags: [
          { name: "Action", value: "List" },
          { name: "Page", value: nextPage.toString() },
        ],
      })
      console.log("_result", _result)
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      console.log("jsonData", jsonData)
      if (handleMessageResultError(_result)) return

      // If it's the first page, replace the markets; otherwise, append
      const newMarkets =
        nextPage === 1 ? jsonData.Markets : [...markets, ...jsonData.Markets]
      console.log("newMarkets", newMarkets)
      await localforage.setItem(
        `${MAIN_PROCESS_ID}-${CACHE_KEYS.MARKETS_LIST}`,
        newMarkets
      )
      setMarkets(newMarkets)

      // Update `hasMore` and `nextPage` state
      setHasMore(jsonData.HasMore)
      if (jsonData?.NextPage) setNextPage(jsonData.NextPage)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchRandomMarket = async () => {
    try {
      const _result = await dryrun({
        process: MAIN_PROCESS_ID,
        tags: [{ name: "Action", value: "RandomMarket" }],
      })
      console.log(_result?.Messages[0])
      console.log("fetchRandomMarket _result", _result)
      if (handleMessageResultError(_result)) return
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      console.log("fetchRandomMarket jsonData", jsonData)
      await localforage.setItem(
        `${MAIN_PROCESS_ID}-${CACHE_KEYS.RANDOM_MARKET}`,
        jsonData
      )
      setRandomMarket(jsonData)
    } catch (error) {
      console.error(error)
    }
  }

  function formatUnixTimestamp(timestamp) {
    const date = new Date(Number(timestamp))
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
    return new Intl.DateTimeFormat("en-US", options).format(date)
  }

  return (
    <ChakraProvider>
      <Flex
        direction="column"
        align="center"
        p={4}
        bg="#1a1a2e" // Dark purple background
        minHeight="100vh"
        color="white"
      >
        <AppHeader />
        <SubHeader />
        <Flex paddingY={8}></Flex>

        <Link
          // target="_blank" rel="noopener noreferrer"
          href="/create"
        >
          <Button
            leftIcon={<StarIcon />}
            colorScheme="purple"
            paddingY={8}
            paddingX={4}
            fontSize="lg"
          >
            CREATE DUEL
          </Button>
        </Link>

        <Flex paddingY={8}></Flex>

        {isLoading && (
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
        {!isLoading && randomMarket && (
          <Flex
            flexDirection="column"
            w="250px"
            border="1px solid"
            borderColor="purple.700"
            paddingX={4}
            paddingBottom={8}
            borderRadius="md"
            textAlign="center"
          >
            <Flex w="100%" justify="flex-end">
              <IconButton
                icon={<ShareIcon strokeColor="#FFFFFF7A" size={14} />}
                colorScheme="whiteAlpha"
                variant="ghost"
                aria-label="Share"
                onClick={() => {
                  const text = `Check out this market on dumpet.fun - `
                  const url =
                    window.location.origin +
                    `/market/${randomMarket?.ProcessId}`
                  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    text
                  )}&url=${encodeURIComponent(url)}`
                  window.open(twitterUrl, "_blank")
                }}
              />
            </Flex>

            <Link
              // target="_blank"
              // rel="noopener noreferrer"
              href={`/market/${randomMarket.ProcessId}`}
            >
              <Flex flexDirection="column" gap={2}>
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  color="purple.300"
                  isTruncated
                >
                  {randomMarket?.Title}
                </Text>
                <Text fontSize="sm" isTruncated>
                  {randomMarket?.OptionA}
                </Text>
                <Flex justifyContent="center">
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
                <Text fontSize="sm" isTruncated>
                  {randomMarket?.OptionB}
                </Text>
                <Flex flexDirection="column">
                  <Text fontSize="xs" color="gray.400">
                    Expires on:
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    {randomMarket?.Duration
                      ? formatUnixTimestamp(randomMarket?.Duration)
                      : ""}
                  </Text>
                </Flex>
              </Flex>
            </Link>
          </Flex>
        )}

        <Flex
          paddingTop={20}
          paddingBottom={2}
          w="100%"
          maxW="1050px"
          justifyContent="flex-start"
        >
          {/* <Text fontSize="xs" color="gray.400" paddingBottom={2}>
            Most Recent
          </Text> */}
        </Flex>

        {!isLoading && markets && markets.length > 0 && (
          <Flex wrap="wrap" justify="center" gap={4} maxW="1200px">
            {markets.map((market, index) => (
              <Flex
                key={index}
                flexDirection="column"
                w="250px"
                border="1px solid"
                borderColor="purple.700"
                paddingX={4}
                paddingBottom={8}
                borderRadius="md"
                textAlign="center"
              >
                <Flex w="100%" justify="flex-end">
                  <IconButton
                    icon={<ShareIcon strokeColor="#FFFFFF7A" size={14} />}
                    colorScheme="whiteAlpha"
                    variant="ghost"
                    aria-label="Share"
                    onClick={() => {
                      const text = `Check out this market on dumpet.fun - `
                      const url =
                        window.location.origin + `/market/${market?.ProcessId}`
                      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        text
                      )}&url=${encodeURIComponent(url)}`
                      window.open(twitterUrl, "_blank")
                    }}
                  />
                </Flex>
                <Link
                  // target="_blank"
                  // rel="noopener noreferrer"
                  href={`/market/${market.ProcessId}`}
                >
                  <Flex flexDirection="column" gap={2}>
                    <Text
                      fontSize="md"
                      fontWeight="bold"
                      color="purple.300"
                      isTruncated
                    >
                      {market.Title}
                    </Text>
                    <Text fontSize="sm" isTruncated>
                      {market.OptionA}
                    </Text>
                    <Flex justifyContent="center">
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
                    <Text fontSize="sm" isTruncated>
                      {market.OptionB}
                    </Text>
                    <Flex flexDirection="column">
                      <Text fontSize="xs" color="gray.400">
                        Expires on:
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {market.Duration
                          ? formatUnixTimestamp(market.Duration)
                          : ""}
                      </Text>
                    </Flex>
                  </Flex>
                </Link>
              </Flex>
            ))}
          </Flex>
        )}

        <Flex paddingY={4}></Flex>

        {!isLoading && hasMore && (
          <Button
            colorScheme="purple"
            onClick={async () => {
              await fetchMarkets(nextPage)
            }}
          >
            Show More
          </Button>
        )}

        {/* {!isLoading && !hasMore && (
          <Text fontSize="sm" color="gray.400">
            No more markets to fetch.
          </Text>
        )} */}

        <Flex paddingY={8}></Flex>
      </Flex>
    </ChakraProvider>
  )
}
