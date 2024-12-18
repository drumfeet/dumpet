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
import { useEffect, useState, useCallback } from "react"
import { MAIN_PROCESS_ID } from "@/context/AppContext"
import { StarIcon } from "@chakra-ui/icons"
import { cacheService } from "@/services/CacheService"

const CACHE_KEY_MARKETS = "markets_data"
const CACHE_KEY_RANDOM = "random_market"
const FIVE_MINUTES = 5 * 60 * 1000

export default function Home() {
  const toast = useToast()
  const [markets, setMarkets] = useState([])
  const [randomMarket, setRandomMarket] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [nextPage, setNextPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { handleMessageResultError } = useAppContext()

  const fetchMarkets = useCallback(async (page = 1) => {
    try {
      const cachedData = cacheService.get(CACHE_KEY_MARKETS)
      
      // If requesting first page and we have cached data, use it
      if (cachedData && page === 1) {
        setMarkets(cachedData.markets)
        setHasMore(cachedData.hasMore)
        setNextPage(cachedData.nextPage)
        return
      }

      const result = await dryrun({
        process: MAIN_PROCESS_ID,
        tags: [
          { name: "Action", value: "List" },
          { name: "Page", value: page.toString() },
        ],
      })
      const jsonData = JSON.parse(result?.Messages[0]?.Data)

      setMarkets(prevMarkets => {
        const updatedMarkets = page === 1 
          ? jsonData.Markets 
          : [...prevMarkets, ...jsonData.Markets]

        // Only cache on first page load
        if (page === 1) {
          cacheService.set(CACHE_KEY_MARKETS, {
            markets: updatedMarkets,
            hasMore: jsonData.HasMore,
            nextPage: jsonData.NextPage || page + 1,
          }, FIVE_MINUTES)
        }

        return updatedMarkets
      })

      setHasMore(jsonData.HasMore)
      setNextPage(jsonData.NextPage || page + 1)
    } catch (error) {
      console.error('Error fetching markets:', error)
    }
  }, [])

  const fetchRandomMarket = useCallback(async () => {
    setIsLoading(true)
    try {
      const cachedRandomMarket = cacheService.get(CACHE_KEY_RANDOM)
      
      if (cachedRandomMarket) {
        setRandomMarket(cachedRandomMarket)
        fetchMarkets()
        return
      }

      const result = await dryrun({
        process: MAIN_PROCESS_ID,
        tags: [{ name: "Action", value: "RandomMarket" }],
      })

      if (handleMessageResultError(result)) return

      const jsonData = JSON.parse(result?.Messages[0]?.Data)
      setRandomMarket(jsonData)
      cacheService.set(CACHE_KEY_RANDOM, jsonData, FIVE_MINUTES)
      
      fetchMarkets()
    } catch (error) {
      console.error('Error fetching random market:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchMarkets, handleMessageResultError])

  // Initial load
  useEffect(() => {
    fetchRandomMarket()
  }, [fetchRandomMarket])

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

        <Link href="/create">
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

            <Link href={`/market/${randomMarket.ProcessId}`}>
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
                <Link href={`/market/${market.ProcessId}`}>
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
            onClick={() => fetchMarkets(nextPage)}
          >
            Show More
          </Button>
        )}

        <Flex paddingY={8}></Flex>
      </Flex>
    </ChakraProvider>
  )
}