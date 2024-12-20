import AppHeader from "@/components/AppHeader"
import SubHeader from "@/components/SubHeader"
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
import { StarIcon } from "@chakra-ui/icons"
import localforage from 'localforage'
import { MarketCard } from "@/components/MarketCard"

localforage.config({
  name: 'dumpet',
  storeName: 'markets'
})

// Cache keys
const CACHE_KEYS = {
  RANDOM_MARKET: 'randomMarket',
  MARKETS_LIST: 'marketsList',
  CACHE_TIMESTAMP: 'marketsTimestamp'
}

// Cache duration (in milliseconds) - 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

export default function Home() {
  const toast = useToast()
  const [markets, setMarkets] = useState([])
  const [randomMarket, setRandomMarket] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [nextPage, setNextPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const { handleMessageResultError } = useAppContext()

  useEffect(() => {
    ;(async () => {
      await fetchRandomMarket()
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      if (randomMarket) {
        await fetchMarkets()
      }
    })()
  }, [randomMarket])

  const isCacheValid = async () => {
    const timestamp = await localforage.getItem(CACHE_KEYS.CACHE_TIMESTAMP)
    return timestamp && Date.now() - timestamp < CACHE_DURATION
  }

  const fetchMarkets = async (nextPage = 1) => {
    try {
      if (nextPage === 1) {
        // Check cache for first page
        const isCached = await isCacheValid()
        if (isCached) {
          const cachedMarkets = await localforage.getItem(CACHE_KEYS.MARKETS_LIST)
          if (cachedMarkets) {
            setMarkets(cachedMarkets.markets)
            setHasMore(cachedMarkets.hasMore)
            setNextPage(cachedMarkets.nextPage)
            return
          }
        }
      }

      const _result = await dryrun({
        process: MAIN_PROCESS_ID,
        tags: [
          { name: "Action", value: "List" },
          { name: "Page", value: nextPage.toString() },
        ],
      })

      const jsonData = JSON.parse(_result?.Messages[0]?.Data)

      // Update state
      const newMarkets = nextPage === 1 ? jsonData.Markets : [...markets, ...jsonData.Markets]
      setMarkets(newMarkets)
      setHasMore(jsonData.HasMore)
      if (jsonData?.NextPage) setNextPage(jsonData.NextPage)

      // Update cache if it's the first page
      if (nextPage === 1) {
        await localforage.setItem(CACHE_KEYS.MARKETS_LIST, {
          markets: newMarkets,
          hasMore: jsonData.HasMore,
          nextPage: jsonData.NextPage
        })
        await localforage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now())
      }
    } catch (error) {
      console.error(error)
      // If error occurs, try to load from cache
      const cachedMarkets = await localforage.getItem(CACHE_KEYS.MARKETS_LIST)
      if (cachedMarkets) {
        setMarkets(cachedMarkets.markets)
        setHasMore(cachedMarkets.hasMore)
        setNextPage(cachedMarkets.nextPage)
        toast({
          title: "Using cached data",
          description: "Couldn't fetch fresh data, showing cached content instead",
          status: "info",
          duration: 5000,
          isClosable: true,
        })
      }
    }
  }

  const fetchRandomMarket = async () => {
    setIsLoading(true)
    try {
      // Check cache first
      const isCached = await isCacheValid()
      if (isCached) {
        const cachedRandomMarket = await localforage.getItem(CACHE_KEYS.RANDOM_MARKET)
        if (cachedRandomMarket) {
          setRandomMarket(cachedRandomMarket)
          setIsLoading(false)
          return
        }
      }

      const _result = await dryrun({
        process: MAIN_PROCESS_ID,
        tags: [{ name: "Action", value: "RandomMarket" }],
      })

      if (handleMessageResultError(_result)) return
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      setRandomMarket(jsonData)

      // Update cache
      await localforage.setItem(CACHE_KEYS.RANDOM_MARKET, jsonData)
    } catch (error) {
      console.error(error)
      // Try to load from cache if fetch fails
      const cachedRandomMarket = await localforage.getItem(CACHE_KEYS.RANDOM_MARKET)
      if (cachedRandomMarket) {
        setRandomMarket(cachedRandomMarket)
        toast({
          title: "Using cached random market",
          description: "Couldn't fetch fresh data, showing cached content instead",
          status: "info",
          duration: 5000,
          isClosable: true,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = useCallback((processId) => {
    const text = `Check out this market on dumpet.fun - `
    const url = `${window.location.origin}/market/${processId}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, "_blank")
  }, [])

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
          <MarketCard market={randomMarket} onShare={handleShare} />
        )}

        <Flex
          paddingTop={20}
          paddingBottom={2}
          w="100%"
          maxW="1050px"
          justifyContent="flex-start"
        >
        </Flex>

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
