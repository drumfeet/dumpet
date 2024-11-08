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
  FormControl,
  FormHelperText,
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

  const fetchMarkets = async () => {
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
            borderRadius="md"
            width="100%"
            maxW="lg"
          >
            <FormControl>
              <FormHelperText fontSize="xs">Title</FormHelperText>
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Duration</FormHelperText>
              <Input
                placeholder="Duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Token TxId</FormHelperText>
              <Input
                placeholder="Token txid"
                value={tokenTxId}
                onChange={(e) => setTokenTxId(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Option A</FormHelperText>
              <Input
                placeholder="Option A"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Option B</FormHelperText>
              <Input
                placeholder="Option B"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
              />
            </FormControl>
            <Button
              width="100%"
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
            <Button width="100%" colorScheme="purple" onClick={fetchMarkets}>
              Fetch Markets
            </Button>

            <Button colorScheme="purple" w="100%">
              <Link target="_blank" rel="noopener noreferrer" href={"/c/"}>
                Creator Page{" "}
              </Link>
            </Button>
          </Flex>
        </Flex>
      </ChakraProvider>
    </>
  )
}
