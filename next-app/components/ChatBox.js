import {
  Button,
  ChakraProvider,
  Flex,
  FormControl,
  FormHelperText,
  Input,
} from "@chakra-ui/react"
import {
  createDataItemSigner,
  message,
  result,
  dryrun,
} from "@permaweb/aoconnect"
import { useState } from "react"

const CHAT_PROCESS_ID = "kfjNgT4R0vQaRgho2aSMSbJgB8xqvQL_1__yIsE_fp8"

export default function ChatBox() {
  const [chatMsg, setChatMsg] = useState("")
  const post = async () => {
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
      })
      console.log("messageId", messageId)

      const _result = await result({
        message: messageId,
        process: CHAT_PROCESS_ID,
      })
      console.log("_result", _result)
    } catch (error) {
      console.error(error)
    }
  }

  const get = async (nextPage = 1, limit = 10) => {
    try {
      const result = await dryrun({
        process: CHAT_PROCESS_ID,
        tags: [
          { name: "Action", value: "List" },
          { name: "Page", value: nextPage.toString() },
          { name: "Limit", value: limit.toString() },
        ],
      })
      console.log("result", result)
      const _jsonData = JSON.parse(result?.Messages[0]?.Data)
      console.log("_jsonData", _jsonData)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <ChakraProvider>
        <Flex
          direction="column"
          align="center"
          p={4}
          bg="#1a1a2e"
          minHeight="100vh"
          color="white"
          flex={1}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            flex={1}
            maxW="1200px"
            align="stretch"
            justify="center"
            padding="4"
            p={4}
            bg="#1a1a2e"
            minHeight="100vh"
            color="white"
            width="100%"
          >
            {/* Left Pane Section */}
            <Flex
              marginTop={{ base: "20", md: "0" }}
              direction="column"
              width={{ base: "100%", md: "50%" }}
              padding="4"
              bgColor="purple.800"
              borderRadius={{ base: "md", md: "small" }}
            >
              <Flex
                direction="column"
                paddingX={{ base: "4", md: "8" }}
                paddingTop={{ base: "4", md: "0" }}
                paddingBottom={{ base: "4", md: "8" }}
                mb="8"
              >
                {/* ChatBox Section */}
                <Flex paddingY={{ base: "8", md: "4" }}></Flex>
                <FormControl>
                  <FormHelperText fontSize="xs" color="gray.400">
                    Chat
                  </FormHelperText>
                  <Input
                    placeholder="What do you think?"
                    _placeholder={{ color: "gray.400" }}
                    onChange={(e) => setChatMsg(e.target.value)}
                    focusBorderColor="#7023b6"
                    bg="#2d2d44"
                    borderColor="#2d2d44"
                    borderRadius="none"
                    value={chatMsg}
                  />
                </FormControl>
                <Flex paddingY={2}></Flex>
                <Button
                  marginTop="4"
                  colorScheme="purple"
                  onClick={async (event) => {
                    const button = event.target
                    button.disabled = true
                    await post()
                    button.disabled = false
                  }}
                >
                  Post
                </Button>
                <Flex paddingY={2}></Flex>
                <Button
                  variant="outline"
                  border="2px solid"
                  borderColor="purple.700"
                  color="white"
                  _hover={{ bg: "purple.700" }}
                  colorScheme="purple"
                  onClick={async (event) => {
                    const button = event.target
                    button.disabled = true
                    await get()
                    button.disabled = false
                  }}
                >
                  Get
                </Button>
              </Flex>
            </Flex>

            {/* Right Pane Section */}
            <Flex
              direction="column"
              width={{ base: "100%", md: "50%" }}
              paddingX="4"
            >
              <Flex direction="column">This is the right pane</Flex>
            </Flex>
          </Flex>
        </Flex>
      </ChakraProvider>
    </>
  )
}
