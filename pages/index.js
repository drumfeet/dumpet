import { Button, ChakraProvider, Flex, Input } from "@chakra-ui/react"
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
const MODULE_ID = "bkjb55i07GUCUSWROtKK4HU1mBS_X0TyH3M5jMV6aPg"

export default function Home() {
  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState("")
  const [tokenTxId, setTokenTxId] = useState("")

  const createMarket2 = async () => {
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
    } catch (error) {
      console.error(error)
    }
  }

  const spawnProcess = async () => {
    try {
      const processId = await spawn({
        module: MODULE_ID,
        scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
        signer: createDataItemSigner(globalThis.arweaveWallet),
        tags: [
          {
            name: "Authority",
            value: "fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY",
          },
          { name: "AppName", value: "Dumpet" },
        ],
      })
      console.log("processId", processId)
    } catch (e) {
      console.error(e)
    }
  }

  const createMarket = async () => {}

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
              await createMarket2()
              button.disabled = false
            }}
          >
            Create
          </Button>
          <Button
            onClick={async (event) => {
              const button = event.target
              button.disabled = true
              await spawnProcess()
              button.disabled = false
            }}
          >
            Spawn
          </Button>
        </Flex>
      </ChakraProvider>
    </>
  )
}
