import AppHeader from "@/components/AppHeader"
import { useAppContext } from "@/context/AppContext"
import {
  Button,
  ChakraProvider,
  Flex,
  useToast,
  Spinner,
} from "@chakra-ui/react"
import { dryrun } from "@permaweb/aoconnect"
import { Link } from "arnext"
import { useEffect, useState, useCallback } from "react"
import { MAIN_PROCESS_ID } from "@/context/AppContext"
import localforage from "localforage"
import { MarketCard } from "@/components/MarketCard"
import { Plus } from "lucide-react"

const CACHE_KEYS = {
  RANDOM_MARKET: "randomMarket",
  MARKETS_LIST: "marketsList",
  CACHE_TIMESTAMP: "marketsTimestamp",
}

const DEFAULT_LIMIT = 12

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
        console.log("useEffect fetching markets")
        await fetchMarkets()
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

  const handleShare = useCallback((processId) => {
    const text = `Check out this market on dumpet.fun - `
    const url = `${window.location.origin}/market/${processId}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, "_blank")
  }, [])

  const getCachedData = async () => {
    const _randomMarket = await localforage.getItem(
      `${MAIN_PROCESS_ID}-${CACHE_KEYS.RANDOM_MARKET}`
    )
    const _markets = await localforage.getItem(
      `${MAIN_PROCESS_ID}-${CACHE_KEYS.MARKETS_LIST}`
    )
    console.log("_randomMarket", _randomMarket)
    console.log("_markets", _markets)
    const hasCachedRandomMarket = !!_randomMarket
    const hasCachedMarkets = !!_markets

    if (_randomMarket) {
      setRandomMarket(_randomMarket)
      setHasCachedRandomMarket(true)
    } else {
      setHasCachedRandomMarket(false)
    }

    if (_markets) {
      const limitedMarkets = _markets.slice(0, DEFAULT_LIMIT)
      console.log("limitedMarkets", limitedMarkets)
      setMarkets(limitedMarkets)
      setHasCachedMarkets(true)
    } else {
      setHasCachedMarkets(false)
    }

    setIsCachedDataStale(hasCachedRandomMarket || hasCachedMarkets)
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
        {/* <SubHeader /> */}
        <Flex paddingY={8}></Flex>

        <Link href="/create">
          <Button
            leftIcon={<Plus />}
            colorScheme="purple"
            bg="#7023b6" // Primary purple
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
          <MarketCard market={randomMarket} onShare={handleShare} />
        )}

        <Flex
          paddingTop={20}
          paddingBottom={2}
          w="100%"
          maxW="1050px"
          justifyContent="flex-start"
        ></Flex>

        {!isLoading && markets && markets.length > 0 && (
          <Flex wrap="wrap" justify="center" gap={4} maxW="1200px">
            {markets.map((market, index) => (
              <MarketCard
                key={`${market.ProcessId}-${index}`}
                market={market}
                onShare={handleShare}
              />
            ))}
          </Flex>
        )}

        <Flex paddingY={4}></Flex>

        {!isLoading && hasMore && (
          <Button
            colorScheme="purple"
            bg="none"
            border="2px solid"
            borderColor="purple.600"
            onClick={async () => {
              await fetchMarkets(nextPage)
            }}
          >
            Show More
          </Button>
        )}

        <Flex paddingY={8}></Flex>
      </Flex>
    </ChakraProvider>
  )
}
