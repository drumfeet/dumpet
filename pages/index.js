import AppHeader from "@/components/AppHeader"
import { useAppContext } from "@/context/AppContext"
import { Button, ChakraProvider, Flex, useToast, Text } from "@chakra-ui/react"
import { dryrun } from "@permaweb/aoconnect"
import { Link } from "arnext"
import { useEffect, useState } from "react"

const MAIN_PROCESS_ID = "yC4kFwIGERjmLx5qSxEa0MX87sFuqRDFbWUqEedVOZo"

export default function Home() {
  const toast = useToast()
  const [markets, setMarkets] = useState([])
  const [randomMarket, setRandomMarket] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [nextPage, setNextPage] = useState(1)

  const { handleMessageResultError } = useAppContext()

  useEffect(() => {
    ;(async () => {
      await fetchRandomMarket()
      await fetchMarkets()
    })()
  }, [])

  async function fetchMarkets(nextPage = 1) {
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

      // Append new markets to the existing list
      setMarkets((prevMarkets) => [...prevMarkets, ...jsonData.Markets])

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
      if (handleMessageResultError(_result)) return
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      console.log("jsonData", jsonData)
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

        <Link target="_blank" rel="noopener noreferrer" href="/create">
          <Flex
            w="100%"
            maxW="800px"
            bg="purple.500" // Vibrant purple for the banner
            p={4}
            borderRadius="md"
            align="center"
            justify="center"
          >
            <Text fontSize="lg" fontWeight="bold" textAlign="center">
              CREATE DUMB BET
            </Text>
          </Flex>
        </Link>

        <Flex paddingY={4}></Flex>

        {randomMarket && (
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={`/tx/${randomMarket.ProcessId}`}
          >
            <Flex
              flexDirection="column"
              gap={2}
              w="250px"
              border="1px solid"
              borderColor="purple.700"
              paddingX={4}
              paddingY={8}
              borderRadius="md"
              textAlign="center"
            >
              <Text fontSize="md" fontWeight="bold" color="purple.300">
                {randomMarket?.Title}
              </Text>
              <Text fontSize="sm">{randomMarket?.OptionA}</Text>
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
              <Text fontSize="sm">{randomMarket?.OptionB}</Text>
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
        )}

        <Flex paddingY={4}></Flex>

        {markets && markets.length > 0 && (
          <>
            <Flex wrap="wrap" justify="center" gap={4} maxW="1200px">
              {markets.map((market, index) => (
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`/tx/${market.ProcessId}`}
                  key={index}
                >
                  <Flex
                    flexDirection="column"
                    gap={2}
                    w="250px"
                    border="1px solid"
                    borderColor="purple.700"
                    paddingX={4}
                    paddingY={8}
                    borderRadius="md"
                    textAlign="center"
                  >
                    <Text fontSize="md" fontWeight="bold" color="purple.300">
                      {market.Title}
                    </Text>
                    <Text fontSize="sm">{market.OptionA}</Text>
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
                    <Text fontSize="sm">{market.OptionB}</Text>
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
              ))}
            </Flex>
          </>
        )}

        <Flex paddingY={4}></Flex>

        {hasMore && (
          <Button
            colorScheme="purple"
            onClick={async () => {
              await fetchMarkets(nextPage)
            }}
          >
            Fetch More
          </Button>
        )}

        {!hasMore && (
          <Text fontSize="sm" color="gray.400">
            No more markets to fetch.
          </Text>
        )}

        <Flex paddingY={8}></Flex>
      </Flex>
    </ChakraProvider>
  )
}
