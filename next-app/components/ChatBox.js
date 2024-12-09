import {
  Button,
  ChakraProvider,
  Flex,
  FormControl,
  FormHelperText,
  Input,
  Text,
  VStack,
  Box,
  useToast,
} from "@chakra-ui/react";
import {
  createDataItemSigner,
  message,
  result,
  dryrun,
} from "@permaweb/aoconnect";
import { useState, useEffect, useRef } from "react";

const CHAT_PROCESS_ID = "kfjNgT4R0vQaRgho2aSMSbJgB8xqvQL_1__yIsE_fp8";
const POLLING_INTERVAL = 20000; // 20 seconds

export default function ChatBox() {
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const toast = useToast();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial fetch and polling setup
  useEffect(() => {
    const fetchMessages = async () => {
      await get();
    };

    // Initial fetch
    fetchMessages();

    // Set up polling
    const interval = setInterval(fetchMessages, POLLING_INTERVAL);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  const post = async () => {
    if (!chatMsg.trim()) return;
    
    setIsLoading(true);
    try {
      const messageId = await message({
        process: CHAT_PROCESS_ID,
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
      });

      const _result = await result({
        message: messageId,
        process: CHAT_PROCESS_ID,
      });

      // Clear input and refresh messages
      setChatMsg("");
      await get();
      
      toast({
        title: "Message sent",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error sending message",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const get = async (nextPage = 1, limit = 50) => {
    try {
      const result = await dryrun({
        process: CHAT_PROCESS_ID,
        tags: [
          { name: "Action", value: "List" },
          { name: "Page", value: nextPage.toString() },
          { name: "Limit", value: limit.toString() },
        ],
      });
      
      const _jsonData = JSON.parse(result?.Messages[0]?.Data);
      setMessages(_jsonData.messages || []);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching messages",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      post();
    }
  };

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
        <Flex
          direction={{ base: "column", md: "row" }}
          maxW="1200px"
          align="stretch"
          justify="center"
          width="100%"
          flex={1}
          gap={4}
        >
          {/* Chat Messages Section */}
          <Flex
            direction="column"
            width={{ base: "100%", md: "70%" }}
            bg="purple.800"
            borderRadius="md"
            p={4}
          >
            <Text fontSize="xl" mb={4}>Chat</Text>
            
            {/* Messages Container */}
            <VStack
              flex={1}
              overflowY="auto"
              spacing={4}
              align="stretch"
              maxHeight="60vh"
              mb={4}
              css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'purple.500',
                  borderRadius: '24px',
                },
              }}
            >
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  bg="#2d2d44"
                  p={3}
                  borderRadius="md"
                  alignSelf={msg.sender === globalThis.arweaveWallet?.getActiveAddress() ? "flex-end" : "flex-start"}
                  maxWidth="80%"
                >
                  <Text fontSize="xs" color="purple.300" mb={1}>
                    {msg.sender?.slice(0, 8)}...{msg.sender?.slice(-8)}
                  </Text>
                  <Text>{msg.content}</Text>
                  <Text fontSize="xs" color="gray.400" mt={1}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Text>
                </Box>
              ))}
              <div ref={chatEndRef} />
            </VStack>

            {/* Input Section */}
            <FormControl>
              <Input
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
              mt={4}
              colorScheme="purple"
              onClick={post}
              isLoading={isLoading}
              loadingText="Sending..."
            >
              Send Message
            </Button>
          </Flex>

          {/* Right Pane - Could be used for online users, settings, etc. */}
          <Flex
            direction="column"
            width={{ base: "100%", md: "30%" }}
            bg="purple.800"
            borderRadius="md"
            p={4}
          >
            <Text fontSize="xl" mb={4}>Online Users</Text>
            <Text color="gray.400">
              This panel could be used for showing online users, chat settings, or other features
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </ChakraProvider>
  );
}