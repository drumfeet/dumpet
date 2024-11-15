import { useAppContext } from "@/context/AppContext"
import {
  Button,
  ChakraProvider,
  Flex,
  Input,
  useToast,
  FormControl,
  FormHelperText,
  Heading,
} from "@chakra-ui/react"
import { createDataItemSigner, message, result } from "@permaweb/aoconnect"
import { Link } from "arnext"
import { useState } from "react"
import AppHeader from "@/components/AppHeader"

const MAIN_PROCESS_ID = "yC4kFwIGERjmLx5qSxEa0MX87sFuqRDFbWUqEedVOZo"

export default function Home() {
  const [title, setTitle] = useState("sample title")
  const [duration, setDuration] = useState("11")
  const [tokenTxId, setTokenTxId] = useState(
    "fzkhRptIvW3tJ7Dz7NFgt2DnZTJVKnwtzEOuURjfXrQ"
  )
  const [optionA, setOptionA] = useState("This is sample option A")
  const [optionB, setOptionB] = useState("This is sample option B")
  const toast = useToast()

  const {
    connectWallet,
    disconnectWallet,
    isConnected,
    setIsConnected,
    userAddress,
    setUserAddress,
    handleMessageResultError,
  } = useAppContext()

  const createMarket = async () => {
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
            value: "Create",
          },
          {
            name: "Title",
            value: title,
          },
          {
            name: "Duration",
            value: duration,
          },
          {
            name: "TokenTxId",
            value: tokenTxId,
          },
          {
            name: "OptionA",
            value: optionA,
          },
          {
            name: "OptionB",
            value: optionB,
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

      toast({
        title: "Pending market creation",
        description: "View your profile to see the list of markets you created",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    } catch (error) {
      console.error(error)
      toast({
        description: error.message,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    }
  }

  return (
    <>
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

          <Flex
            flexDirection="column"
            gap={4}
            align="center"
            borderRadius="md"
            width="100%"
            maxW="lg"
          >
            <Heading as="h1" size="lg" textAlign="center">
              Create Market
            </Heading>
            <Flex paddingY={4}></Flex>

            <FormControl>
              <FormHelperText fontSize="xs">Title</FormHelperText>
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                bg="#2d2d44" // Slightly lighter than the page background
                color="white" // White text for contrast
                focusBorderColor="#7023b6" // Vibrant purple border on focus
                _placeholder={{ color: "gray.400" }}
              />
            </FormControl>

            <FormControl>
              <FormHelperText fontSize="xs">Duration</FormHelperText>
              <Input
                placeholder="Duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                bg="#2d2d44"
                color="white"
                focusBorderColor="#7023b6"
                _placeholder={{ color: "gray.400" }}
              />
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Token TxId</FormHelperText>
              <Input
                placeholder="Token txid"
                value={tokenTxId}
                onChange={(e) => setTokenTxId(e.target.value)}
                bg="#2d2d44"
                color="white"
                focusBorderColor="#7023b6"
                _placeholder={{ color: "gray.400" }}
              />
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Option A</FormHelperText>
              <Input
                placeholder="Option A"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                bg="#2d2d44"
                color="white"
                focusBorderColor="#7023b6"
                _placeholder={{ color: "gray.400" }}
              />
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Option B</FormHelperText>
              <Input
                placeholder="Option B"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                bg="#2d2d44"
                color="white"
                focusBorderColor="#7023b6"
                _placeholder={{ color: "gray.400" }}
              />
            </FormControl>
            <Flex paddingY={4}></Flex>
            <Button
              width="100%"
              colorScheme="purple"
              bg="#7023b6" // Primary purple
              onClick={async (event) => {
                const button = event.target
                button.disabled = true
                await createMarket()
                button.disabled = false
              }}
            >
              Create
            </Button>
            {isConnected &&
              typeof userAddress === "string" &&
              userAddress.length > 0 && (
                <Button width="100%" colorScheme="purple">
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`/profile/${userAddress}`}
                  >
                    View Profile
                  </Link>
                </Button>
              )}
          </Flex>
        </Flex>
      </ChakraProvider>
    </>
  )
}
