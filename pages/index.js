import { Button, ChakraProvider, Flex, Input, useToast } from "@chakra-ui/react"
import {
  createDataItemSigner,
  spawn,
  message,
  result,
  results,
  dryrun,
} from "@permaweb/aoconnect"
import { useState } from "react"

const MAIN_PROCESS_ID = "4WxCo_-ieXMemQ9eByvSyeowC1MNZnHIDK4xkAuxCy0"

export default function Home() {
  const [title, setTitle] = useState("sample title")
  const [duration, setDuration] = useState("11")
  const [tokenTxId, setTokenTxId] = useState("0xtest12345")
  const toast = useToast()

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

  return (
    <>
      <ChakraProvider>
        <Flex flexDirection="column" gap={2}>
          <Input placeholder="Title" />
          <Input placeholder="Duration" />
          <Input placeholder="Token txid" />
          {/* Profile Image */}
          {/* Links to Socials */}
          <Button
            onClick={async (event) => {
              const button = event.target
              button.disabled = true
              await createMarket()
              button.disabled = false
            }}
          >
            Create
          </Button>
          <Button onClick={fetchRecords}>Fetch Records</Button>
        </Flex>
      </ChakraProvider>
    </>
  )
}
