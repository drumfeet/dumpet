import { Button, ChakraProvider, Flex } from "@chakra-ui/react"
import { Link } from "arnext"
import TelegramIcon from "./icons/TelegramIcon"
import TwitterIcon from "./icons/TwitterIcon"

export default function SubHeader() {
  const airdrop = async () => {
    console.log("airdrop")
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
