import { ChakraProvider, Divider, Flex, Text } from "@chakra-ui/react"
import { Link } from "arnext"
import TelegramIcon from "./icons/TelegramIcon"
import TwitterIcon from "./icons/TwitterIcon"
import LoginModal from "./LoginModal"

export default function AppHeader() {
  return (
    <ChakraProvider>
      {/* <Flex w="full" justify="space-between" align="center" paddingX={[0, 8]}> */}
      <Flex
        justify="space-between"
        w="100%"
        // maxW="1200px"
        paddingY={4}
        paddingX={[0, 8]}
        align="center"
      >
        <Link href="/">
          <Text fontSize="2xl" color="purple.400" fontWeight="bold">
            dumpet
          </Text>
        </Link>
        <Flex gap={4} alignItems="center">
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

          <Flex paddingX={[0, 2]}></Flex>

          <LoginModal />
        </Flex>
      </Flex>
      <Divider borderColor="purple.400" />
      <Flex paddingY={8}></Flex>
    </ChakraProvider>
  )
}
