import { Link, useParams } from "arnext"
import { useEffect, useState } from "react"
import {
  createDataItemSigner,
  spawn,
  message,
  result,
  results,
  dryrun,
} from "@permaweb/aoconnect"
import {
  Button,
  ChakraProvider,
  Flex,
  useToast,
  Text,
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Box,
  IconButton,
  Spinner,
} from "@chakra-ui/react"
import AppHeader from "@/components/AppHeader"
import { useAppContext } from "@/context/AppContext"
import ShareIcon from "@/components/icons/ShareIcon"
import Head from "next/head"
import { MAIN_PROCESS_ID, USERTX_PROCESS_ID } from "@/context/AppContext"

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" }
}

const getID = async (id, pid) => `${pid ?? id}`

export async function getStaticProps({ params: { id } }) {
  return { props: { pid: await getID(id) } }
}

export default function Home({ _id = null }) {
  const toast = useToast()
  const { id } = useParams()
  const [pid, setPid] = useState(_id)
  const [isPending, setIsPending] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userMarkets, setUserMarkets] = useState([])
  const [userTransactions, setUserTransactions] = useState([])
  const { handleMessageResultError, connectWallet } = useAppContext()

  useEffect(() => {
    ;(async () => {
      _id ?? setPid(await getID(id, _id))
    })()
  }, [id])

  useEffect(() => {
    if (pid) {
      ;(async () => {
        await fetchMarkets()
      })()
    }
  }, [pid])

  const hasWaitFor = async () => {
    try {
      const _result = await dryrun({
        process: MAIN_PROCESS_ID,
        tags: [
          { name: "Action", value: "HasWaitFor" },
          {
            name: "ProfileId",
            value: pid, // user wallet address
          },
        ],
      })
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      setIsPending(jsonData.HasWaitFor)
      toast({
        description: jsonData.HasWaitFor
          ? "You have a pending market creation"
          : "No pending market creation",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    } catch (error) {
      console.error(error)
    }
  }

  const resetWaitFor = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }

    try {
      const messageId = await message({
        process: MAIN_PROCESS_ID,
        tags: [
          {
            name: "Action",
            value: "ResetWaitFor",
          },
        ],
        signer: createDataItemSigner(globalThis.arweaveWallet),
      })
      console.log("messageId", messageId)

      const _result = await result({
        message: messageId,
        process: MAIN_PROCESS_ID,
      })
      console.log("_result", _result)
      if (handleMessageResultError(_result)) return

      const jsonData = _result?.Messages[0]?.Data
      console.log("jsonData", jsonData)
      await hasWaitFor()
      toast({
        description: jsonData,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    } catch (error) {
      console.error(error)
    }
  }

  const fetchMarkets = async () => {
    setIsLoading(true)
    console.log("fetchMarkets")
    try {
      const _result = await dryrun({
        process: MAIN_PROCESS_ID,
        tags: [
          { name: "Action", value: "Creator" },
          {
            name: "ProfileId",
            value: pid,
          },
        ],
      })
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      console.log("fetchMarkets jsonData", jsonData)
      setUserMarkets(jsonData?.Markets)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUser = async () => {
    setIsLoading(true)
    console.log("fetchUser")
    try {
      const _result = await dryrun({
        process: USERTX_PROCESS_ID,
        tags: [
          { name: "Action", value: "User" },
          {
            name: "ProfileId",
            value: pid,
          },
        ],
      })
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      console.log("fetchUser jsonData", jsonData)
      setUserTransactions(jsonData?.Markets)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ChakraProvider>
      <Head>
        <title>dumpet.fun</title>
        <meta name="description" content="Popularity contest duel platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href=".././favicon.ico" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="dumpet.fun" />
        <meta
          name="twitter:description"
          content="Popularity contest duel platform"
        />
        <meta
          name="twitter:image"
          content="https://arweave.net/cdWaWLoAhyO-0gZdH97TzqzmMSpHMEoXWbGBBXMED1M"
        />

        {/* Open Graph / Facebook Meta Tags */}
        <meta property="og:url" content="https://dumpet.fun" />
        <meta property="og:title" content="dumpet.fun" />
        <meta
          name="og:description"
          content="Popularity contest duel platform"
        />
        <meta
          name="og:image"
          content="https://arweave.net/cdWaWLoAhyO-0gZdH97TzqzmMSpHMEoXWbGBBXMED1M"
        />
      </Head>
      <Flex
        direction="column"
        align="center"
        p={4}
        bg="#1a1a2e" // Dark purple background
        minHeight="100vh"
        color="white"
      >
        <AppHeader />
        <Flex paddingY={8}></Flex>

        <Flex
          flexDirection="column"
          gap={4}
          align="center"
          borderRadius="md"
          width="100%"
          maxW="lg"
        >
          <Flex paddingY={4}></Flex>
          {isPending && (
            <Text color="red.500">You have a pending market creation</Text>
          )}
          <Button
            width="100%"
            colorScheme="purple"
            bg="#7023b6"
            onClick={async (event) => {
              const button = event.target
              try {
                button.disabled = true
                await hasWaitFor()
                await fetchMarkets()
              } catch (error) {
                console.error(error)
              } finally {
                button.disabled = false
              }
            }}
          >
            Check Pending Market
          </Button>

          <Button
            width="100%"
            colorScheme="purple"
            background="none"
            border="1px solid"
            borderColor="purple.600"
            onClick={async (event) => {
              const button = event.target
              try {
                button.disabled = true
                await resetWaitFor()
              } catch (error) {
                console.error(error)
              } finally {
                button.disabled = false
              }
            }}
          >
            Reset Pending Market
          </Button>

          <Flex paddingY={8}></Flex>
          <Flex justifyContent="flex-end" w="100%" alignItems="center">
            <IconButton
              icon={<ShareIcon strokeColor="#FFFFFF7A" size={24} />}
              colorScheme="whiteAlpha"
              variant="ghost"
              aria-label="Share"
              onClick={() => {
                const text = `Check out this profile on dumpet.fun - `
                const url = window.location.href
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  text
                )}&url=${encodeURIComponent(url)}`
                window.open(twitterUrl, "_blank")
              }}
            />
          </Flex>
          <Tabs
            isFitted
            colorScheme="purple"
            variant="line"
            w="100%"
            onChange={async (index) => {
              if (index === 0) {
                await fetchMarkets()
              } else if (index === 1) {
                await fetchUser()
              }
            }}
          >
            <TabList>
              <Tab>Created</Tab>
              <Tab>Transacted</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
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
                {!isLoading && userMarkets?.length > 0 ? (
                  <Flex direction="column" width="100%" maxW="lg">
                    <Text fontSize="xs" color="gray.400" paddingBottom={2}>
                      MARKET PROCESS ID
                    </Text>
                    {userMarkets.map((record, index) => (
                      <Flex
                        w="100%"
                        maxW="100%"
                        key={index}
                        alignItems="center"
                        justify="space-between"
                        py={2}
                        px={{ base: 0, md: 4 }}
                        _hover={{ bg: "#3e3e5e" }}
                      >
                        <Flex
                          alignItems="center"
                          overflow="hidden" // Ensures truncation works
                          flex="1"
                          mr={2} // Spacing between text and button
                        >
                          <Link
                            href={`/market/${record?.MarketProcessId}`}
                            style={{ width: "100%" }}
                          >
                            <Text
                              color="whiteAlpha.800"
                              textDecoration="underline"
                              _hover={{ cursor: "pointer" }}
                              textUnderlineOffset={5}
                              isTruncated
                              noOfLines={1}
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                            >
                              {record?.Title}
                            </Text>
                          </Link>
                        </Flex>
                        <IconButton
                          icon={<ShareIcon strokeColor="#FFFFFF7A" size={14} />}
                          colorScheme="whiteAlpha"
                          variant="ghost"
                          aria-label="Share"
                          onClick={() => {
                            const text = `Check out this market on dumpet.fun - `
                            const url =
                              window.location.origin +
                              `/market/${record?.MarketProcessId}`
                            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                              text
                            )}&url=${encodeURIComponent(url)}`
                            window.open(twitterUrl, "_blank")
                          }}
                        />
                      </Flex>
                    ))}
                  </Flex>
                ) : (
                  !isLoading && <Text color="#7023b6">No market found</Text>
                )}
              </TabPanel>
              <TabPanel>
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
                {!isLoading && userTransactions?.length > 0 ? (
                  <Flex direction="column" width="100%" maxW="lg">
                    <Text fontSize="xs" color="gray.400" paddingBottom={2}>
                      MARKET PROCESS ID
                    </Text>
                    {userTransactions?.map((record, index) => (
                      <Flex
                        w="100%"
                        maxW="100%"
                        key={index}
                        alignItems="center"
                        justify="space-between"
                        py={2}
                        px={{ base: 0, md: 4 }}
                        _hover={{ bg: "#3e3e5e" }}
                      >
                        <Flex
                          alignItems="center"
                          overflow="hidden" // Ensures truncation works
                          flex="1"
                          mr={2} // Spacing between text and button
                        >
                          <Link
                            href={`/market/${record?.MarketProcessId}`}
                            style={{ width: "100%" }}
                          >
                            <Text
                              color="whiteAlpha.800"
                              textDecoration="underline"
                              _hover={{ cursor: "pointer" }}
                              textUnderlineOffset={5}
                              isTruncated
                              noOfLines={1}
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                            >
                              {record?.Title}
                            </Text>
                          </Link>
                        </Flex>
                        <IconButton
                          icon={<ShareIcon strokeColor="#FFFFFF7A" size={14} />}
                          colorScheme="whiteAlpha"
                          variant="ghost"
                          aria-label="Share"
                          onClick={() => {
                            const text = `Check out this market on dumpet.fun - `
                            const url =
                              window.location.origin +
                              `/market/${record?.MarketProcessId}`
                            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                              text
                            )}&url=${encodeURIComponent(url)}`
                            window.open(twitterUrl, "_blank")
                          }}
                        />
                      </Flex>
                    ))}
                  </Flex>
                ) : (
                  !isLoading && (
                    <Text color="#7023b6">No transaction found</Text>
                  )
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>

        <Flex paddingY={8}></Flex>
      </Flex>
    </ChakraProvider>
  )
}
