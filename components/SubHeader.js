import { Button, ChakraProvider, Flex, useToast } from "@chakra-ui/react"
import { Link } from "arnext"
import TelegramIcon from "./icons/TelegramIcon"
import TwitterIcon from "./icons/TwitterIcon"
import { useAppContext } from "@/context/AppContext"
import { createDataItemSigner, message, result } from "@permaweb/aoconnect"
import TrophyIcon from "./icons/TrophyIcon"

const DUMPET_TOKEN_TXID = "QD3R6Qes15eQqIN_TK5s7ttawzAiX8ucYI2AUXnuS18"

export default function SubHeader() {
  const { connectWallet, handleMessageResultError } = useAppContext()
  const toast = useToast()

  const airdrop = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }

    try {
      const messageId = await message({
        process: DUMPET_TOKEN_TXID,
        tags: [
          {
            name: "Action",
            value: "Airdrop",
          },
        ],
        signer: createDataItemSigner(globalThis.arweaveWallet),
      })
      console.log("messageId", messageId)

      const _result = await result({
        message: messageId,
        process: DUMPET_TOKEN_TXID,
      })
      console.log("_result", _result)
      if (handleMessageResultError(_result)) return

      toast({
        description: "You received an airdrop",
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
    <ChakraProvider>
      <Flex
        justify="space-between"
        w="100%"
        // maxW="1200px"
        paddingY={4}
        paddingX={[0, 8]}
        align="center"
      >
        <Flex
          gap={{ base: "4", md: "4" }}
          justifyContent="center"
          alignItems="center"
        >
          <Link target="_blank" rel="noopener noreferrer" href="/faq">
            <Button variant="link" colorScheme="purple">
              FAQ
            </Button>
          </Link>

          <Button variant="link" colorScheme="purple" onClick={airdrop}>
            Airdrop
          </Button>

          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="/leaderboard"
          >
            <TrophyIcon strokeColor="#9F7AEA" size={18} />
          </Link>

          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://t.me/dumpetdotfun"
          >
            <TelegramIcon strokeColor="#9F7AEA" size={18} />
          </Link>

          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://x.com/dumpetdotfun"
          >
            <TwitterIcon strokeColor="#9F7AEA" size={18} />
          </Link>
        </Flex>
      </Flex>
    </ChakraProvider>
  )
}
