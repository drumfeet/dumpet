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
  Text,
  Box,
} from "@chakra-ui/react"
import {
  createDataItemSigner,
  message,
  result,
  dryrun,
} from "@permaweb/aoconnect"
import { Link } from "arnext"
import { useEffect, useState } from "react"
import AppHeader from "@/components/AppHeader"
import WalletIcon from "@/components/icons/WalletIcon"
import UserIcon from "@/components/icons/UserIcon"

const MAIN_PROCESS_ID = "yC4kFwIGERjmLx5qSxEa0MX87sFuqRDFbWUqEedVOZo"

export default function Home() {
  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState(() => {
    const defaultDuration = new Date()
    defaultDuration.setHours(defaultDuration.getHours() + 48) // Add 48 hours
    const year = defaultDuration.getFullYear()
    const month = String(defaultDuration.getMonth() + 1).padStart(2, "0") // Months are 0-indexed
    const day = String(defaultDuration.getDate()).padStart(2, "0")
    const hours = String(defaultDuration.getHours()).padStart(2, "0")
    const minutes = String(defaultDuration.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}` // Format without seconds
  })

  const [tokenTxId, setTokenTxId] = useState(
    "fzkhRptIvW3tJ7Dz7NFgt2DnZTJVKnwtzEOuURjfXrQ"
  )
  const [optionA, setOptionA] = useState("")
  const [optionB, setOptionB] = useState("")
  const [isPending, setIsPending] = useState(false)
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

  useEffect(() => {
    ;(async () => {
      if (isConnected) {
        await hasWaitFor()
      }
    })()
  }, [isConnected])

  const hasWaitFor = async (pid = null) => {
    if (pid === null) return

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
      console.log("hasWaitFor() _result", _result)
      if (handleMessageResultError(_result)) return
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      console.log("hasWaitFor() jsonData", jsonData)
      setIsPending(jsonData.HasWaitFor)
    } catch (error) {
      console.error(error)
    }
  }

  const createMarket = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }

    try {
      const durationTimestamp = isNaN(new Date(duration).getTime())
        ? null
        : new Date(duration).getTime()
      console.log("durationTimestamp", durationTimestamp)

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
            value: durationTimestamp.toString(),
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

      await hasWaitFor(_connected.userAddress)
      toast({
        title: "Pending market creation",
        description: "View your profile to see the list of markets you created",
        status: "success",
        duration: 5000,
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
          <Flex paddingY={8}></Flex>

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
                borderColor="#98A2B3"
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
                size="md"
                type="datetime-local"
                value={duration}
                onChange={(e) => {
                  console.log("onChange Duration", e.target.value)
                  setDuration(e.target.value)
                }}
                borderColor="#98A2B3"
                bg="#2d2d44"
                color="white"
                focusBorderColor="#7023b6"
                _placeholder={{ color: "gray.400" }}
                sx={{
                  "&::-webkit-calendar-picker-indicator": {
                    color: "white", // Change icon color
                    filter: "invert(1)", // Optional: invert for light/dark mode
                  },
                  "&::-webkit-datetime-edit": {
                    color: "white", // Adjust text color inside input
                  },
                }}
              />
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Token TxId</FormHelperText>
              <Input
                placeholder="Token txid"
                value={tokenTxId}
                onChange={(e) => setTokenTxId(e.target.value)}
                borderColor="#98A2B3"
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
                borderColor="#98A2B3"
                bg="#2d2d44"
                color="white"
                focusBorderColor="#7023b6"
                _placeholder={{ color: "gray.400" }}
              />
              <Flex paddingTop={4} justifyContent="center">
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
              <FormHelperText fontSize="xs">Option B</FormHelperText>
              <Input
                placeholder="Option B"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                borderColor="#98A2B3"
                bg="#2d2d44"
                color="white"
                focusBorderColor="#7023b6"
                _placeholder={{ color: "gray.400" }}
              />
            </FormControl>
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
            <Flex paddingY={2}></Flex>

            {isConnected ? (
              <>
                {isPending && (
                  <Text color="red.500">
                    You have a pending market creation
                  </Text>
                )}
                <Box width="100%">
                  <Link href={`/profile/${userAddress}`} passHref>
                    <Button
                      width="100%"
                      colorScheme="purple"
                      bg="#7023b6"
                      rightIcon={<UserIcon />}
                    >
                      View My Profile
                    </Button>
                  </Link>
                </Box>
              </>
            ) : (
              <>
                <Button
                  rightIcon={<WalletIcon />}
                  width="100%"
                  colorScheme="purple"
                  bg="#7023b6"
                  onClick={async () => {
                    await connectWallet()
                  }}
                >
                  Connect Wallet
                </Button>
              </>
            )}

            {/* {isConnected &&
              typeof userAddress === "string" &&
              userAddress.length > 0 && <></>} */}
          </Flex>

          <Flex paddingY={8}></Flex>
        </Flex>
      </ChakraProvider>
    </>
  )
}
