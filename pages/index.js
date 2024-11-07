import { Button, ChakraProvider, Flex, Input } from "@chakra-ui/react"
import {
  createDataItemSigner,
  spawn,
  message,
  result,
  dryrun,
} from "@permaweb/aoconnect"

export default function Home() {
  const createMarket = async () => {
    console.log("createMarket")
  }

  return (
    <>
      <ChakraProvider>
        <Flex flexDirection="column">
          <Input placeholder="Title" />
          <Input placeholder="Duration" />
          <Input placeholder="Token txid" />
          {/* Profile Image */}
          {/* Links to Socials */}
          <Button onClick={createMarket}>Create Bet</Button>
        </Flex>
      </ChakraProvider>
    </>
  )
}
