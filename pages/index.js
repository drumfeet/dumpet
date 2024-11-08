import TelegramIcon from "@/components/icons/TelegramIcon"
import TwitterIcon from "@/components/icons/TwitterIcon"
import UserIcon from "@/components/icons/UserIcon"
import { useAppContext } from "@/context/AppContext"
import {
  Button,
  ChakraProvider,
  Divider,
  Flex,
  Input,
  useToast,
  Text,
} from "@chakra-ui/react"
import {
  createDataItemSigner,
  spawn,
  message,
  result,
  results,
  dryrun,
} from "@permaweb/aoconnect"
import { Link } from "arnext"
import { useState } from "react"

const MAIN_PROCESS_ID = "4WxCo_-ieXMemQ9eByvSyeowC1MNZnHIDK4xkAuxCy0"

export default function Home() {
  const [title, setTitle] = useState("sample title")
  const [duration, setDuration] = useState("11")
  const [tokenTxId, setTokenTxId] = useState("0xtest12345")
  const toast = useToast()

  const {
    connectWallet,
    disconnectWallet,
    isConnected,
    setIsConnected,
    userAddress,
    setUserAddress,
  } = useAppContext()

  const handleMessageResultError = (_result) => {
    const errorTag = _result?.Messages?.[0]?.Tags.find(
      (tag) => tag.name === "Error"
    )
    console.log("errorTag", errorTag)
    if (errorTag) {
      toast({
        description: _result.Messages[0].Data,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
      return true
    }
    return false
  }

  const createMarket = async () => {
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
    } catch (error) {
      console.error(error)
    }
  }

  const fetchRecords = async () => {
    try {
      const result = await dryrun({
        process: MAIN_PROCESS_ID,
        tags: [{ name: "Action", value: "List" }],
      })

      console.log(result.Messages[0])
      const jsonData = JSON.parse(result.Messages[0].Data)
      console.log(jsonData)
    } catch (error) {
      console.error(error)
    }
  }

  const login = async () => {
    try {
      const _connected = await connectWallet()
      if (_connected.success === false) {
        return
      }
      toast({
        description: "Wallet connected!",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <ChakraProvider>
        <Flex
          flexDirection="column"
          alignItems="center"
          p={5}
          bg="#f3f0fa"
          minH="100vh"
        >
          <Flex
            w="full"
            justify="space-between"
            align="center"
            paddingX={[0, 8]}
          >
            <Text fontSize="3xl" color="#7023b6" fontWeight="bold">
              Dumpet
            </Text>
            <Flex gap={4} alignItems="center">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://t.me/dumpetdotfun"
              >
                <TelegramIcon strokeColor="#7023b6" size={18} />
              </Link>

              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://x.com/dumpetdotfun"
              >
                <TwitterIcon strokeColor="#7023b6" size={18} />
              </Link>

              <Flex paddingX={[0, 2]}></Flex>

              <Flex
                _hover={{ cursor: "pointer" }}
                onClick={async (event) => {
                  const button = event.target
                  button.disabled = true
                  await login()
                  button.disabled = false
                }}
              >
                <UserIcon strokeColor="#7023b6" size={34} />
              </Flex>
            </Flex>
          </Flex>
          <Divider />
          <Flex paddingY={8}></Flex>

          <Flex
            flexDirection="column"
            gap={4}
            align="center"
            // bg="white"
            borderRadius="md"
            width="100%"
            maxW="lg"
          >
            <Input placeholder="Title" />
            <Input placeholder="Duration" />
            <Input placeholder="Token txid" />
            {/* Profile Image */}
            {/* Links to Socials */}
            <Button
              width="100%"
              maxW="lg"
              colorScheme="purple"
              onClick={async (event) => {
                const button = event.target
                button.disabled = true
                await createMarket()
                button.disabled = false
              }}
            >
              Create
            </Button>
            <Button
              width="100%"
              maxW="lg"
              colorScheme="purple"
              onClick={fetchRecords}
            >
              Fetch Records
            </Button>

            <Flex width="100%">
              <Link target="_blank" rel="noopener noreferrer" href={"/c/"}>
                <Button colorScheme="purple">Creator Page</Button>
              </Link>
            </Flex>
          </Flex>
        </Flex>
      </ChakraProvider>
    </>
  )
}
