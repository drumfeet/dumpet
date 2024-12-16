import { useCallback, useMemo } from 'react'
import AppHeader from "@/components/AppHeader"
import ShareIcon from "@/components/icons/ShareIcon"
import SubHeader from "@/components/SubHeader"
import { useAppContext } from "@/context/AppContext"
import {
  Button,
  ChakraProvider,
  Flex,
  Text,
  IconButton,
  Spinner,
} from "@chakra-ui/react"
import { dryrun } from "@permaweb/aoconnect"
import { Link } from "arnext"
import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { MAIN_PROCESS_ID } from "@/context/AppContext"
import { StarIcon } from "@chakra-ui/icons"

const fetchRandomMarket = async () => {
  const result = await dryrun({
    process: MAIN_PROCESS_ID,
    tags: [{ name: "Action", value: "RandomMarket" }],
  })
  if (!result?.Messages?.[0]?.Data) throw new Error("Fetch error")
  return JSON.parse(result.Messages[0].Data)
}

const fetchMarkets = async ({ pageParam = 1 }) => {
  const result = await dryrun({
    process: MAIN_PROCESS_ID,
    tags: [
      { name: "Action", value: "List" },
      { name: "Page", value: pageParam.toString() },
    ],
  })
  if (!result?.Messages?.[0]?.Data) throw new Error("Fetch error")
  return JSON.parse(result.Messages[0].Data)
}

const MarketCard = ({ market, onShare }) => {
  const formattedDate = useMemo(() => 
    market.Duration ? formatUnixTimestamp(market.Duration) : "",
    [market.Duration]
  )

  return (
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
          onClick={() => onShare(market.ProcessId)}
        />
      </Flex>
      <Link href={`/market/${market.ProcessId}`}>
        <Flex flexDirection="column" gap={2}>
          <Text fontSize="md" fontWeight="bold" color="purple.300" isTruncated>
            {market.Title}
          </Text>
          <Text fontSize="sm" isTruncated>{market.OptionA}</Text>
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
          <Text fontSize="sm" isTruncated>{market.OptionB}</Text>
          <Flex flexDirection="column">
            <Text fontSize="xs" color="gray.400">Expires on:</Text>
            <Text fontSize="xs" color="gray.400">{formattedDate}</Text>
          </Flex>
        </Flex>
      </Link>
    </Flex>
  )
}

const formatUnixTimestamp = (timestamp) => {
  const date = new Date(Number(timestamp))
  return new Intl.DateTimeFormat("en-US", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

export default function Home() {
  const { handleMessageResultError } = useAppContext()

  const { data: randomMarket, isLoading: isLoadingRandom } = useQuery({
    queryKey: ["randomMarket"],
    queryFn: fetchRandomMarket,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    onError: handleMessageResultError,
  })

  const {
    data: markets,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMarkets,
  } = useInfiniteQuery({
    queryKey: ["markets"],
    queryFn: fetchMarkets,
    getNextPageParam: (lastPage) => lastPage?.NextPage || undefined,
    staleTime: 1000 * 60 * 5,
    onError: handleMessageResultError,
  })

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
        bg="#1a1a2e"
        minHeight="100vh"
        color="white"
      >
        <AppHeader />
        <SubHeader />

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

        <Flex paddingY={8} />

        {/* Loading Spinner */}
        {isLoadingRandom && (
          <Flex justifyContent="center" paddingY={8}>
            <Spinner size="xl" color="purple.500" />
          </Flex>
        )}

        {/* Random Market */}
        {randomMarket && (
          <MarketCard market={randomMarket} onShare={handleShare} />
        )}

        <Flex
          paddingTop={20}
          paddingBottom={2}
          w="100%"
          maxW="1050px"
          justifyContent="flex-start"
        />

        {/* Markets List */}
        {markets && (
          <Flex wrap="wrap" justify="center" gap={4} maxW="1200px">
            {markets.pages.map((page) =>
              page.Markets.map((market, index) => (
                <MarketCard
                  key={`${market.ProcessId}-${index}`}
                  market={market}
                  onShare={handleShare}
                />
              ))
            )}
          </Flex>
        )}

        <Flex paddingY={4} />

        {/* Show More Button */}
        {hasNextPage && (
          <Button
            colorScheme="purple"
            onClick={() => fetchNextPage()}
            isLoading={isFetchingNextPage}
          >
            Show More
          </Button>
        )}

        {!isLoadingMarkets && !hasNextPage && (
          <Text fontSize="sm" color="gray.400">
            No more markets to fetch.
          </Text>
        )}
      </Flex>
    </ChakraProvider>
  )
}