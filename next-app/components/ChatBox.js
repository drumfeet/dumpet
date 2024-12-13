import { useAppContext } from "@/context/AppContext"
import {
  Button,
  ChakraProvider,
  Flex,
  FormControl,
  Text,
  VStack,
  Box,
  useToast,
  Textarea,
} from "@chakra-ui/react"
import {
  createDataItemSigner,
  message,
  result,
  dryrun,
} from "@permaweb/aoconnect"
import { useState, useEffect, useRef } from "react"
import areArraysEqual from "@/utils/AreArrayEquals"
import { ArrowRightIcon, ChatIcon } from "@chakra-ui/icons"

const POLLING_INTERVAL = 5000

export default function ChatBox({ pid = null }) {
  const [chatId, setChatId] = useState(pid)
  const [chatMsg, setChatMsg] = useState("")
  const [messages, setMessages] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const messagesRef = useRef([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const chatEndRef = useRef(null)
  const toast = useToast()
  const { connectWallet } = useAppContext()

  useEffect(() => {
    const fetchMessages = async () => {
      // Only fetch the first page during polling
      if (currentPage === 1) {
        await get()
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, POLLING_INTERVAL)
    return () => clearInterval(interval)
  }, [currentPage])

  const post = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }
    if (!chatMsg.trim()) return

    setIsLoading(true)

    try {
      const messageId = await message({
        process: chatId,
        tags: [
          {
            name: "Action",
            value: "AddChat",
          },
          {
            name: "ChatMsg",
            value: chatMsg,
          },
        ],
        signer: createDataItemSigner(globalThis.arweaveWallet),
      })

      const _result = await result({
        message: messageId,
        process: chatId,
      })

      setChatMsg("")
      await get()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error sending message",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const get = async (nextPage = 1, limit = 10) => {
    try {
      const result = await dryrun({
        process: chatId,
        tags: [
          { name: "Action", value: "List" },
          { name: "Page", value: nextPage.toString() },
          { name: "Limit", value: limit.toString() },
          { name: "Order", value: "desc" },
        ],
      })
      if (result?.Messages[0]?.Data) {
        const _jsonData = JSON.parse(result?.Messages[0]?.Data)
        setHasMore(_jsonData.HasMore)

        if (nextPage === 1) {
          if (!areArraysEqual(_jsonData.Chats, messagesRef.current)) {
            setMessages(_jsonData.Chats || [])
            messagesRef.current = _jsonData.Chats || []
          }
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            ...(_jsonData.Chats || []),
          ])
          messagesRef.current = [
            ...messagesRef.current,
            ...(_jsonData.Chats || []),
          ]
        }
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error fetching messages",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleLoadMore = async () => {
    try {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      setIsLoadingMore(true)
      await get(nextPage)
      setIsLoadingMore(false)
    } catch (error) {
      toast({
        title: "Error retrieving more messages",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      post()
    }
  }

  return (
    <ChakraProvider>
      <Flex
        direction="column"
        w="100%"
        h="100%"
        bg="#1a1a2e"
        minH="100vh"
        color="white"
      >
        <Flex
          direction="column"
          w="100%"
          h="100%"
          flex={1}
          bg="purple.800"
          borderRadius={{ base: "0", md: "md" }}
          p={4}
        >
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            <ChatIcon /> Chat
          </Text>
          <FormControl>
            <Textarea
              placeholder="Type your message..."
              _placeholder={{ color: "gray.400" }}
              onChange={(e) => setChatMsg(e.target.value)}
              onKeyPress={handleKeyPress}
              value={chatMsg}
              focusBorderColor="#7023b6"
              bg="#2d2d44"
              borderColor="#2d2d44"
              borderRadius="md"
            />
          </FormControl>

          <Button
            leftIcon={<ArrowRightIcon />}
            mt={4}
            w="100%"
            variant="outline"
            border="2px solid"
            borderColor="purple.700"
            color="white"
            _hover={{ bg: "purple.700" }}
            colorScheme="purple"
            onClick={post}
            isLoading={isLoading}
            loadingText="Sending..."
          >
            Send Message
          </Button>
          <Flex paddingY={4}></Flex>

          <VStack
            flex={1}
            w="100%"
            overflowY="auto"
            spacing={4}
            align="stretch"
            maxH="calc(100vh - 200px)"
            mb={4}
            css={{
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "purple.500",
                borderRadius: "24px",
              },
            }}
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                p={3}
                alignSelf={
                  msg.UserId === globalThis.arweaveWallet?.getActiveAddress()
                    ? "flex-end"
                    : "flex-start"
                }
                maxWidth="100%"
              >
                <Text fontSize="xs" color="purple.300" mb={1}>
                  {msg.UserId?.slice(0, 8)}...{msg.UserId?.slice(-8)}
                </Text>
                <Text>{msg.ChatMsg}</Text>
                <Text fontSize="xs" color="gray.400" mt={1}>
                  {new Date(msg.Timestamp).toLocaleTimeString()}
                </Text>
              </Box>
            ))}
            {hasMore && (
              <Flex justify="center" mb={4}>
                <Button
                  onClick={handleLoadMore}
                  isLoading={isLoadingMore}
                  loadingText="Loading..."
                  size="sm"
                  colorScheme="purple"
                >
                  Show More
                </Button>
              </Flex>
            )}
            <div ref={chatEndRef} />
          </VStack>
        </Flex>
      </Flex>
    </ChakraProvider>
  )
}
